/* ============================================================================
   bimbo-cake-button.js   — deploy in Global JS
   ----------------------------------------------------------------------------
   Adds custom icon links to the front of the header actions row (before the
   Edit button), left-to-right in ICONS order:
       [ badge ] [ cake ]  Edit  Search
   White by default; #8B374A in the El Globo group. Re-applied on an interval
   because the header re-renders.

   In-app navigation: an href alone does NOT route inside the mobile app WebView
   (it falls back to a full page load). So each click is routed through the
   platform router window.NavigationMgr.goTo() — the technique the task widgets'
   linkify handler uses (shared/linkify.ts -> goToInApp) — with we.native /
   hideAllTabs() handling and a location.assign fallback.
   ============================================================================ */
(function () {
  "use strict";

  var GROUP_ID = "6aaa7d70a742e5436549bc91"; // El Globo

  var CAKE_SVG =
    '<svg viewBox="0 0 448 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="0" aria-hidden="true" focusable="false">' +
    '<path d="M448 384c-28.02 0-31.26-32-74.5-32-43.43 0-46.825 32-74.75 32-27.695 0-31.454-32-74.75-32-42.842 0-47.218 32-74.5 32-28.148 0-31.202-32-74.75-32-43.547 0-46.653 32-74.75 32v-80c0-26.5 21.5-48 48-48h16V112h64v144h64V112h64v144h64V112h64v144h16c26.5 0 48 21.5 48 48v80zm0 128H0v-96c43.356 0 46.767-32 74.75-32 27.951 0 31.253 32 74.75 32 42.843 0 47.217-32 74.5-32 28.148 0 31.201 32 74.75 32 43.357 0 46.767-32 74.75-32 27.488 0 31.252 32 74.5 32v96zM96 96c-17.75 0-32-14.25-32-32 0-31 32-23 32-64 12 0 32 29.5 32 56s-14.25 40-32 40zm128 0c-17.75 0-32-14.25-32-32 0-31 32-23 32-64 12 0 32 29.5 32 56s-14.25 40-32 40zm128 0c-17.75 0-32-14.25-32-32 0-31 32-23 32-64 12 0 32 29.5 32 56s-14.25 40-32 40z"></path></svg>';

  var BADGE_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="0" aria-hidden="true" focusable="false">' +
    '<path d="M16.486 12.143l-4.486 2.69l-4.486 -2.69a1 1 0 0 0 -1.514 .857v4a1 1 0 0 0 .486 .857l5 3a1 1 0 0 0 1.028 0l5 -3a1 1 0 0 0 .486 -.857v-4a1 1 0 0 0 -1.514 -.857z"></path>' +
    '<path d="M16.486 3.143l-4.486 2.69l-4.486 -2.69a1 1 0 0 0 -1.514 .857v4a1 1 0 0 0 .486 .857l5 3a1 1 0 0 0 1.028 0l5 -3a1 1 0 0 0 .486 -.857v-4a1 1 0 0 0 -1.514 -.857z"></path></svg>';

  // Left-to-right. Plain in-app paths (no /openlink, no query) — what
  // NavigationMgr.goTo expects and a valid fallback href.
  var ICONS = [
    { mark: "replify-badge-button", label: "Badges",    path: "/content/page/6aab554421459d46d16f9a94", svg: BADGE_SVG },
    { mark: "replify-cake-button",  label: "Birthdays", path: "/content/page/6aac059dc5ec8664f23639ae", svg: CAKE_SVG  }
  ];

  function inElGlobo() {
    var cls = (document.documentElement.className || "") + " " +
              (document.body ? document.body.className : "");
    return cls.indexOf("group-" + GROUP_ID) !== -1;
  }
  function iconColor() { return inElGlobo() ? "#8B374A" : "#ffffff"; }

  // Route in-app via the platform router (same as the widgets' goToInApp).
  function goToInApp(path) {
    var w = window;
    var nav = w.NavigationMgr;
    if (nav && typeof nav.goTo === "function") {
      try {
        if (w.we && w.we.native && typeof nav.hideAllTabs === "function") nav.hideAllTabs();
        nav.goTo(path);
        return;
      } catch (e) { /* router unhappy — fall through to a plain load */ }
    }
    w.location.assign(path);
  }

  function makeClickHandler(path) {
    return function (ev) {
      if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      ev.stopPropagation();
      goToInApp(path);
    };
  }

  function ensureIcons() {
    var containers = document.querySelectorAll(".header-right-container.actions");
    [].forEach.call(containers, function (container) {
      // Iterate in reverse so insertBefore(firstChild) leaves them in ICONS order.
      for (var i = ICONS.length - 1; i >= 0; i--) {
        var cfg = ICONS[i];
        var el = container.querySelector("." + cfg.mark);
        if (!el) {
          el = document.createElement("a");
          el.className = "header-button " + cfg.mark;
          el.href = cfg.path;                       // fallback / accessibility
          el.setAttribute("aria-label", cfg.label);
          el.setAttribute("title", cfg.label);
          el.style.display = "inline-flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.transform = "translate(-1px, -1px)"; // nudge left 1px, up 1px
          el.innerHTML = cfg.svg;
          el.addEventListener("click", makeClickHandler(cfg.path), true); // capture
          container.insertBefore(el, container.firstChild); // before the Edit button
        }
        el.style.color = iconColor();
      }
    });
  }

  setInterval(ensureIcons, 500);
  ensureIcons();
})();
