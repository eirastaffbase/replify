
(function() {
    'use strict';

    // --- CONFIGURATION ---
    const WIDGET_FIELD_PREFIX = 'widgets';
    const ORG_CHART_TEXT = 'Org Chart';
    const INJECTED_CONTAINER_ID = 'injected-widget-container';
    const MAX_RETRIES = 2; // The number of times to retry fetching data after an initial failed attempt.
    const RETRY_DELAY_MS = 1500; // Wait 1.5 seconds between retries.

    // --- STATE VARIABLES ---
    let injectionData = null;
    let isFetching = false;
    let currentProfileId = null;

    /**
     * Helper function to create a delay.
     * @param {number} ms - Milliseconds to wait.
     * @returns {Promise<void>}
     */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Attempts to inject the widget if the data is ready and the anchor point exists.
     */
    function tryInjectWidget() {
        const orgChartHeader = Array.from(document.querySelectorAll('h3')).find(h3 => h3.textContent.trim() === ORG_CHART_TEXT);
        if (!orgChartHeader || !orgChartHeader.parentElement) {
            return; // Anchor not ready yet.
        }

        if (document.getElementById(INJECTED_CONTAINER_ID)) {
            return; // Widget already injected.
        }

        if (injectionData) {
            console.log(`✨ Staffbase Injector: Anchor found. Injecting widget for ${currentProfileId}.`);
            const orgChartContainer = orgChartHeader.parentElement;

            const newWidgetContainer = document.createElement('div');
            newWidgetContainer.id = INJECTED_CONTAINER_ID;
            newWidgetContainer.className = 'tablet:!border border-neutral-weak tablet:z-[60] tablet:px-40 tablet:py-32 tablet:rounded-6 overflow-hidden border-0 bg-neutral-surface p-[24px]';

            const customWidgetElement = document.createElement(injectionData.elementName);
            if (injectionData.config.attributes) {
                for (const [key, value] of Object.entries(injectionData.config.attributes)) {
                    customWidgetElement.setAttribute(key, value);
                }
            }
            const innerRenderDiv = document.createElement('div');
            innerRenderDiv.className = 'widget-card';
            customWidgetElement.appendChild(innerRenderDiv);
            newWidgetContainer.appendChild(customWidgetElement);
            orgChartContainer.insertAdjacentElement('beforebegin', newWidgetContainer);
            console.log(`✅ Staffbase Injector: Widget <${injectionData.elementName}> injected successfully.`);
        }
    }

    /**
     * Fetches all necessary data for a specific profile ID with a retry mechanism.
     * @param {string} profileId The user ID to fetch data for.
     */
    async function fetchAndPrepareData(profileId) {
        if (isFetching) return;
        isFetching = true;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                // Before any attempt, confirm we are still on the correct page.
                const currentUrlId = window.location.pathname.split('/')[2];
                if (currentUrlId !== profileId) {
                    console.log(`🟡 Staffbase Injector: URL changed during retry wait. Aborting fetch for old ID ${profileId}.`);
                    isFetching = false; // Reset flag as we are aborting this chain.
                    return; // Abort if user navigated away.
                }

                if (attempt > 0) {
                    console.log(`⏳ Staffbase Injector: Retrying fetch for ${profileId} (Attempt ${attempt})...`);
                } else {
                    console.log(`🚀 Staffbase Injector: Fetching data for user ID: ${profileId}...`);
                }

                const [userResponse, widgetsResponse] = await Promise.all([
                    fetch(`/api/users/${profileId}`),
                    fetch('/api/widgets')
                ]);

                if (!userResponse.ok || !widgetsResponse.ok) {
                    throw new Error(`API request failed: User status ${userResponse.status}, Widgets status ${widgetsResponse.status}`);
                }

                const userProfileData = await userResponse.json();
                const widgetsListData = (await widgetsResponse.json()).data;
                const widgetFieldName = Object.keys(userProfileData.profile || {}).find(key => key.startsWith(WIDGET_FIELD_PREFIX) || key === 'widget');

                if (!widgetFieldName) {
                    console.log(`🟡 Staffbase Injector: No widget field found for ${profileId}. No action needed.`);
                    isFetching = false; // Reset flag
                    return; // Success, no widget to inject
                }

                const widgetConfig = JSON.parse(userProfileData.profile[widgetFieldName]);
                const widgetIdentifier = widgetConfig.widgetName.includes('.') ? widgetConfig.widgetName.split('.')[1] : widgetConfig.widgetName;
                const widgetData = widgetsListData.find(widget => widget.elements.includes(widgetIdentifier));

                if (!widgetData) {
                    throw new Error(`Could not find data for widget "${widgetIdentifier}".`);
                }

                injectionData = {
                    config: widgetConfig,
                    elementName: widgetData.elements[0],
                    scriptUrl: widgetData.url,
                };

                const scriptId = `script-for-${injectionData.elementName}`;
                if (!document.getElementById(scriptId)) {
                    const widgetScript = document.createElement('script');
                    widgetScript.src = injectionData.scriptUrl;
                    widgetScript.id = scriptId;
                    document.body.appendChild(widgetScript);
                    console.log(`✅ Staffbase Injector: Script for <${injectionData.elementName}> loaded.`);
                }

                console.log(`✅ Staffbase Injector: Data ready for ${profileId}.`);
                tryInjectWidget();
                isFetching = false; // Reset on success
                return; // Exit the function successfully

            } catch (error) {
                console.warn(`🔴 Staffbase Injector: Attempt ${attempt + 1} of ${MAX_RETRIES + 1} failed for ${profileId}. Error:`, error.message);
                if (attempt < MAX_RETRIES) {
                    await wait(RETRY_DELAY_MS); // Wait before the next attempt
                } else {
                    console.error(`🔴 Staffbase Injector: All fetch attempts failed for ${profileId}. Giving up.`);
                }
            }
        }
        isFetching = false; // Ensure flag is always reset after all retries
    }

    /**
     * Checks for URL changes to handle SPA navigation.
     */
    function handleNavigation() {
        // CONFIRM we are on a profile page before proceeding.
        if (!window.location.pathname.includes('/profile/')) {
            return;
        }

        const pathParts = window.location.pathname.split('/');
        const newProfileId = pathParts.length > 2 ? pathParts[2] : null;

        if (newProfileId && newProfileId !== currentProfileId) {
            console.log(`🔄 Staffbase Injector: Navigation detected. New profile: ${newProfileId}`);

            // 1. Update state
            currentProfileId = newProfileId;

            // 2. Reset previous data
            injectionData = null;
            isFetching = false;

            // 3. Clean up old widget
            const oldWidget = document.getElementById(INJECTED_CONTAINER_ID);
            if (oldWidget) {
                oldWidget.remove();
                console.log("🧹 Staffbase Injector: Cleaned up old widget.");
            }

            // 4. Fetch data for the new profile
            fetchAndPrepareData(newProfileId);
        }
    }


    // --- MAIN EXECUTION LOGIC ---

    const domObserver = new MutationObserver(() => {
        if (injectionData) {
            tryInjectWidget();
        }
    });

    const navigationObserver = new MutationObserver(handleNavigation);

    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    const titleElement = document.querySelector('title');
    if (titleElement) {
        navigationObserver.observe(titleElement, {
            childList: true
        });
    }

    // Initial run on page load.
    handleNavigation();

    console.log("👀 Staffbase Injector: Observers started. Ready for action.");
})();