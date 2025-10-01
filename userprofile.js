(function() {
    'use strict';

    const WIDGET_FIELD_PREFIX = 'widgets';
    const ORG_CHART_TEXT = 'Org Chart';
    const INJECTED_CONTAINER_ID = 'injected-widget-container';

    // State variable to hold fetched data and prevent re-fetching
    let injectionData = null;
    // State flag to prevent multiple fetch requests
    let isFetching = false;

    const pathParts = window.location.pathname.split('/');
    const profileId = pathParts.length > 2 ? pathParts[2] : null;

    if (!profileId) {
        console.log("🔴 Staffbase Injector: Could not find profile ID.");
        return;
    }
    console.log(`⚙️ Staffbase Injector: Ready for user ID: ${profileId}`);

    /**
     * Attempts to inject the widget if the conditions are right.
     */
    function tryInjectWidget() {
        // Condition 1: Find our anchor point. If it's not there, do nothing.
        const orgChartHeader = document.querySelector(`h3:is(:first-child, :last-child, :only-child)`);
        if (!orgChartHeader || orgChartHeader.textContent.trim() !== ORG_CHART_TEXT || !orgChartHeader.parentElement) {
            return;
        }

        // Condition 2: Check if the widget is already injected. If so, do nothing.
        if (document.getElementById(INJECTED_CONTAINER_ID)) {
            return;
        }

        // If we have the data, inject it.
        if (injectionData) {
            console.log(`✨ Staffbase Injector: Anchor found and widget missing. Re-injecting...`);
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
     * Fetches all necessary data ONE TIME.
     */
    async function fetchAndPrepareData() {
        // Prevent this function from running more than once
        if (isFetching || injectionData) return;
        isFetching = true;

        console.log(`🚀 Staffbase Injector: Fetching required data...`);
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
                console.log("🟡 Staffbase Injector: No widget field found. Halting observer.");
                observer.disconnect(); // No widget to inject, so we can stop watching.
                return;
            }

            const widgetConfig = JSON.parse(userProfileData.profile[widgetFieldName]);
            const widgetIdentifier = widgetConfig.widgetName.includes('.') ? widgetConfig.widgetName.split('.')[1] : widgetConfig.widgetName;
            const widgetData = widgetsListData.find(widget => widget.elements.includes(widgetIdentifier));

            if (!widgetData) {
                 console.error(`🔴 Staffbase Injector: Could not find data for widget "${widgetIdentifier}". Halting.`);
                 observer.disconnect();
                 return;
            }

            // Store all needed data in our state variable
            injectionData = {
                config: widgetConfig,
                elementName: widgetData.elements[0],
                scriptUrl: widgetData.url,
            };

            // Load the widget's script file just once
            const scriptId = `script-for-${injectionData.elementName}`;
            if (!document.getElementById(scriptId)) {
                 const widgetScript = document.createElement('script');
                 widgetScript.src = injectionData.scriptUrl;
                 widgetScript.id = scriptId;
                 document.body.appendChild(widgetScript);
                 console.log(`✅ Staffbase Injector: Script for <${injectionData.elementName}> loaded.`);
            }

            console.log("✅ Staffbase Injector: Data fetched and ready.");
            // Now that data is ready, do an immediate injection attempt
            tryInjectWidget();

        } catch (error) {
            console.error('🔴 Staffbase Injector: An error occurred during data fetching.', error);
            observer.disconnect(); // Stop if fetching fails
        }
    }

    // --- Main Execution Logic ---

    // This single observer will handle everything.
    const observer = new MutationObserver(() => {
        // On any change, check if we're ready to inject.
        if (injectionData) {
            tryInjectWidget();
        }
    });

    // Start fetching data immediately.
    fetchAndPrepareData();

    // Start observing the entire document body for changes.
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log("👀 Staffbase Injector: Observer started. Waiting for anchor point and data...");

})();