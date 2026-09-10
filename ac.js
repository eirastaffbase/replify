/* ============================================================================
   acushnet-logos.js   (v1.0)   — deploy in Global JS
   ----------------------------------------------------------------------------
   One script, two jobs, one shared logo map:
     1) NEW UX / c13y nav logo (data-c13y-region="header") — swapped per group
        via injected CSS, with cross-frame group detection + reveal-until-loaded
        (Frontier/Hill's structure). Untouched by default.
     2) AI-assistant modal logo (img[data-c13y-purpose="logo"], incl. shadow
        root / #ai-assistant-root iframe) — swapped per group on an interval.

   Only Titleist & FootJoy are branded; Acushnet parent / IOC / anyone else is
   left native. Add more brands by adding to LOGO_MAP.
   ============================================================================ */
(function () {
  "use strict";

  var VERSION = "1.0";

  // ---- CONFIG: full group class -> logo URL ---------------------------------
  var LOGO_MAP = {
    // Titleist
    "group-6aa2c0a9585e466fc60114ae": "https://acushnet-demo.staffbase.rocks/api/media/secure/external/v2/image/upload/98c21abc31bf5015d934e0782a549f8e.jpg",
    // FootJoy
    "group-6aa2c069585e466fc60108e2": "https://acushnet-demo.staffbase.rocks/api/media/secure/external/v2/image/upload/66bad6894618c92218c538c5bbb3b239.png"
  };
  // ---------------------------------------------------------------------------

  var STYLE_ID  = "replify-acushnet-nav";
  var REVEAL_ID = "replify-nav-reveal";
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

  // All group-<id> classes from any same-origin doc we can reach.
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
      var m = cls.match(/group-[a-f0-9]{16,}/g);
      if (m) return m;
    }
    return null;
  }

  // Which branded group (if any) the current user is in.
  function activeLogo() {
    var groups = groupClasses();
    if (!groups) return undefined;   // undefined = classes not ready yet
    for (var i = 0; i < groups.length; i++) {
      if (LOGO_MAP[groups[i]]) return LOGO_MAP[groups[i]];
    }
    return null;                     // null = known, but no branded group
  }

  /* ---------- 1) NEW UX / c13y nav logo ---------- */
  function applyNavLogo(url) {
    if (TOP.getElementById(STYLE_ID)) return;
    addStyle(STYLE_ID,
      LOGO_SEL + '{' +
        'content:url("' + url + '") !important;' +
        'height:40px !important;width:auto !important;' +
        'object-fit:contain !important;object-position:left center !important;' +
        'visibility:visible !important;}');
    console.log("[replify acushnet-logos v" + VERSION + "] nav logo applied.");
  }

  function navTick() {
    var logo = activeLogo();
    if (logo === undefined) return false;   // group classes not ready yet
    if (logo) applyNavLogo(logo);           // branded group -> swap
    reveal();                               // always reveal (untouched if no match)
    return true;
  }

  console.log("[replify acushnet-logos v" + VERSION + "] loaded.");
  if (!navTick()) {
    var n = 0;
    var iv = setInterval(function () {
      n++;
      if (navTick() || n > 80) {            // ~20s failsafe
        if (n > 80) reveal();
        clearInterval(iv);
      }
    }, 250);
  }

  /* ---------- 2) AI-assistant modal logo ---------- */
  function getAllLogoImages() {
    var selector = 'img[data-c13y-purpose="logo"]';
    var logos = new Set();

    // main document
    document.querySelectorAll(selector).forEach(function (img) { logos.add(img); });

    // shadow root / iframe under #ai-assistant-root
    var aiRoot = document.getElementById("ai-assistant-root");
    if (aiRoot) {
      if (aiRoot.shadowRoot) {
        aiRoot.shadowRoot.querySelectorAll(selector).forEach(function (img) { logos.add(img); });
      }
      var iframe = aiRoot.querySelector("iframe") || document.querySelector("#ai-assistant-root iframe");
      if (iframe) {
        try {
          var iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
          if (iframeDoc) {
            iframeDoc.querySelectorAll(selector).forEach(function (img) { logos.add(img); });
          }
        } catch (e) {}
      }
    }
    return Array.from(logos);
  }

  function updateAssistantLogos() {
    var targetLogo = activeLogo();
    if (!targetLogo) return;   // undefined (not ready) or null (no branded group)

    getAllLogoImages().forEach(function (logoImg) {
      if (logoImg.src !== targetLogo) logoImg.src = targetLogo;

      // Preserve aspect ratio for the 72px modal logo so non-square logos aren't squished
      if (logoImg.classList.contains("h-[72px]") || logoImg.getAttribute("alt") === "AI Assistant Logo") {
        logoImg.style.width = "auto";
        logoImg.style.maxWidth = "none";
        logoImg.style.objectFit = "contain";
      }
    });
  }

  setInterval(updateAssistantLogos, 500);
})();
