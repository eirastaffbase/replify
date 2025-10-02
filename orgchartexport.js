(function() {
    'use strict';

    // --- CONFIGURATION ---
    const ANCHOR_TEXT = 'Org Chart';
    const EXPORT_BUTTON_CONTAINER_ID = 'org-chart-export-button-container';

    // --- STATE ---
    let currentProfileId = null;
    let isPageReadyForButton = false; // This state variable acts as the "gate" for injection.

    /**
     * Finds the anchor element ("Org Chart" header) on the page.
     * @returns {HTMLElement|null} The h3 element for the Org Chart section or null if not found.
     */
    function findAnchor() {
        return Array.from(document.querySelectorAll('h3')).find(h3 => h3.textContent.trim() === ANCHOR_TEXT) || null;
    }

    /**
     * Fetches the current profile's data. This serves as a timing gate to ensure the
     * profile page has loaded and is ready before we try to inject the button.
     * @param {string} profileId The user's profile ID.
     */
    async function prepareForButtonInjection(profileId) {
        try {
            const response = await fetch(`/api/users/${profileId}`);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            await response.json(); // We don't need the data, just confirmation of success.
            isPageReadyForButton = true; // Open the gate for the domObserver.
            console.log('[SB Org Exporter] ✨ Page is ready for button injection.');
        } catch (error) {
            console.error('[SB Org Exporter] 🔴 Failed to prepare for injection.', error);
            isPageReadyForButton = false; // Keep the gate closed on failure.
        }
    }

    /**
     * Attempts to inject the export button if the readiness gate is open and the anchor exists.
     */
    function tryInjectExportButton() {
        // 1. Only run if the readiness gate is open (set by prepareForButtonInjection).
        if (!isPageReadyForButton) {
            return;
        }

        // 2. Don't add a second button.
        if (document.getElementById(EXPORT_BUTTON_CONTAINER_ID)) {
            return;
        }

        // 3. Find the anchor point ("Org Chart" header).
        const anchor = findAnchor();
        if (!anchor) {
            return;
        }

        // 4. Create and inject the button.
        const buttonContainer = document.createElement('div');
        buttonContainer.id = EXPORT_BUTTON_CONTAINER_ID;
        buttonContainer.style.marginTop = '16px';
        buttonContainer.style.marginBottom = '24px';
        buttonContainer.className = 'px-[12px] md:px-[24px] lg-tablet:px-0';


        const exportButton = document.createElement('button');
        exportButton.type = 'button';
        exportButton.className = 'ds-button ds-button--secondary w-full min-h-[48px]';
        exportButton.onclick = handleOrgChartExportClick;

        const buttonContentSpan = document.createElement('span');
        buttonContentSpan.className = 'ds-button-content ds-button__content';
        buttonContentSpan.textContent = 'Export Org Chart';

        exportButton.appendChild(buttonContentSpan);
        buttonContainer.appendChild(exportButton);

        // Inject the button container AFTER the "Org Chart" header.
        anchor.insertAdjacentElement('afterend', buttonContainer);
        console.log('[SB Org Exporter] ✅ Button injected successfully after:', anchor);
    }

    /**
     * Handles URL changes to update state, clean up, and trigger the readiness check.
     */
    function handleNavigation() {
        const pathParts = window.location.pathname.split('/');
        const newProfileId = (pathParts[1] === 'profile' && pathParts[2]) ? pathParts[2] : null;

        if (newProfileId !== currentProfileId) {
            console.log(`[SB Org Exporter] 🔄 Navigation detected. New profile: ${newProfileId || 'None'}`);

            // 1. Clean up the old button.
            const oldButton = document.getElementById(EXPORT_BUTTON_CONTAINER_ID);
            if (oldButton) {
                oldButton.remove();
            }

            // 2. Reset state variables. This closes the injection gate.
            currentProfileId = newProfileId;
            isPageReadyForButton = false;

            // 3. If we are on a new profile, trigger the readiness check.
            if (newProfileId) {
                prepareForButtonInjection(newProfileId);
            }
        }
    }

    // --- MAIN EXECUTION LOGIC ---

    // Observer 1: Watches for DOM changes and tries to inject the button.
    const domObserver = new MutationObserver(tryInjectExportButton);

    // Observer 2: Watches for URL changes to manage state.
    const navigationObserver = new MutationObserver(handleNavigation);

    domObserver.observe(document.body, { childList: true, subtree: true });

    const titleElement = document.querySelector('title');
    if (titleElement) {
        navigationObserver.observe(titleElement, { childList: true });
    }

    // Initial run on page load.
    handleNavigation();

    console.log("👀 Staffbase Org Chart Exporter: Observers started. Ready for action.");

    // --- EXPORT HELPER FUNCTIONS ---

    /**
     * Orchestrates the entire export process when the button is clicked.
     * @param {Event} event The click event.
     */
    async function handleOrgChartExportClick(event) {
        const button = event.currentTarget;
        const buttonContent = button.querySelector('.ds-button__content');
        if (!button || !buttonContent) return;

        const originalText = buttonContent.textContent;
        button.disabled = true;
        buttonContent.textContent = 'Fetching all user data...';

        try {
            const allUsers = await fetchAllUsers();
            buttonContent.textContent = 'Processing & Sorting...';
            processAndDownloadCsv(allUsers);
        } catch (error) {
            console.error('[SB Org Exporter] 🔴 Failed to export org chart:', error);
            buttonContent.textContent = 'Error! Check console for details.';
            alert('Failed to export org chart. See the browser console (F12) for more information.');
        } finally {
            setTimeout(() => {
                button.disabled = false;
                buttonContent.textContent = originalText;
            }, 3000);
        }
    }

    /**
     * Fetches all users from the API, handling pagination.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of all user objects.
     */
    async function fetchAllUsers() {
        const API_LIMIT = 1000;
        let allUsers = [];

        console.log('[SB Org Exporter] ⏳ Starting user fetch...');
        const initialResponse = await fetch(`/api/users?limit=${API_LIMIT}&offset=0`);
        if (!initialResponse.ok) throw new Error(`API request failed with status ${initialResponse.status}`);

        const initialData = await initialResponse.json();
        allUsers = allUsers.concat(initialData.data);
        const totalUsers = initialData.total;

        console.log(`[SB Org Exporter] Fetched ${allUsers.length} of ${totalUsers} users.`);

        if (totalUsers > API_LIMIT) {
            const fetchPromises = [];
            for (let offset = API_LIMIT; offset < totalUsers; offset += API_LIMIT) {
                const promise = fetch(`/api/users?limit=${API_LIMIT}&offset=${offset}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`API request for offset ${offset} failed: ${res.status}`);
                        return res.json();
                    });
                fetchPromises.push(promise);
            }
            const results = await Promise.all(fetchPromises);
            results.forEach(page => allUsers = allUsers.concat(page.data));
        }

        console.log(`[SB Org Exporter] ✨ Finished fetching. Total users retrieved: ${allUsers.length}`);
        return allUsers;
    }

    /**
     * Processes the array of all users to build, sort, and trigger the CSV download.
     * @param {Array<Object>} allUsers - The complete list of user objects from the API.
     */
    function processAndDownloadCsv(allUsers) {
        if (!allUsers || allUsers.length === 0) {
            console.error("[SB Org Exporter] 🔴 No user data was provided to process.");
            return;
        }

        const userMap = new Map();
        allUsers.forEach(user => {
            if (user.externalID) userMap.set(user.externalID, user);
        });

        // Create an intermediate array of objects to make sorting easier
        const dataForSorting = [];
        allUsers.forEach(employee => {
            const managerExternalId = employee.profile?.system_manager;
            const manager = managerExternalId ? userMap.get(managerExternalId) : null;
            const getFullName = (user) => user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

            dataForSorting.push({
                user: getFullName(employee),
                manager: getFullName(manager)
            });
        });

        // Sort the data: first by manager's name, then by user's name
        dataForSorting.sort((a, b) => {
            const managerCompare = a.manager.localeCompare(b.manager);
            if (managerCompare !== 0) {
                return managerCompare; // Sort by manager name
            }
            return a.user.localeCompare(b.user); // If managers are same, sort by user name
        });

        // Convert the sorted data into the final CSV row format
        const csvRows = [["user", "manager"]]; // Headers
        dataForSorting.forEach(item => {
            csvRows.push([item.user, item.manager]);
        });

        downloadCsvForHierarchy(csvRows);
    }

    /**
     * Generates a CSV file from an array of rows and triggers a download.
     * @param {Array<Array<string>>} rows - An array of arrays, where the first inner array is the header.
     */
    function downloadCsvForHierarchy(rows) {
        const csvContent = rows.map(row => row.map(escapeCsvField).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const fileName = `staffbase_org_chart_${new Date().toISOString().slice(0, 10)}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`[SB Org Exporter] 🚀 CSV download initiated as ${fileName}.`);
    }

    /**
     * Escapes a string for use in a CSV file field.
     * @param {*} field The data to escape.
     * @returns {string} The CSV-safe string.
     */
    function escapeCsvField(field) {
        const str = String(field === null || field === undefined ? '' : field);
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
})();