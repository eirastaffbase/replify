/* ============================================================================
   frontier-nav-multibrand.js   (v1.0)
   ----------------------------------------------------------------------------
   Multibrands the NEW (c13y) nav for the Frontier Communications group on
   verizon-demo. The nav shell sits OUTSIDE the content iframe and gets no
   `.group-<id>` class; the content iframe DOES carry the group classes. So:
     1. read group classes from ANY same-origin doc (self / top / top's iframes),
     2. in the Frontier group -> apply Frontier nav branding,
        else -> leave the default branding untouched,
     3. reveal the nav (Block B hides it) either way — no flash.

   All nav work targets window.top.document (where the nav lives), so it works
   whether it's injected in the shell OR inside the content iframe.

   Frontier nav branding (kept intentionally simple — standard font & radius):
     logo   -> Frontier rebrand SVG
     nav    -> #ED0037 background + #ED0037 border
     text   -> white   ·   icons -> white

   The repeated [data-c13y-region="header"] selectors crank specificity so these
   beat the default Block B nav CSS. background-color and border-color live in
   their own high-specificity rules.

   It logs its version to the console so you can confirm which build is live.
   ============================================================================ */
(function () {
  "use strict";

  var VERSION = "1.0";

  // ---- CONFIG --------------------------------------------------------------
  var GROUP_ID = "6a210a560c7df97c6070a2cd"; // Frontier Communications group
  var LOGO_URL = "https://tundra.frontier.redventures.io/migration/site-logo-rebrand.svg";
  var BRAND    = "#ED0037";  // nav background + border
  var TEXT     = "#ffffff";  // nav labels + icons
  // --------------------------------------------------------------------------

  var STYLE_ID  = "replify-frontier-nav";
  var REVEAL_ID = "replify-nav-reveal";   /* Block B hides the nav; this rule reveals it */
  var GROUP_RE  = /group-[a-f0-9]{16,}/;

  var H = '[data-c13y-region="header"]';
  var LOGO_SEL = H + ' [data-c13y-component="image"][data-c13y-purpose="logo"]';

  // The document that actually contains the nav (the app shell / top frame).
  var TOP; try { TOP = window.top.document; } catch (e) { TOP = document; }

  function addStyle(id, css) {
    if (TOP.getElementById(id)) return TOP.getElementById(id);
    var s = TOP.createElement("style");
    s.id = id; s.textContent = css;
    (TOP.head || TOP.documentElement).appendChild(s);
    return s;
  }

  // The nav is hidden by Block B CSS ([data-c13y-region="header"]{display:none}).
  // Inject a later same-selector rule to reveal it (wins by source order). No flash.
  function reveal() { addStyle(REVEAL_ID, H + "{display:flex !important;}"); }

  // Read group classes from any same-origin document we can reach.
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
    var border =
      "border-color:" + BRAND + " !important;" +
      "border-top-color:" + BRAND + " !important;border-right-color:" + BRAND + " !important;" +
      "border-bottom-color:" + BRAND + " !important;border-left-color:" + BRAND + " !important;";
    var css =
      LOGO_SEL + "{" +
        'content:url("' + LOGO_URL + '") !important;' +
        "width:120px !important;height:40px !important;" +
        "object-fit:contain !important;object-position:left center !important;" +
        "visibility:visible !important;}" +
      /* nav bar background */
      H + H + "{background-color:" + BRAND + " !important;}" +
      /* nav bar border */
      H + H + H + "{" + border + "}" +
      /* all nav text -> white */
      H + H + "{color:" + TEXT + " !important;}" +
      H + ' [data-c13y-component="title"]{color:' + TEXT + " !important;}" +
      H + ' [data-c13y-component="link"],' +
      H + ' [data-c13y-component="link"] *{color:' + TEXT + " !important;}" +
      /* all nav icons -> white */
      H + ' [data-c13y-component="icon"]{color:' + TEXT + " !important;fill:" + TEXT + " !important;}";
    addStyle(STYLE_ID, css);
    console.log("[replify frontier-nav v" + VERSION + "] Frontier branding applied.");
  }

  // Frontier -> brand + reveal; groups known but not Frontier -> reveal; else wait.
  function tick() {
    var cls = groupClasses();
    if (cls === null) return false;
    var inFrontier = cls.indexOf("group-" + GROUP_ID) !== -1;
    if (inFrontier) applyBranding();
    else console.log("[replify frontier-nav v" + VERSION + "] not in Frontier group — nav untouched.");
    reveal();
    return true;
  }

  console.log("[replify frontier-nav v" + VERSION + "] loaded.");
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
