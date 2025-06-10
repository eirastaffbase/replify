// Verzögerung um 1,5 Sekunden vor der Ausführung des Scripts
setTimeout(() => {
    // Create the night mode button
    const nightModeButton = document.createElement("button");
    nightModeButton.textContent = "🌙"; // Night mode symbol
  
    // Style the button to match other buttons
    nightModeButton.style.marginLeft = "10px";
    nightModeButton.style.height = "36px";
    nightModeButton.style.width = "36px";
    nightModeButton.style.border = "none";
    nightModeButton.style.borderRadius = "50%";
    nightModeButton.style.cursor = "pointer";
    nightModeButton.style.backgroundColor = "#333";
    nightModeButton.style.color = "#fff";
    nightModeButton.style.fontSize = "16px";
    nightModeButton.style.display = "flex";
    nightModeButton.style.alignItems = "center";
    nightModeButton.style.justifyContent = "center";
  
    // Add Night Mode CSS to the page
    const darkModeCSS = `
    /* Dark mode variables */
    .darkmode {
      --dark-gray: #0b0b0b;
      --light-gray-text: #dcdcdc;
      --mid-gray-line: #2b2b2b;
      --white-text: #fff;
    }
  
    /* Backgrounds */
    .darkmode #wrapper,
    .darkmode body,
    html.darkmode.wide {
      background-color: #151515;
    }
  
    /* Titles */
    .darkmode.wide .page .page-content .content-widget-wrapper > h2.content-widget-title,
    .darkmode.wide h2.content-widget-title {
      color: var(--white-text);
    }
  
    /* Posts */
    .darkmode .news-feed-post {
      background-color: var(--dark-gray);
    }
  
    .darkmode .news-feed-post .news-feed-post-headline {
      color: var(--white-text);
    }
  
    .darkmode .news-feed-post :is(time, p, .news-feed-post-teaser) {
      color: var(--light-gray-text);
    }
  
    .darkmode .css-xsl9d3-StyledSocialButtonBarTop-StyledSocialButtonBarTop {
      border-top: 1px solid var(--mid-gray-line);
    }
  
    /* Widgets */
    .darkmode .create-post-widget,
    .darkmode .user-profile-widget {
      background-color: var(--dark-gray) !important;
    }
  
    .darkmode .user-profile-widget div,
    .darkmode .create-post-widget div {
      color: var(--white-text);
    }
  
    /* Links and Cards */
    .darkmode .content-widget-wrapper.section-wrapper.widget-on-card .content-widget {
      background-color: var(--dark-gray);
    }
  
    .darkmode .content-widget-wrapper.section-wrapper.widget-on-card .content-widget :is(h2, p) {
      color: var(--white-text);
    }
  
    /* Quick Links */
    .darkmode .quick-links li {
      background-color: var(--dark-gray) !important;
      color: var(--white-text) !important;
    }
  
    .darkmode .quick-links li:hover {
      background-color: #131313 !important;
    }
  
    /* Header Navigation */
    .darkmode header,
    .darkmode .header-navigation,
    .darkmode .menu.with-search.with-launchpad {
      background-color: #0b0b0b; /* Dark gray for header */
      color: var(--white-text);
    }
  
    .darkmode header a,
    .darkmode .header-navigation a,
    .darkmode .menu.with-search.with-launchpad a {
      color: var(--white-text);
    }
  
    .darkmode header a:hover,
    .darkmode .header-navigation a:hover,
    .darkmode .menu.with-search.with-launchpad a:hover {
      color: var(--light-gray-text);
    }
  
    /* Breadcrumbs */
    .darkmode #breadcrumbs :is(.breadcrumb-item.current, .breadcrumb-separator) {
      color: var(--white-text);
    }
  
    .darkmode #breadcrumbs .css-11dvn34-BreadcrumbLink-breadcrumbStyle.css-11dvn34-BreadcrumbLink-breadcrumbStyle:hover {
      background: linear-gradient(0deg, rgb(0 0 0 / 0%), rgb(0 0 0 / 0%)), rgb(40 40 40);
    }
  
    /* Lists */
    .darkmode :is(navigation-block, file-list-block, static-content-block) {
      background-color: var(--dark-gray) !important;
    }
  
    .darkmode navigation-block .css-nrlqng-NodeTextWrapper,
    .darkmode file-list-block .css-1ixwc3p-Name,
    .darkmode static-content-block :is(p, .css-1nvmo77-BasePanelContainer-PanelContainer, h3) {
      color: var(--white-text);
    }
  
    /* File Icons */
    .darkmode file-list-block .ui-commons__file-list-widget__file-type-icon-wrapper svg g path {
      fill: #fff;
    }
  
    /* Lines */
    .darkmode :is(navigation-block, file-list-block) :is(li:not(:last-child), .ui-commons__file-list-widget__file-row:not(:last-child)) {
      border-bottom: 1px solid var(--mid-gray-line);
    }
  
    /* Labels */
    .darkmode .news-feed-post-badges span {
      background-color: #a1732c;
    }
  
    /* Edit Button */
    .darkmode #contextual-action-toolbar::before {
      background-color: #151515;
      box-shadow: none;
      border: none;
    }
    `;
  
    // Append the CSS to the document
    const styleElement = document.createElement("style");
    styleElement.innerHTML = darkModeCSS;
    document.head.appendChild(styleElement);
  
    // Function to toggle night mode
    let nightModeEnabled = false;
  
    // Check user's system preferences
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    if (prefersDarkMode) {
      document.documentElement.classList.add("darkmode");
      nightModeEnabled = true;
    }
  
    // Listen for changes in system preferences
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.classList.add("darkmode");
        nightModeEnabled = true;
      } else {
        document.documentElement.classList.remove("darkmode");
        nightModeEnabled = false;
      }
    });
  
    // Add night mode toggle button functionality
    nightModeButton.addEventListener("click", () => {
      nightModeEnabled = !nightModeEnabled;
  
      if (nightModeEnabled) {
        document.documentElement.classList.add("darkmode");
      } else {
        document.documentElement.classList.remove("darkmode");
      }
    });
  
    // Locate the parent container for the button group near "Edit"
    const buttonContainer = document.querySelector("menu.with-search.with-launchpad");
  
    if (buttonContainer) {
      buttonContainer.appendChild(nightModeButton);
    } else {
      console.error("Button container not found. Adjust the selector to match your page.");
    }
  }, 1500); // 1500 Millisekunden = 1,5 Sekunden