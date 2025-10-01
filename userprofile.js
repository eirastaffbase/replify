// ==UserScript==
// @name         Staffbase Profile Widget Injector (v1.7 - Final)
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Injects custom profile widgets with the correct DOM structure.
// @author       Gemini
// @match        https://app.staffbase.com/profile/*
// @grant        none
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    const WIDGET_FIELD_PREFIX = 'widgets';
    const ORG_CHART_TEXT = 'Org Chart';

    const pathParts = window.location.pathname.split('/');
    const profileId = pathParts.length > 2 ? pathParts[2] : null;

    if (!profileId) {
        console.log("🔴 Staffbase Injector: Could not find profile ID in URL. Script will not run.");
        return;
    }
    console.log(`⚙️ Staffbase Injector: Ready to inject widget for user ID: ${profileId}`);

    /**
     * Fetches data and injects the widget.
     * @param {HTMLElement} orgChartHeader The 'h3' element for the Org Chart section.
     */
    async function fetchDataAndInject(orgChartHeader) {
        console.log(`🚀 Staffbase Injector: Fetching required data...`);
        const userApiUrl = `/api/users/${profileId}`;
        const widgetsApiUrl = '/api/widgets';

        try {
            const [userResponse, widgetsResponse] = await Promise.all([
                fetch(userApiUrl),
                fetch(widgetsApiUrl)
            ]);

            if (!userResponse.ok || !widgetsResponse.ok) {
                console.error('🔴 Staffbase Injector: API request failed.', { user: userResponse.status, widgets: widgetsResponse.status });
                return;
            }

            const userProfileData = await userResponse.json();
            const widgetsListData = (await widgetsResponse.json()).data;
            console.log(`✅ Staffbase Injector: All data successfully fetched.`);

            if (!userProfileData.profile) {
                console.log("🟡 Staffbase Injector: No '.profile' object found. No widget to inject.");
                return;
            }

            const widgetFieldName = Object.keys(userProfileData.profile).find(key => key.startsWith(WIDGET_FIELD_PREFIX));
            if (!widgetFieldName) {
                console.log("🟡 Staffbase Injector: No widget field found in profile.");
                return;
            }

            const widgetFullName = userProfileData.profile[widgetFieldName];
            const widgetIdentifier = widgetFullName.includes('.') ? widgetFullName.split('.')[1] : widgetFullName;
            if (!widgetIdentifier) {
                console.error("🔴 Staffbase Injector: Could not parse widget identifier.");
                return;
            }
            console.log(`🔍 Staffbase Injector: Found widget identifier: "${widgetIdentifier}"`);

            const widgetData = widgetsListData.find(widget => widget.elements.includes(widgetIdentifier));
            if (!widgetData) {
                console.error(`🔴 Staffbase Injector: Could not find data for widget "${widgetIdentifier}".`);
                return;
            }

            const widgetElementName = widgetData.elements[0];
            const widgetScriptUrl = widgetData.url;
            console.log(`🔗 Staffbase Injector: Found widget script URL: ${widgetScriptUrl}`);

            const orgChartContainer = orgChartHeader.parentElement;
            if (!orgChartContainer) {
                console.error("🔴 Staffbase Injector: Could not find parent container of Org Chart.");
                return;
            }

            if (document.getElementById('gemini-injected-widget-container')) return;

            const newWidgetContainer = document.createElement('div');
            newWidgetContainer.id = 'gemini-injected-widget-container';
            newWidgetContainer.className = 'tablet:!border border-neutral-weak tablet:z-[60] tablet:px-40 tablet:py-32 tablet:rounded-6 overflow-hidden border-0 bg-neutral-surface p-[24px]';

            // --- FIX IS HERE ---
            // Create the <stock-ticker> element
            const customWidgetElement = document.createElement(widgetElementName);

            // Create the inner div that the widget's script will render its content into.
            const innerRenderDiv = document.createElement('div');
            innerRenderDiv.className = 'widget-card'; // This is the crucial part.
            customWidgetElement.appendChild(innerRenderDiv);

            // --- END FIX ---

            newWidgetContainer.appendChild(customWidgetElement);

            orgChartContainer.insertAdjacentElement('afterend', newWidgetContainer);
            console.log(`✅ Staffbase Injector: Injected <${widgetElementName}> container successfully.`);

            const widgetScript = document.createElement('script');
            widgetScript.src = widgetScriptUrl;
            widgetScript.onload = () => console.log(`✅ Staffbase Injector: Script for <${widgetElementName}> loaded.`);
            widgetScript.onerror = () => console.error(`🔴 Staffbase Injector: Failed to load script from ${widgetScriptUrl}.`);
            document.body.appendChild(widgetScript);

        } catch (error) {
            console.error('🔴 Staffbase Injector: An error occurred during the process.', error);
        }
    }

    // --- DOM Observer ---
    const observer = new MutationObserver((mutations, obs) => {
        const orgChartHeader = Array.from(document.querySelectorAll('h3'))
                                   .find(h => h.textContent.trim() === ORG_CHART_TEXT);

        if (orgChartHeader) {
            console.log(`👀 Staffbase Injector: '${ORG_CHART_TEXT}' section detected. Triggering injection.`);
            obs.disconnect();
            fetchDataAndInject(orgChartHeader);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();