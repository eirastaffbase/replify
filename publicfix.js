(function runSiteFixes() {
  const HOMEPAGE_ID = "6a90476cb2342f25022c5592";

  const fixWrapper = () => {
    const wrapper = document.getElementById('wrapper');
    if (wrapper && wrapper.classList.contains('on-main-page')) {
      if (!wrapper.classList.contains('is-content-document-page')) {
        wrapper.classList.add('is-content-document-page');
      }
      const selectedSidebarItem = document.querySelector('#sidebar .item.selected');
      if (selectedSidebarItem) selectedSidebarItem.classList.remove('selected');
    }
  };

  const moveElement = () => {
    const element = document.querySelector('.public-login-hint');
    const sidebarList = document.querySelector('#sidebar .plugin-list');
    const page = document.querySelector('.page[data-installation-id]');
    
    if (!element || !sidebarList || !page) return;

    const isHomepage = page.getAttribute('data-installation-id') === HOMEPAGE_ID;

    if (isHomepage) {
      let targetRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
      if (!targetRow) {
        const shadowHost = document.querySelector('[data-testid="modern-page-shadow-host"]');
        if (shadowHost && shadowHost.shadowRoot) {
          targetRow = shadowHost.shadowRoot.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
        }
      }

      if (targetRow && targetRow.nextSibling !== element) {
        targetRow.parentNode.insertBefore(element, targetRow.nextSibling);
      }
    } else {
      if (element.parentNode !== sidebarList) {
        sidebarList.prepend(element);
      }
    }
  };

  const runAll = () => {
    fixWrapper();
    moveElement();
  };

  runAll();

  const observer = new MutationObserver(() => {
    runAll();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
})();
