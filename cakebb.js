/* ============================================================================
   bimbo-cake-button.js   — deploy in Global JS
   ----------------------------------------------------------------------------
   Adds a cake icon link as the FIRST item in the header actions row (before the
   Edit button). White by default; #8B374A in the El Globo group. Links to the
   birthdays page. Re-applies on an interval because the header re-renders.
   ============================================================================ */
(function () {
  "use strict";

  var GROUP_ID = "6aaa7d70a742e5436549bc91"; // El Globo
  var LINK  = "https://bimbo.staffbase.rocks/content/page/6aab554421459d46d16f9a94";
  var MARK  = "replify-cake-button";
  var LABEL = "Birthdays";

  var CAKE_SVG =
    '<svg viewBox="0 0 448 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="0" aria-hidden="true" focusable="false">' +
    '<path d="M448 384c-28.02 0-31.26-32-74.5-32-43.43 0-46.825 32-74.75 32-27.695 0-31.454-32-74.75-32-42.842 0-47.218 32-74.5 32-28.148 0-31.202-32-74.75-32-43.547 0-46.653 32-74.75 32v-80c0-26.5 21.5-48 48-48h16V112h64v144h64V112h64v144h64V112h64v144h16c26.5 0 48 21.5 48 48v80zm0 128H0v-96c43.356 0 46.767-32 74.75-32 27.951 0 31.253 32 74.75 32 42.843 0 47.217-32 74.5-32 28.148 0 31.201 32 74.75 32 43.357 0 46.767-32 74.75-32 27.488 0 31.252 32 74.5 32v96zM96 96c-17.75 0-32-14.25-32-32 0-31 32-23 32-64 12 0 32 29.5 32 56s-14.25 40-32 40zm128 0c-17.75 0-32-14.25-32-32 0-31 32-23 32-64 12 0 32 29.5 32 56s-14.25 40-32 40zm128 0c-17.75 0-32-14.25-32-32 0-31 32-23 32-64 12 0 32 29.5 32 56s-14.25 40-32 40z"></path></svg>';

  function inElGlobo() {
    var cls = (document.documentElement.className || "") + " " +
              (document.body ? document.body.className : "");
    return cls.indexOf("group-" + GROUP_ID) !== -1;
  }
  function iconColor() { return inElGlobo() ? "#8B374A" : "#ffffff"; }

  function ensureCake() {
    var containers = document.querySelectorAll(".header-right-container.actions");
    [].forEach.call(containers, function (container) {
      var cake = container.querySelector("." + MARK);
      if (!cake) {
        cake = document.createElement("a");
        cake.className = "header-button " + MARK;
        cake.href = LINK;
        cake.setAttribute("aria-label", LABEL);
        cake.setAttribute("title", LABEL);
        cake.style.display = "inline-flex";
        cake.style.alignItems = "center";
        cake.style.justifyContent = "center";
        cake.innerHTML = CAKE_SVG;
        container.insertBefore(cake, container.firstChild); // before the Edit button
      }
      cake.style.color = iconColor();
    });
  }

  setInterval(ensureCake, 500);
  ensureCake();
})();
