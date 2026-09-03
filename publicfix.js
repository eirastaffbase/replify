(function runSiteFixes() {
  const HOMEPAGE_ID = "6a90476cb2342f25022c5592";
  const wrapper = document.getElementById('wrapper');
  if (!wrapper) return;

  // Cache the node in memory so React's SPA router cannot permanently destroy it
  let loginHintNode = document.querySelector('.public-login-hint');

  // --- 1. Fix the wrapper layout classes ---
  const fixWrapper = () => {
    if (wrapper.classList.contains('on-main-page') && !wrapper.classList.contains('is-content-document-page')) {
      wrapper.classList.add('is-content-document-page');
    }
    const selectedSidebarItem = document.querySelector('#sidebar .item.selected');
    if (selectedSidebarItem) selectedSidebarItem.classList.remove('selected');
  };

  // --- 2. Safely route the login hint node ---
  const handleLoginHint = () => {
    // If we haven't grabbed the node yet, try to grab it
    if (!loginHintNode) {
      loginHintNode = document.querySelector('.public-login-hint');
      if (!loginHintNode) return;
    }

    // Check if we are strictly on the homepage
    const currentPage = document.querySelector('.page[data-installation-id]');
    const isHomepage = currentPage && currentPage.getAttribute('data-installation-id') === HOMEPAGE_ID;

    if (isHomepage) {
      // Find the target row inside the Shadow DOM
      let targetRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
      if (!targetRow) {
        const shadowHost = document.querySelector('[data-testid="modern-page-shadow-host"]');
        if (shadowHost && shadowHost.shadowRoot) {
          targetRow = shadowHost.shadowRoot.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
        }
      }

      // If target exists and our node isn't already below it, move it there
      if (targetRow && targetRow.nextSibling !== loginHintNode) {
        targetRow.parentNode.insertBefore(loginHintNode, targetRow.nextSibling);
      }
    } else {
      // If we are NOT on the homepage, move the node back to the active sidebar
      const currentSidebarParent = document.querySelector('#sidebar .plugin-list');
      if (currentSidebarParent && loginHintNode.parentNode !== currentSidebarParent) {
        currentSidebarParent.prepend(loginHintNode);
      }
    }
  };

  // Run once on initial load
  fixWrapper();
  handleLoginHint();

  // --- 3. Global Mutation Observer ---
  // Watches the entire body so it triggers the instant React redraws a page
  const domObserver = new MutationObserver(() => {
    fixWrapper();
    handleLoginHint();
  });

  domObserver.observe(document.body, { 
    childList: true, 
    subtree: true, 
    attributes: true, 
    attributeFilter: ['class'] 
  });

})();
