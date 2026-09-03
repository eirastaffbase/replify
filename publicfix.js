(function runSiteFixes() {
  const HOMEPAGE_INSTALLATION_ID = "6a90476cb2342f25022c5592";

  // --- 1. Fix the wrapper layout bug ---
  const wrapper = document.getElementById('wrapper');
  if (wrapper) {
    const fixWrapper = () => {
      if (wrapper.classList.contains('on-main-page') && !wrapper.classList.contains('is-content-document-page')) {
        wrapper.classList.add('is-content-document-page');
      }
      const selectedSidebarItem = document.querySelector('#sidebar .item.selected');
      if (selectedSidebarItem) selectedSidebarItem.classList.remove('selected');
    };

    fixWrapper();
    const wrapperObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          wrapperObserver.disconnect();
          fixWrapper();
          wrapperObserver.observe(wrapper, { attributes: true });
        }
      });
    });
    wrapperObserver.observe(wrapper, { attributes: true });
  }

  // --- 2. Move the login hint only on the homepage ---
  const handleLoginHint = () => {
    const loginHint = document.querySelector('.public-login-hint');
    const sidebarPluginList = document.querySelector('#sidebar .plugin-list');
    const currentPage = document.querySelector('.page[data-installation-id]');
    
    if (!loginHint || !sidebarPluginList || !currentPage) return;

    const currentInstallId = currentPage.getAttribute('data-installation-id');
    const isHomepage = currentInstallId === HOMEPAGE_INSTALLATION_ID;

    if (isHomepage) {
      // Find the quicklinks row (checking Shadow DOM if needed)
      let targetRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
      if (!targetRow) {
        const shadowHost = document.querySelector('[data-testid="modern-page-shadow-host"]');
        if (shadowHost && shadowHost.shadowRoot) {
          targetRow = shadowHost.shadowRoot.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
        }
      }

      // Move it below quicklinks on the homepage
      if (targetRow && targetRow.nextSibling !== loginHint) {
        targetRow.parentNode.insertBefore(loginHint, targetRow.nextSibling);
      }
    } else {
      // Return it to the sidebar on any other page so CSS handles it
      if (loginHint.parentNode !== sidebarPluginList) {
        sidebarPluginList.prepend(loginHint);
      }
    }
  };

  handleLoginHint();

  // Observer to catch SPA page switches instantly
  const pageObserver = new MutationObserver(() => {
    handleLoginHint();
  });

  pageObserver.observe(document.body, { childList: true, subtree: true });
})();
