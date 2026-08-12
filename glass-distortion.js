/* =========================================================================
   glass-distortion.js
   Injects the SVG <filter id="glass-distortion"> that the glassmorphism CSS
   references via backdrop-filter: ... url(#glass-distortion).

   Why JS is needed: Chrome only resolves an SVG filter reference when the
   <svg> element actually exists in the same DOM tree — it ignores filters
   referenced from a CSS data-URI. The nav lives in the top document while
   the page widgets (welcome, quicklinks) render inside shadow roots, so the
   filter has to be injected into the document AND every shadow root. A
   debounced MutationObserver re-injects after SPA navigations / re-renders.

   Load this globally on the page (e.g. custom head/JS), then the CSS works.
   Tune the warp: baseFrequency = ripple size, scale = warp strength.
   ========================================================================= */
(function () {
  var SVG =
    '<svg data-glass-svg width="0" height="0" aria-hidden="true"' +
    ' style="position:absolute;width:0;height:0;overflow:hidden">' +
    '<defs><filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="2" seed="92" result="noise"/>' +
    '<feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="blurred" scale="55" xChannelSelector="R" yChannelSelector="G"/>' +
    '</filter></defs></svg>';

  function makeNode() {
    var d = document.createElement('div');
    d.innerHTML = SVG;
    return d.firstChild;
  }

  function inject(root) {
    try {
      if (!root || !root.querySelector) return;
      if (root.querySelector('svg[data-glass-svg]')) return;
      var host = root === document ? document.body : root;
      if (host) host.appendChild(makeNode());
    } catch (e) {}
  }

  function walk(root) {
    inject(root);
    var els = root.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      if (els[i].shadowRoot) walk(els[i].shadowRoot);
    }
  }

  function run() {
    if (!document.body) return;
    walk(document);
  }

  // debounce so we don't walk the tree on every SPA mutation
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      run();
    });
  }

  if (document.body) run();
  else document.addEventListener('DOMContentLoaded', run);

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
