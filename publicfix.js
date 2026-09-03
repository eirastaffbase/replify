(function runSiteFixes() {
  // Find the wrapper element
  const wrapper = document.getElementById('wrapper');
  
  // Function to apply all fixes (layout, sidebar, and moving the login hint)
  const applyFixes = () => {
    // --- FIX 1: Restore the missing layout class ---
    if (wrapper && wrapper.classList.contains('on-main-page')) {
      if (!wrapper.classList.contains('is-content-document-page')) {
        wrapper.classList.add('is-content-document-page');
      }
      
      // --- FIX 2: Remove rogue 'selected' class from sidebar ---
      const selectedSidebarItem = document.querySelector('#sidebar .item.selected');
      if (selectedSidebarItem) {
        selectedSidebarItem.classList.remove('selected');
      }
    }

    // --- FIX 3: Move the login hint below the quicklinks ---
    const loginHint = document.querySelector('.public-login-hint');
    const quickLinksRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');

    // If both elements exist, and the login hint isn't already right after the quicklinks row
    if (loginHint && quickLinksRow && quickLinksRow.nextSibling !== loginHint) {
      quickLinksRow.parentNode.insertBefore(loginHint, quickLinksRow.nextSibling);
    }
  };

  // Run once immediately
  applyFixes();

  // Create an observer to watch for the SPA router changing classes on the wrapper
  if (wrapper) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Disconnect temporarily so we don't trigger an infinite loop
          observer.disconnect();
          applyFixes();
          // Reconnect after fixing
          observer.observe(wrapper, { attributes: true });
        }
      });
    });

    // Start watching the wrapper
    observer.observe(wrapper, { attributes: true });
  }

  // Also listen for the browser 'back' button and generic clicks to catch SPA routing
  window.addEventListener('popstate', () => setTimeout(applyFixes, 50));
  window.addEventListener('click', () => setTimeout(applyFixes, 100)); // Catches internal link clicks

})();
