(function() {
    'use strict';

    const WIDGET_FIELD_PREFIX = 'widgets';
    const ORG_CHART_TEXT = 'Org Chart';
    const INJECTED_CONTAINER_ID = 'injected-widget-container';

    // --- STATE VARIABLES ---
    let injectionData = null; // Holds the fetched widget data for the current profile
    let isFetching = false; // Prevents multiple simultaneous fetch requests
    let currentProfileId = null; // Tracks the ID of the profile we're currently handling

    /**
     * Attempts to inject the widget if the data is ready and the anchor point exists.
     * This function remains unchanged as its logic is sound.
     */
    function tryInjectWidget() {
        const orgChartHeader = Array.from(document.querySelectorAll('h3')).find(h3 => h3.textContent.trim() === ORG_CHART_TEXT);
        if (!orgChartHeader || !orgChartHeader.parentElement) {
            return;
        }

        if (document.getElementById(INJECTED_CONTAINER_ID)) {
            return;
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
     * Fetches all necessary data for a specific profile ID.
     * @param {string} profileId The user ID to fetch data for.
     */
    async function fetchAndPrepareData(profileId) { // Accepts profileId as an argument
        if (isFetching) return;
        isFetching = true;

        console.log(`🚀 Staffbase Injector: Fetching data for user ID: ${profileId}...`);
        try {
            const [userResponse, widgetsResponse] = await Promise.all([
                fetch(`/api/users/${profileId}`),
                fetch('/api/widgets')
            ]);
            if (!userResponse.ok || !widgetsResponse.ok) throw new Error("API request failed");

            const userProfileData = await userResponse.json();
            const widgetsListData = (await widgetsResponse.json()).data;
            const widgetFieldName = Object.keys(userProfileData.profile || {}).find(key => key.startsWith(WIDGET_FIELD_PREFIX) || key === 'widget');

            if (!widgetFieldName) {
                console.log(`🟡 Staffbase Injector: No widget field found for ${profileId}. No action needed.`);
                // We don't disconnect the observer, because the user might navigate to another profile that *does* have a widget.
                return;
            }

            const widgetConfig = JSON.parse(userProfileData.profile[widgetFieldName]);
            const widgetIdentifier = widgetConfig.widgetName.includes('.') ? widgetConfig.widgetName.split('.')[1] : widgetConfig.widgetName;
            const widgetData = widgetsListData.find(widget => widget.elements.includes(widgetIdentifier));

            if (!widgetData) {
                console.error(`🔴 Staffbase Injector: Could not find data for widget "${widgetIdentifier}".`);
                return;
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

        } catch (error) {
            console.error('🔴 Staffbase Injector: An error occurred during data fetching.', error);
        } finally {
            isFetching = false; // Reset fetching flag in finally block
        }
    }

    /**
     * Checks for URL changes to handle SPA navigation.
     */
    function handleNavigation() {
        const pathParts = window.location.pathname.split('/');
        const newProfileId = pathParts.length > 2 ? pathParts[2] : null;

        // If we are on a valid profile page and it's different from the one we've processed
        if (newProfileId && newProfileId !== currentProfileId) {
            console.log(`🔄 Staffbase Injector: Navigation detected. New profile: ${newProfileId}`);

            // 1. Update the state
            currentProfileId = newProfileId;

            // 2. Reset previous data
            injectionData = null;
            isFetching = false;

            // 3. Clean up the old widget from the DOM
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

    // Observer 1: Handles DOM changes (e.g., when profile content loads).
    const domObserver = new MutationObserver(() => {
        if (injectionData) { // Only try to inject if data is ready for the current page
            tryInjectWidget();
        }
    });

    // Observer 2: Handles SPA navigation by watching for page title changes.
    const navigationObserver = new MutationObserver(handleNavigation);

    // Start observing the body for content changes.
    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Start observing the <title> element for navigation changes.
    const titleElement = document.querySelector('title');
    if (titleElement) {
        navigationObserver.observe(titleElement, { childList: true });
    }

    // Initial run on page load.
    handleNavigation();

    console.log("👀 Staffbase Injector: Observers started. Ready for action.");
})();