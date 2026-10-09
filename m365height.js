(function () {
  'use strict';

  // The two blocks, by data-c13y-id.
  //   SOURCE = the M365 library (the one that gets taller)
  //   TARGET = the Topics column (the one whose bottom edge we match)
  // ⚠ These ids are per-instance. They will not carry to another environment.
  const SOURCE_ID = '3cf8709f-ca04-4559-a8a9-946cb963a7b6';
  const TARGET_ID = 'a29736c8-fe12-4369-ab92-a8dda53ebced';

  const MIN_HEIGHT = 320;   // don't shrink below the theme's smallest preset
  const TOLERANCE  = 2;     // px — ignore sub-pixel noise, else it oscillates

  // Page content lives in a shadow root, so querySelector on `document` finds
  // nothing. There are FOUR shadow hosts on this page — I counted them live —
  // so "the first div with a shadowRoot" is not good enough. Pick the root that
  // actually contains the block we're after.
  function getRoot() {
    for (const el of document.querySelectorAll('*')) {
      const sr = el.shadowRoot;
      if (sr && sr.querySelector(`[data-c13y-id="${SOURCE_ID}"]`)) return sr;
    }
    return null;
  }

  function sync(root) {
    const block  = root.querySelector(`[data-c13y-id="${SOURCE_ID}"]`);
    const target = root.querySelector(`[data-c13y-id="${TARGET_ID}"]`);
    if (!block || !target) return false;

    // The element that actually owns the height is the inner frame — it carries
    // h-[320px] / h-[400px] / h-[480px] responsive classes. Setting the height
    // on the outer block does nothing, because the frame won't grow into it.
    const frame = block.querySelector('[data-testid="m365-document-library-frame"]');
    if (!frame) return false;

    const blockRect  = block.getBoundingClientRect();
    const frameRect  = frame.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    if (!blockRect.height || !targetRect.height) return false;

    // Whatever sits below the frame but inside the block — the block's bottom
    // padding (p-4) and its border. Measured rather than hardcoded so it still
    // works if the padding changes.
    const chrome = blockRect.bottom - frameRect.bottom;

    const desired = Math.max(MIN_HEIGHT, Math.round(targetRect.bottom - frameRect.top - chrome));
    const current = Math.round(frameRect.height);

    if (Math.abs(desired - current) <= TOLERANCE) return true;

    frame.style.setProperty('height', desired + 'px', 'important');
    frame.style.setProperty('max-height', 'none', 'important');
    return true;
  }

  let scheduled = false;
  function schedule(root) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync(root);
    });
  }

  function start(root) {
    sync(root);

    // Re-sync when the target column changes size (images loading, text
    // wrapping at a new viewport width, tiles appearing).
    const target = root.querySelector(`[data-c13y-id="${TARGET_ID}"]`);
    if (target && window.ResizeObserver) {
      new ResizeObserver(() => schedule(root)).observe(target);
    }

    // Re-sync when the page re-renders. The M365 widget swaps its own innards
    // (loading -> loaded -> error), which blows away the inline height.
    new MutationObserver(() => schedule(root)).observe(root, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('resize', () => schedule(root));

    // Client-side nav means the script may outlive the page it ran on. Cheap
    // safety net: re-check every couple of seconds for the first 30s.
    let ticks = 0;
    const settle = setInterval(() => {
      if (++ticks > 15) return clearInterval(settle);
      schedule(root);
    }, 2000);
  }

  // The shadow root and the blocks inside it are not there on document-idle.
  // Poll for up to 20s, then give up quietly.
  let tries = 0;
  const wait = setInterval(() => {
    if (++tries > 100) return clearInterval(wait);
    const root = getRoot();
    if (!root) return;
    clearInterval(wait);
    start(root);
  }, 200);
})();
