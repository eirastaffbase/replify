(function runSiteFixes() {
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
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          observer.disconnect();
          fixWrapper();
          observer.observe(wrapper, { attributes: true });
        }
      });
    });
    observer.observe(wrapper, { attributes: true });
  }

  // --- 2. Move the login hint (No styles added) ---
  setInterval(() => {
    // Find the login hint ONLY if it is still inside the sidebar
    const loginHint = document.querySelector('#sidebar .public-login-hint');
    if (!loginHint) return;

    // Find the target row, checking inside the Shadow DOM if necessary
    let targetRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
    if (!targetRow) {
      const shadowHost = document.querySelector('[data-testid="modern-page-shadow-host"]');
      if (shadowHost && shadowHost.shadowRoot) {
        targetRow = shadowHost.shadowRoot.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
      }
    }

    // Move the element
    if (targetRow) {
      targetRow.parentNode.insertBefore(loginHint, targetRow.nextSibling);
    }
  }, 500);

})();
