(function fixLayoutBug() {
  // Find the wrapper element
  const wrapper = document.getElementById('wrapper');
  
  if (!wrapper) return;

  // Function to apply the fixes
  const applyFixes = () => {
    // 1. Force the wrapper to keep the width-fixing class
    if (wrapper.classList.contains('on-main-page') && !wrapper.classList.contains('is-content-document-page')) {
      wrapper.classList.add('is-content-document-page');
    }

    // 2. Optional: Remove the rogue 'selected' class from the sidebar
    if (wrapper.classList.contains('on-main-page')) {
      const selectedSidebarItem = document.querySelector('#sidebar .item.selected');
      if (selectedSidebarItem) {
        selectedSidebarItem.classList.remove('selected');
      }
    }
  };

  // Run once immediately in case the bug happens on first load
  applyFixes();

  // Create an observer to watch for the SPA router changing classes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // If the router messed with the classes, run our fix again
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // Disconnect temporarily so we don't trigger an infinite loop when adding our class
        observer.disconnect();
        applyFixes();
        // Reconnect after fixing
        observer.observe(wrapper, { attributes: true });
      }
    });
  });

  // Start watching the wrapper for class changes
  observer.observe(wrapper, { attributes: true });

  // Also listen for the browser 'back' button just to be safe
  window.addEventListener('popstate', () => {
    setTimeout(applyFixes, 50); // Slight delay to let the router finish first
  });

})();
