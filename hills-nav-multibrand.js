/* ============================================================================
   hills-nav-multibrand.js
   ----------------------------------------------------------------------------
   Multibrands the NEW (c13y) nav for the Hill's Pet Nutrition group on
   colgatedemo. The nav shell sits OUTSIDE the content iframe and gets no
   `.group-<id>` class, so CSS group multibranding can't reach it. The content
   iframe DOES carry every `.group-<id>` class, so this script:
     1. immediately hides the nav logo (to avoid a wrong-logo flash),
     2. reads the group classes off the same-origin content iframe, then
     3. in the Hill's group -> full Hill's nav branding, else -> reveal original.

   Hill's nav branding (overrides ALL the Colgate Block B nav CSS):
     • logo   -> Hill's
     • font   -> Montserrat
     • accent -> #313B86 (active tab + notification badges)
     • border -> #D0012E, 8px radius
     • labels -> #0154A4 (active label stays white via Colgate Block B)

   The repeated [data-c13y-region="header"] selectors just crank specificity so
   these win over the Colgate nav rules. border-radius must be its OWN rule
   (combining it with other props lets `rounded-full` win).

   Load as early as possible (custom HEAD script). Change the CONFIG block to
   reuse for another group.
   ============================================================================ */
(function () {
  "use strict";

  // ---- CONFIG --------------------------------------------------------------
  var GROUP_ID    = "6a7b368314c9f906920ccd7f"; // Hill's Pet Nutrition group
  var LOGO_URL    = "https://upload.wikimedia.org/wikipedia/en/5/54/HIll%27s_Pet_Nutrition_logo.png";
  var ACCENT      = "#313B86";  // active tab + notification badges
  var BORDER      = "#D0012E";  // nav bar border
  var TEXT        = "#0154A4";  // nav labels (non-active)
  var RADIUS      = "8px";      // nav bar corners
  var FONT_FAMILY = '"Montserrat", "Helvetica Neue", Arial, sans-serif';
  var FONT_HREF   = "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap";
  // --------------------------------------------------------------------------

  var STYLE_ID = "replify-hills-nav";
  var HIDE_ID  = "replify-hills-prehide";
  var FONT_ID  = "replify-hills-font";
  var GROUP_RE = /group-[a-f0-9]{16,}/;

  var H = '[data-c13y-region="header"]';
  var LOGO_SEL = H + ' [data-c13y-component="image"][data-c13y-purpose="logo"]';

  // 1) Hide the logo ASAP (keeps its box, so no layout shift).
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
      if (GROUP_RE.test(cls)) return cls;
    }
    return null;
  }

  function loadFont() {
    if (document.getElementById(FONT_ID)) return;
    var l = document.createElement("link");
    l.id = FONT_ID; l.rel = "stylesheet"; l.href = FONT_HREF;
    (document.head || document.documentElement).appendChild(l);
  }

  function applyBranding() {
    if (document.getElementById(STYLE_ID)) return;
    loadFont();
    var border =
      "border-color:" + BORDER + " !important;" +
      "border-top-color:" + BORDER + " !important;border-right-color:" + BORDER + " !important;" +
      "border-bottom-color:" + BORDER + " !important;border-left-color:" + BORDER + " !important;";
    var css =
      /* logo swap — width/height stop content:url() collapsing the max-w img */
      LOGO_SEL + "{" +
        'content:url("' + LOGO_URL + '") !important;' +
        "width:120px !important;height:40px !important;" +
        "object-fit:contain !important;object-position:left center !important;" +
        "visibility:visible !important;}" +
      /* radius — MUST be its own rule */
      H + H + "{border-radius:" + RADIUS + " !important;}" +
      /* font */
      H + H + "{font-family:" + FONT_FAMILY + " !important;}" +
      /* bar border */
      H + H + H + "{" + border + "}" +
      /* accent: active tab + badges (bg only) */
      H + H + H + H + ' [class*="bg-nav-appintranet-accent"]{background-color:' + ACCENT + " !important;}" +
      /* non-active labels (active label stays white via Colgate Block B) */
      H + ' [data-c13y-component="title"]{color:' + TEXT + " !important;}";
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // Hill's -> brand + reveal; groups known but not Hill's -> reveal original;
  // not ready -> keep waiting (logo stays hidden).
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
        if (tries > 80) reveal();
        clearInterval(iv);
      }
    }, 250);
  }
})();
