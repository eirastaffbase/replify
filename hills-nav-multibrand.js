/* ============================================================================
   hills-nav-multibrand.js
   ----------------------------------------------------------------------------
   Multibrands the NEW (c13y) nav for the Hill's Pet Nutrition group on
   colgatedemo. The nav shell sits OUTSIDE the content iframe and gets no
   `.group-<id>` class, so CSS group multibranding can't reach it. The content
   iframe DOES carry every `.group-<id>` class, so this script:
     1. immediately hides the nav logo (to avoid a wrong-logo flash),
     2. reads the group classes off the same-origin content iframe, then
     3. in the Hill's group -> Hill's logo + Montserrat font + #0154A4
        text/border, otherwise -> reveals the original logo untouched.

   Load this as early as possible (custom HEAD script) so the pre-hide runs
   before the nav paints. The injected <style> survives React re-renders.
   Change GROUP_ID / LOGO_URL / BRAND_COLOR / FONT_* to reuse for another group.
   ============================================================================ */
(function () {
  "use strict";

  var GROUP_ID    = "6a7b368314c9f906920ccd7f"; // Hill's Pet Nutrition group
  var LOGO_URL    = "https://upload.wikimedia.org/wikipedia/en/5/54/HIll%27s_Pet_Nutrition_logo.png";
  var BRAND_COLOR = "#0154A4";                    // nav text + border
  var FONT_FAMILY = '"Montserrat", "Helvetica Neue", Arial, sans-serif';
  var FONT_HREF   = "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap";
  var STYLE_ID    = "replify-hills-nav";
  var HIDE_ID     = "replify-hills-prehide";
  var FONT_ID     = "replify-hills-font";
  var GROUP_RE    = /group-[a-f0-9]{16,}/;        // any real group class => iframe is ready

  var LOGO_SEL = '[data-c13y-region="header"] [data-c13y-component="image"][data-c13y-purpose="logo"]';

  // 1) Hide the logo ASAP (keeps its box, so no layout shift) to avoid the
  //    default-logo flash before we know the group.
  function prehide() {
    if (document.getElementById(HIDE_ID)) return;
    var s = document.createElement("style");
    s.id = HIDE_ID;
    s.textContent = LOGO_SEL + "{visibility:hidden !important;}";
    (document.head || document.documentElement).appendChild(s);
  }
  function reveal() {
    var h = document.getElementById(HIDE_ID);
    if (h) h.parentNode.removeChild(h);
  }
  prehide();

  // Read group classes off any same-origin iframe's <html>/<body>.
  function iframeGroupClasses() {
    var frames = document.querySelectorAll("iframe");
    for (var i = 0; i < frames.length; i++) {
      var doc;
      try { doc = frames[i].contentDocument; } catch (e) { continue; } // cross-origin
      if (!doc || !doc.documentElement) continue;
      var cls = (doc.documentElement.className || "") + " " +
                (doc.body ? doc.body.className : "");
      if (GROUP_RE.test(cls)) return cls; // iframe content loaded + groups present
    }
    return null; // not ready yet
  }

  // Load the Montserrat webfont into this (nav) document.
  function loadFont() {
    if (document.getElementById(FONT_ID)) return;
    var l = document.createElement("link");
    l.id = FONT_ID; l.rel = "stylesheet"; l.href = FONT_HREF;
    (document.head || document.documentElement).appendChild(l);
  }

  // Inject the Hill's nav branding (idempotent).
  function applyBranding() {
    if (document.getElementById(STYLE_ID)) return;
    loadFont();
    var css =
      LOGO_SEL + "{" +
        'content:url("' + LOGO_URL + '") !important;' +
        "width:120px !important;height:40px !important;" +
        "object-fit:contain !important;object-position:left center !important;" +
        "visibility:visible !important;}" +
      /* Montserrat across the nav */
      '[data-c13y-region="header"]{font-family:' + FONT_FAMILY + " !important;}" +
      /* nav label text */
      '[data-c13y-region="header"] [data-c13y-component="title"]{color:' + BRAND_COLOR + " !important;}" +
      /* nav bar border — tripled attribute out-specifies the theme border class */
      '[data-c13y-region="header"][data-c13y-region="header"][data-c13y-region="header"]{' +
        "border-color:" + BRAND_COLOR + " !important;" +
        "border-top-color:" + BRAND_COLOR + " !important;border-right-color:" + BRAND_COLOR + " !important;" +
        "border-bottom-color:" + BRAND_COLOR + " !important;border-left-color:" + BRAND_COLOR + " !important;}";
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // Three states: Hill's -> brand + reveal; groups known but not Hill's ->
  // reveal original; not ready -> keep waiting (logo stays hidden).
  function tick() {
    var cls = iframeGroupClasses();
    if (cls === null) return false;
    if (cls.indexOf("group-" + GROUP_ID) !== -1) applyBranding();
    reveal();
    return true;
  }

  if (!tick()) {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (tick() || tries > 80) {   // ~20s failsafe
        if (tries > 80) reveal();    // never leave the logo hidden
        clearInterval(iv);
      }
    }, 250);
  }
})();
