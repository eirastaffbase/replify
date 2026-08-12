/* ============================================================================
   hills-nav-multibrand.js   (v1.4)
   ----------------------------------------------------------------------------
   Multibrands the NEW (c13y) nav for the Hill's Pet Nutrition group on
   colgatedemo. The nav shell sits OUTSIDE the content iframe and gets no
   `.group-<id>` class; the content iframe DOES carry the group classes. So:
     1. hide the nav logo immediately (avoid a wrong-logo flash),
     2. read group classes from ANY same-origin doc (self / top / top's iframes),
     3. in the Hill's group -> full Hill's nav branding, else -> reveal original.

   All nav work targets window.top.document (where the nav lives), so it works
   whether it's injected in the shell OR inside the content iframe.

   Hill's nav branding (overrides ALL the Colgate Block B nav CSS):
     logo -> Hill's · font -> Montserrat · accent (#313B86, active tab + badges)
     · border #D0012E, 8px radius · labels #0154A4 (active label stays white).

   The repeated [data-c13y-region="header"] selectors crank specificity so these
   beat the Colgate rules. border-radius MUST be its own rule.

   It logs its version to the console so you can confirm which build is live.
   ============================================================================ */
(function () {
  "use strict";

  var VERSION = "1.4";

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

  // The document that actually contains the nav (the app shell / top frame).
  var TOP; try { TOP = window.top.document; } catch (e) { TOP = document; }

  function addStyle(id, css) {
    if (TOP.getElementById(id)) return TOP.getElementById(id);
    var s = TOP.createElement("style");
    s.id = id; s.textContent = css;
    (TOP.head || TOP.documentElement).appendChild(s);
    return s;
  }

  // Hide the logo ASAP (keeps its box, so no layout shift).
  function prehide() { addStyle(HIDE_ID, LOGO_SEL + "{visibility:hidden !important;}"); }
  function reveal() { var h = TOP.getElementById(HIDE_ID); if (h) h.parentNode.removeChild(h); }
  prehide();

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

  function loadFont() {
    if (TOP.getElementById(FONT_ID)) return;
    var l = TOP.createElement("link");
    l.id = FONT_ID; l.rel = "stylesheet"; l.href = FONT_HREF;
    (TOP.head || TOP.documentElement).appendChild(l);
  }

  function applyBranding() {
    if (TOP.getElementById(STYLE_ID)) return;
    loadFont();
    var border =
      "border-color:" + BORDER + " !important;" +
      "border-top-color:" + BORDER + " !important;border-right-color:" + BORDER + " !important;" +
      "border-bottom-color:" + BORDER + " !important;border-left-color:" + BORDER + " !important;";
    var css =
      LOGO_SEL + "{" +
        'content:url("' + LOGO_URL + '") !important;' +
        "width:120px !important;height:40px !important;" +
        "object-fit:contain !important;object-position:left center !important;" +
        "visibility:visible !important;}" +
      H + H + "{border-radius:" + RADIUS + " !important;}" +   /* radius MUST be its own rule */
      H + H + "{font-family:" + FONT_FAMILY + " !important;}" +
      H + H + H + "{" + border + "}" +
      H + H + H + H + ' [class*="bg-nav-appintranet-accent"]{background-color:' + ACCENT + " !important;}" +
      H + ' [data-c13y-component="title"]{color:' + TEXT + " !important;}";
    addStyle(STYLE_ID, css);
    console.log("[replify hills-nav v" + VERSION + "] Hill's branding applied.");
  }

  // Hill's -> brand + reveal; groups known but not Hill's -> reveal; else wait.
  function tick() {
    var cls = groupClasses();
    if (cls === null) return false;
    var inHills = cls.indexOf("group-" + GROUP_ID) !== -1;
    if (inHills) applyBranding();
    else console.log("[replify hills-nav v" + VERSION + "] not in Hill's group — nav untouched.");
    reveal();
    return true;
  }

  console.log("[replify hills-nav v" + VERSION + "] loaded.");
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
