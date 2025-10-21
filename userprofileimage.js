(function() {
    'use strict';

    // --- CONFIGURATION ---
    const IMAGE_FIELD_NAME = 'profileimage'; // The exact name of the profile field containing the image URL.
    const ORG_CHART_TEXT = 'Org Chart'; // The header text of the element to inject our image before.
    const INJECTED_CONTAINER_ID = 'injected-image-container';
    const MAX_RETRIES = 2; // The number of times to retry after the initial failed attempt.
    const RETRY_DELAY_MS = 1500; // Wait 1.5 seconds between retries.

    // --- STATE VARIABLES ---
    let injectionData = null; // Will now store { imageUrl: '...' }
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
     * Attempts to inject the image if the data is ready and the anchor point exists.
     */
    function tryInjectImage() {
        // --- MODIFIED SECTION ---
        // First, find the user profile widget to scope our search
        const profileWidget = document.querySelector('user-profile-widget');
        if (!profileWidget) {
            return; // Profile widget not ready
        }

        // Now, search for *any* element inside the widget that matches the text.
        // This is more robust than looking for just 'h2' or 'h3'.
        const orgChartHeader = Array.from(profileWidget.querySelectorAll('*')).find(el =>
            el.textContent.trim() === ORG_CHART_TEXT
        );
        // --- END OF MODIFIED SECTION ---

        if (!orgChartHeader || !orgChartHeader.parentElement) {
            return; // Anchor not ready yet.
        }

        if (document.getElementById(INJECTED_CONTAINER_ID)) {
            return; // Image already injected.
        }

        if (injectionData && injectionData.imageUrl) {
            console.log(`✨ Staffbase Injector: Anchor found. Injecting image for ${currentProfileId}.`);

            // Find the parent "card" element that contains the header
            const orgChartContainer = orgChartHeader.parentElement;

            const newImageContainer = document.createElement('div');
            newImageContainer.id = INJECTED_CONTAINER_ID;
            // Using the same styling as the org chart's container for consistency.
            newImageContainer.className = 'tablet:!border border-neutral-weak tablet:z-[60] tablet:px-40 tablet:py-32 tablet:rounded-6 overflow-hidden border-0 bg-neutral-surface p-[24px]';

            const imageElement = document.createElement('img');
            imageElement.src = injectionData.imageUrl;

            // Add some basic styling to the image
            imageElement.style.width = '100%';
            imageElement.style.height = 'auto';
            imageElement.style.display = 'block';
            imageElement.style.borderRadius = '4px'; // A slight rounding of corners

            newImageContainer.appendChild(imageElement);

            // Inject the new image container *before* the org chart's container
            orgChartContainer.insertAdjacentElement('beforebegin', newImageContainer);
            console.log(`✅ Staffbase Injector: Image injected successfully.`);
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
                    isFetching = false;
                    return;
                }

                if (attempt > 0) {
                    console.log(`⏳ Staffbase Injector: Retrying fetch for ${profileId} (Attempt ${attempt})...`);
                } else {
                    console.log(`🚀 Staffbase Injector: Fetching data for user ID: ${profileId}...`);
                }

                const userResponse = await fetch(`/api/users/${profileId}`);

                if (!userResponse.ok) {
                    throw new Error(`API request failed: User status ${userResponse.status}`);
                }

                const userProfileData = await userResponse.json();
                const imageUrl = userProfileData.profile ? userProfileData.profile[IMAGE_FIELD_NAME] : null;

                console.log(userProfileData);

                if (!imageUrl) {
                    console.log(`🟡 Staffbase Injector: No '${IMAGE_FIELD_NAME}' field found or it is empty for ${profileId}. No action needed.`);
                    injectionData = { imageUrl: null }; // Set to null to prevent re-checking
                    isFetching = false;
                    return; // Success, nothing to inject
                }

                // Prepare the data for injection.
                injectionData = {
                    imageUrl: imageUrl
                };

                console.log(`✅ Staffbase Injector: Image URL found for ${profileId}.`);
                tryInjectImage(); // Attempt to inject immediately if the DOM is ready.
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
        if (!window.location.pathname.includes('/profile/')) {
            currentProfileId = null; // Reset profile ID when navigating away
            return;
        }

        const pathParts = window.location.pathname.split('/');
        const newProfileId = pathParts.length > 2 ? pathParts[2] : null;

        if (newProfileId && newProfileId !== currentProfileId) {
            console.log(`🔄 Staffbase Injector: Navigation detected. New profile: ${newProfileId}`);

            currentProfileId = newProfileId;
            injectionData = null;
            isFetching = false;

            const oldContainer = document.getElementById(INJECTED_CONTAINER_ID);
            if (oldContainer) {
                oldContainer.remove();
                console.log("🧹 Staffbase Injector: Cleaned up old image container.");
            }

            fetchAndPrepareData(newProfileId);
        }
    }

    // --- MAIN EXECUTION LOGIC ---

    const domObserver = new MutationObserver(() => {
        // Only try to inject if data is ready AND an image hasn't been injected yet.
        if (injectionData && !document.getElementById(INJECTED_CONTAINER_ID)) {
            tryInjectImage();
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

    console.log("👀 Staffbase Image Injector: Observers started. Ready for action.");
})();