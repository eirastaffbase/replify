(function runSiteFixes() {
  const HOMEPAGE_ID = '6a90476cb2342f25022c5592';

  // 1. Fix wrapper layout bug when navigating back
  const fixWrapper = () => {
    const wrapper = document.getElementById('wrapper');
    if (wrapper && wrapper.classList.contains('on-main-page')) {
      if (!wrapper.classList.contains('is-content-document-page')) {
        wrapper.classList.add('is-content-document-page');
      }
      const selectedSidebarItem = document.querySelector('#sidebar .item.selected');
      if (selectedSidebarItem) {
        selectedSidebarItem.classList.remove('selected');
      }
    }
  };

  // 2. Control login hint placement based on homepage ID
  const manageLoginHint = () => {
    const loginHint = document.querySelector('.public-login-hint');
    const sidebarList = document.querySelector('#sidebar .plugin-list');
    const activePage = document.querySelector('.page[data-installation-id]');

    if (!loginHint || !sidebarList) return;

    const isHomepage = activePage && activePage.getAttribute('data-installation-id') === HOMEPAGE_ID;

    if (isHomepage) {
      // Find quicklinks row in light DOM or Shadow DOM
      let targetRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
      if (!targetRow) {
        const shadowHost = document.querySelector('[data-testid="modern-page-shadow-host"]');
        if (shadowHost && shadowHost.shadowRoot) {
          targetRow = shadowHost.shadowRoot.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
        }
      }

      // Move below quicklinks if found
      if (targetRow && targetRow.nextSibling !== loginHint) {
        targetRow.parentNode.insertBefore(loginHint, targetRow.nextSibling);
      }
    } else {
      // Return node to sidebar on non-homepage views
      if (loginHint.parentNode !== sidebarList) {
        sidebarList.prepend(loginHint);
      }
    }
  };

  const runAllFixes = () => {
    fixWrapper();
    manageLoginHint();
  };

  runAllFixes();

  // Watch for SPA state changes and DOM updates
  const observer = new MutationObserver(() => {
    runAllFixes();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-installation-id']
  });
})();
