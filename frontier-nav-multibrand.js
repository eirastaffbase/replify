/* ============================================================================
   frontier-nav-multibrand.js   (v1.2)
   ----------------------------------------------------------------------------
   Frontier Communications multibrand for the NEW (c13y) nav on verizon-demo.
   Structurally this IS the Hill's script — same reveal-until-loaded logic, same
   cross-frame group detection, same [class*="...appintranet..."] targeting
   technique. Only the branding is swapped, and the custom font + border-radius
   rules are removed (standard font / standard radius, as requested).

   Why the Hill's structure is kept verbatim:
     - The nav shell lives OUTSIDE the content iframe and gets no `.group-<id>`
       class; the content iframe DOES. groupClasses() reads from any same-origin
       doc so detection works wherever this is injected.
     - Block B CSS hides the nav (display:none). reveal() injects a later
       same-selector rule so the nav only appears once we've decided the brand —
       no wrong-brand / unstyled flash. This is the "disappear till loaded" logic.
     - The nav's colors come from Tailwind utility classes bound to CSS vars
       (bg-nav-appintranet / bg-menu-appintranet / text-* / border-*, incl. their
       -accent variants). [class*="..."] substring selectors target those actual
       classes and reliably win — [data-c13y-region] specificity stacking does
       NOT (it wins on border but loses on the white menu/nav backgrounds,
       leaving the white box). This is the whole reason the Hill's script is
       written the way it is.

   Frontier branding:
     logo -> Frontier rebrand SVG · nav bar + menu bar + border -> #ED0037
     · labels + icons -> white.
   ============================================================================ */
(function () {
  "use strict";

  var VERSION = "1.2";

  // ---- CONFIG --------------------------------------------------------------
  var GROUP_ID = "6a210a560c7df97c6070a2cd"; // Frontier Communications group
  var LOGO_URL = "https://tundra.frontier.redventures.io/migration/site-logo-rebrand.svg";
  var ACCENT   = "#ED0037";  // nav bar + menu bar background, active tab, badges
  var BORDER   = "#ED0037";  // nav bar border
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
      "border-color:" + BORDER + " !important;" +
      "border-top-color:" + BORDER + " !important;border-right-color:" + BORDER + " !important;" +
      "border-bottom-color:" + BORDER + " !important;border-left-color:" + BORDER + " !important;";
    var css =
      LOGO_SEL + "{" +
        'content:url("' + LOGO_URL + '") !important;' +
        "width:120px !important;height:40px !important;" +
        "object-fit:contain !important;object-position:left center !important;" +
        "visibility:visible !important;}" +
      /* border (both the header element and the utility-class border tokens) */
      H + H + H + "{" + border + "}" +
      '[class*="border-nav-appintranet"],[class*="border-menu-appintranet"]{' + border + "}" +
      /* nav bar + menu bar background fill -> kills the white box (base + accent variants) */
      '[class*="bg-nav-appintranet"],[class*="bg-menu-appintranet"]{background-color:' + ACCENT + " !important;}" +
      /* labels white (base + accent variants) */
      '[class*="text-nav-appintranet"],[class*="text-menu-appintranet"]{color:' + TEXT + " !important;}" +
      /* active/open icon states (carried over from Hill's) */
      H + ' [data-c13y-component="button"][data-search-active] [data-c13y-component="icon"],' +
      H + ' [data-c13y-component="button"][data-popup-open] [data-c13y-component="icon"],' +
      H + ' [data-c13y-component="button"][aria-expanded="true"] [data-c13y-component="icon"]{color:#fff !important;fill:#fff !important;}' +
      H + ' [data-c13y-component="button"][data-variant="ghost"][data-color="primary"] [data-c13y-component="icon"]{color:#fff !important;fill:#fff !important;}' +
      /* all nav icons + titles white */
      H + ' [data-c13y-component="icon"]{color:' + TEXT + " !important;fill:" + TEXT + " !important;}" +
      H + ' [data-c13y-component="title"]{color:' + TEXT + " !important;}";
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
