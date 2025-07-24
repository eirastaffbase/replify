(function() {
    'use strict';

    /**
     * Injects a stylesheet into the document's head.
     * @param {string} css - The CSS rules to add.
     */
    const addGlobalStyle = (css) => {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (!head) { return; }
        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = css;
        head.appendChild(style);
    };

    // A flag to ensure we only inject the front-end styles once
    let frontEndStylesInjected = false;

    // --- CONFIGURATION ---
    const topNavBlacklist = ["SMS", "Screens"];
    const sidebarKeepList = ["News", "Trash", "Spaces", "Editorial Calendar", "Campaign Manager", "Overview", "Templates", "Folders", "Create Folder"];
    const widgetBlacklist = ["User Profile", "Plugin"];

    const getElementText = (element) => {
        let text = '';
        element.childNodes.forEach(node => {
            if (node.nodeType === 3 && node.textContent.trim()) {
                text = node.textContent.trim();
            }
        });
        return text;
    };

    /**
     * This runs on every page change
     * and decides which specific cleanup rules to apply.
     */
    const cleanUpPage = () => {
        // --- RULE SET 1: Front-End Article View ---
        if (document.querySelector('.feed-post-page')) {
            if (!frontEndStylesInjected) {
                addGlobalStyle(`
                    /* Hides the Header, Mega Menu, and Breadcrumbs */
                    .app-header,
                    #mega-menu,
                    nav#breadcrumbs {
                        display: none !important;
                    }

                    /* Applies the negative margin to the correct article container */
                    .feed-post-page > .page-content article.feed-post-detail {
                        margin-top: -100px !important;
                    }
                `);
                frontEndStylesInjected = true;
            }
            return;
        }

        // --- RULE SET 2: Backend (Studio/Admin) View ---
        frontEndStylesInjected = false;

        // 1. Clean the Top Navigation Bar
        const topNavLinks = document.querySelectorAll('header nav a, nav#interim-topbar a');
        topNavLinks.forEach(link => {
            if (topNavBlacklist.includes(link.textContent.trim())) {
                link.style.display = 'none';
            }
        });

        // 2. Clean the Sidebar
        const sidebarLinks = document.querySelectorAll('aside .MenuBar a, .menubar__content .menubar__link');
        sidebarLinks.forEach(link => {
            const linkText = getElementText(link);
            if (!sidebarKeepList.includes(linkText)) {
                link.style.display = 'none';
            }
        });

        // 3. Clean the "Add Widget" Menu
        document.querySelectorAll('.widget-menustyle__WidgetButton-sc-tnzcmg-4').forEach(widget => {
            const label = widget.getAttribute('aria-label');
            if (widgetBlacklist.includes(label)) {
                widget.style.display = 'none';
            }
        });
    };

    // --- Observer ---
    // Watches for page changes and re-runs our cleanup function.
    const observer = new MutationObserver(cleanUpPage);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

})();