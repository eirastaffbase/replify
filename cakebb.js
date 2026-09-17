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
    '<svg viewBox="0 0 384 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="0" aria-hidden="true" focusable="false">' +
    '<path d="M173.8 5.5c11-7.3 25.4-7.3 36.4 0L228 17.2c6 3.9 13 5.8 20.1 5.4l21.3-1.3c13.2-.8 25.6 6.4 31.5 18.2l9.6 19.1c3.2 6.4 8.4 11.5 14.7 14.7L344.5 83c11.8 5.9 19 18.3 18.2 31.5l-1.3 21.3c-.4 7.1 1.5 14.2 5.4 20.1l11.8 17.8c7.3 11 7.3 25.4 0 36.4L366.8 228c-3.9 6-5.8 13-5.4 20.1l1.3 21.3c.8 13.2-6.4 25.6-18.2 31.5l-19.1 9.6c-6.4 3.2-11.5 8.4-14.7 14.7L301 344.5c-5.9 11.8-18.3 19-31.5 18.2l-21.3-1.3c-7.1-.4-14.2 1.5-20.1 5.4l-17.8 11.8c-11 7.3-25.4 7.3-36.4 0L156 366.8c-6-3.9-13-5.8-20.1-5.4l-21.3 1.3c-13.2 .8-25.6-6.4-31.5-18.2l-9.6-19.1c-3.2-6.4-8.4-11.5-14.7-14.7L39.5 301c-11.8-5.9-19-18.3-18.2-31.5l1.3-21.3c.4-7.1-1.5-14.2-5.4-20.1L5.5 210.2c-7.3-11-7.3-25.4 0-36.4L17.2 156c3.9-6 5.8-13 5.4-20.1l-1.3-21.3c-.8-13.2 6.4-25.6 18.2-31.5l19.1-9.6C65 70.2 70.2 65 73.4 58.6L83 39.5c5.9-11.8 18.3-19 31.5-18.2l21.3 1.3c7.1 .4 14.2-1.5 20.1-5.4L173.8 5.5zM272 192a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM1.3 441.8L44.4 339.3c.2 .1 .3 .2 .4 .4l9.6 19.1c11.7 23.2 36 37.3 62 35.8l21.3-1.3c.2 0 .5 0 .7 .2l17.8 11.8c5.1 3.3 10.5 5.9 16.1 7.7l-37.6 89.3c-2.3 5.5-7.4 9.2-13.3 9.7s-11.6-2.2-14.8-7.2L74.4 455.5l-56.1 8.3c-5.7 .8-11.4-1.5-15-6s-4.3-10.7-2.1-16zm248 60.4L211.7 413c5.6-1.8 11-4.3 16.1-7.7l17.8-11.8c.2-.1 .4-.2 .7-.2l21.3 1.3c26 1.5 50.3-12.6 62-35.8l9.6-19.1c.1-.2 .2-.3 .4-.4l43.2 102.5c2.2 5.3 1.4 11.4-2.1 16s-9.3 6.9-15 6l-56.1-8.3-32.2 49.2c-3.2 5-8.9 7.7-14.8 7.2s-11-4.3-13.3-9.7z"></path></svg>';

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
