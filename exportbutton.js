(function() {
    'use strict';

    // --- CONFIGURATION ---
    const ANCHOR_TEXT = 'Recent Posts';
    const EXPORT_BUTTON_CONTAINER_ID = 'profile-export-button-container';

    // --- STATE ---
    let currentProfileId = null;
    let userDataForButton = null; // Holds the fetched user data

    /**
     * Finds the new anchor element ("Recent Posts" container) on the page.
     */
    function findAnchor() {
        const recentPostsHeader = Array.from(document.querySelectorAll('h3')).find(h3 => h3.textContent.trim() === ANCHOR_TEXT);
        return recentPostsHeader ? recentPostsHeader.parentElement : null;
    }

    /**
     * Fetches user data when navigating to a profile page. The result is stored in state.
     * @param {string} profileId The user's profile ID.
     */
    async function fetchUserDataForButton(profileId) {
        try {
            const response = await fetch(`/api/users/${profileId}`);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            // Store the fetched data in our state variable. The domObserver will pick this up.
            userDataForButton = await response.json();
            console.log('[SB Exporter] ✨ User data fetched for button text:', userDataForButton);
        } catch (error) {
            console.error('[SB Exporter] 🔴 Failed to fetch user data for button.', error);
            // In case of failure, reset the data so we don't show a button with wrong/old info.
            userDataForButton = null;
        }
    }

    /**
     * Attempts to inject the export button if data is ready and the anchor exists.
     */
    function tryInjectExportButton() {
        // 1. Only run if we have successfully fetched the user's data.
        if (!userDataForButton) {
            return;
        }

        // 2. Don't add a second button.
        if (document.getElementById(EXPORT_BUTTON_CONTAINER_ID)) {
            return;
        }

        // 3. Find the anchor point ("Recent Posts" section).
        const anchor = findAnchor();
        if (!anchor) {
            return;
        }

        // 4. Create and inject the button with new styles.
        const buttonContainer = document.createElement('div');
        buttonContainer.id = EXPORT_BUTTON_CONTAINER_ID;
        // This container has no border and just provides spacing to match the page layout.
        buttonContainer.className = 'px-[12px] md:px-[24px] lg-tablet:px-0';

        const exportButton = document.createElement('button');
        exportButton.type = 'button';
        // Add classes for a larger button with more padding.
        exportButton.className = 'ds-button ds-button--secondary w-full min-h-[48px]';
        exportButton.onclick = () => handleExportClick(userDataForButton); // Pass the already-fetched data

        const buttonContentSpan = document.createElement('span');
        buttonContentSpan.className = 'ds-button-content ds-button__content';

        // Set the dynamic button text using the fetched first name.
        const firstName = userDataForButton.firstName || 'User';
        buttonContentSpan.textContent = `Export user data for ${firstName}`;

        exportButton.appendChild(buttonContentSpan);
        buttonContainer.appendChild(exportButton);

        // Inject the container BEFORE the "Recent Posts" section.
        anchor.insertAdjacentElement('beforebegin', buttonContainer);
        console.log('[SB Exporter] ✅ Button injected successfully before:', anchor);
    }

    /**
     * Handles URL changes to update the state, clean up, and trigger a new data fetch.
     */
    function handleNavigation() {
        const pathParts = window.location.pathname.split('/');
        const newProfileId = (pathParts[1] === 'profile' && pathParts[2]) ? pathParts[2] : null;

        if (newProfileId !== currentProfileId) {
            console.log(`[SB Exporter] 🔄 Navigation detected. New profile: ${newProfileId || 'None'}`);

            // 1. Clean up the old button.
            const oldButton = document.getElementById(EXPORT_BUTTON_CONTAINER_ID);
            if (oldButton) {
                oldButton.remove();
            }

            // 2. Reset state variables.
            currentProfileId = newProfileId;
            userDataForButton = null;

            // 3. If we are on a new profile, fetch the data for the button text.
            if (newProfileId) {
                fetchUserDataForButton(newProfileId);
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

    console.log("👀 Staffbase Exporter: Observers started. Ready for action.");


    // --- HELPER FUNCTIONS ---

    // This function is now simpler, as it receives the data directly.
    function handleExportClick(userData) {
        if (!userData) {
            console.error('[SB Exporter] 🔴 Export clicked, but user data is missing!');
            return;
        }
        console.log('[SB Exporter] 🚀 Exporting data for:', userData.displayName);
        downloadCsv(userData);
    }

    function downloadCsv(userData) {
        const flatData = flattenProfileData(userData);
        const userName = userData.displayName || userData.username || 'user';
        const fileName = `${userName.replace(/\s+/g, '_')}_profile_export.csv`;
        const csvRows = ['"Field","Value"'];
        for (const [key, value] of Object.entries(flatData)) {
            csvRows.push(`${escapeCsvField(key)},${escapeCsvField(value)}`);
        }
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function flattenProfileData(data) {
        const flatData = {};
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'profile' && typeof value !== 'object') {
                flatData[key] = value;
            }
        }
        if (data.profile) {
            for (const [key, value] of Object.entries(data.profile)) {
                flatData[key] = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value;
            }
        }
        return flatData;
    }

    function escapeCsvField(field) {
        const str = String(field === null || field === undefined ? '' : field);
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
})();