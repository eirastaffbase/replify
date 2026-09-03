(function runSiteFixes() {
  // --- FIX 1: Restore the missing layout class on the wrapper ---
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

  // --- FIX 2: Move the Login Hint & Style It (Handles Async & Shadow DOM) ---
  setInterval(() => {
    // 1. Find the login hint only if it's currently stuck in the sidebar
    const loginHint = document.querySelector('#sidebar .public-login-hint');
    if (!loginHint) return; // If it's not there, it's already moved or doesn't exist yet

    // 2. Look for the target quicklinks row
    let targetRow = document.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
    let inShadowDom = false;

    // 3. If it's not in the normal DOM, pierce the Shadow DOM to find it
    if (!targetRow) {
      const shadowHost = document.querySelector('[data-testid="modern-page-shadow-host"]');
      if (shadowHost && shadowHost.shadowRoot) {
        targetRow = shadowHost.shadowRoot.getElementById('d45e5e96-e719-4e84-b40d-aeac2eac2c4c');
        inShadowDom = true;
      }
    }

    // 4. If we found the target row, move the box!
    if (targetRow) {
      targetRow.parentNode.insertBefore(loginHint, targetRow.nextSibling);

      // 5. Apply the CSS directly. (Global CSS stylesheets cannot penetrate 
      //    a Shadow DOM, so we must apply your button styles via JS here).
      loginHint.style.marginTop = '24px';
      
      const btn = loginHint.querySelector('button.positive#public-login-hint');
      if (btn) {
        btn.style.backgroundColor = '#ffffff';
        btn.style.color = 'rgb(4, 85, 110)';
        btn.style.fontWeight = 'bold';
        btn.style.border = '2px solid rgb(4, 85, 110)';
        btn.style.borderRadius = '6px';
      }
      
      const desc = loginHint.querySelector('p.description');
      if (desc) {
        desc.style.color = 'rgb(4, 85, 110)';
      }
    }
  }, 500); // This checks every half-second so it catches the row the exact moment it loads

})();
