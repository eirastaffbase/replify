/* ============================================================================
   bimbo-newnav-multibrand.js   (v1.0)   — deploy in Global JS
   ----------------------------------------------------------------------------
   Works like the Hill's script: brands the NEW UX / c13y nav
   (data-c13y-region="header") for ONE group and leaves everyone else — Grupo
   Bimbo parent included — untouched/native.

   Branded group: El Globo (6aaa7d70a742e5436549bc91)
     logo   -> El Globo
     nav    -> white bar, #8B374A text + icons
     shape  -> square (border-radius 0) — nav only
     font   -> Montserrat (nav only)

   Uses [class*="...appintranet..."] substring selectors (the technique from the
   Hill's/Frontier build) because these nav tokens live in @layer utilities and
   lose to plain [data-c13y-region] specificity stacking on background.
   ============================================================================ */
(function () {
  "use strict";

  var VERSION = "1.0";

  // ---- CONFIG (El Globo) ----------------------------------------------------
  var GROUP_ID = "6aaa7d70a742e5436549bc91";
  var LOGO_URL = "https://cdn.shopify.com/s/files/1/0563/2357/1884/files/EL_GLOBO_LOGO.png";
  var NAV_BG   = "#ffffff";  // white bar
  var TEXT     = "#8B374A";  // maroon text + icons
  var BORDER   = "#8B374A";  // nav border matches the brand color
  var RADIUS   = "0px";      // square — nav only
  var FONT_FAMILY = '"Montserrat","Helvetica Neue",Arial,sans-serif';
  var FONT_HREF   = "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap";
  // ---------------------------------------------------------------------------

  var STYLE_ID  = "replify-elglobo-nav";
  var REVEAL_ID = "replify-nav-reveal";
  var FONT_ID   = "replify-elglobo-font";
  var GROUP_RE  = /group-[a-f0-9]{16,}/;

  var H = '[data-c13y-region="header"]';
  var LOGO_SEL = H + ' [data-c13y-component="image"][data-c13y-purpose="logo"]';

  var TOP; try { TOP = window.top.document; } catch (e) { TOP = document; }

  function addStyle(id, css) {
    if (TOP.getElementById(id)) return;
    var s = TOP.createElement("style");
    s.id = id; s.textContent = css;
    (TOP.head || TOP.documentElement).appendChild(s);
  }

  // Block B hides the nav until we reveal it (source-order wins) — no flash.
  function reveal() { addStyle(REVEAL_ID, H + "{display:flex !important;}"); }

  function loadFont() {
    if (TOP.getElementById(FONT_ID)) return;
    var l = TOP.createElement("link");
    l.id = FONT_ID; l.rel = "stylesheet"; l.href = FONT_HREF;
    (TOP.head || TOP.documentElement).appendChild(l);
  }

  // group classes from any same-origin doc we can reach (nav shell has none;
  // the content iframe carries them).
  function groupClasses() {
    var docs = [document];
    if (TOP !== document) docs.push(TOP);
    try {
      [].forEach.call(TOP.querySelectorAll("iframe"), function (f) {
        try { if (f.contentDocument) docs.push(f.contentDocument); } catch (e) {}
      });
    } catch (e) {}
    for (var i = 0; i < docs.length; i++) {
      var d = docs[i]; if (!d || !d.documentElement) continue;
      var cls = (d.documentElement.className || "") + " " + (d.body ? d.body.className : "");
      if (GROUP_RE.test(cls)) return cls;
    }
    return null;
  }

  function applyBranding() {
    if (TOP.getElementById(STYLE_ID)) return;
    loadFont();
    var border =
      "border-color:" + BORDER + " !important;" +
      "border-top-color:" + BORDER + " !important;border-right-color:" + BORDER + " !important;" +
      "border-bottom-color:" + BORDER + " !important;border-left-color:" + BORDER + " !important;";
    var css =
      /* logo */
      LOGO_SEL + '{' +
        'content:url("' + LOGO_URL + '") !important;' +
        'height:40px !important;width:auto !important;' +
        'object-fit:contain !important;object-position:left center !important;' +
        'visibility:visible !important;}' +
      /* white bar (base + accent variants) */
      '[class*="bg-nav-appintranet"],[class*="bg-menu-appintranet"]{background-color:' + NAV_BG + ' !important;}' +
      /* maroon text (base + accent variants) */
      '[class*="text-nav-appintranet"],[class*="text-menu-appintranet"]{color:' + TEXT + ' !important;}' +
      /* maroon icons + titles */
      H + ' [data-c13y-component="icon"]{color:' + TEXT + ' !important;fill:' + TEXT + ' !important;}' +
      H + ' [data-c13y-component="title"]{color:' + TEXT + ' !important;}' +
      /* border matches the brand color (nav only) */
      H + H + H + '{' + border + '}' +
      '[class*="border-nav-appintranet"],[class*="border-menu-appintranet"]{' + border + '}' +
      /* square — nav only (radius kept in its own rules) */
      H + H + '{border-radius:' + RADIUS + ' !important;}' +
      '[class*="bg-nav-appintranet"],[class*="bg-menu-appintranet"]{border-radius:' + RADIUS + ' !important;}' +
      /* Montserrat — nav only */
      H + ',' + H + ' *{font-family:' + FONT_FAMILY + ' !important;}';
    addStyle(STYLE_ID, css);
    console.log("[replify elglobo-nav v" + VERSION + "] El Globo branding applied.");
  }

  // El Globo -> brand + reveal; other groups -> reveal (untouched); else wait.
  function tick() {
    var cls = groupClasses();
    if (cls === null) return false;
    if (cls.indexOf("group-" + GROUP_ID) !== -1) applyBranding();
    reveal();
    return true;
  }

  console.log("[replify elglobo-nav v" + VERSION + "] loaded.");
  if (!tick()) {
    var n = 0;
    var iv = setInterval(function () {
      n++;
      if (tick() || n > 80) {           // ~20s failsafe
        if (n > 80) reveal();
        clearInterval(iv);
      }
    }, 250);
  }
})();
