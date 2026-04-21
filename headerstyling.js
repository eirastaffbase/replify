(function() {
    'use strict';
    
    // Create the style element
    const style = document.createElement('style');
    style.type = 'text/css';

    // The CSS string
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap');

        /* =========================================
           1. CORE HEADER SHAPE & GLASSMORPHISM
           ========================================= */
        #root header {
            font-family: 'Source Sans 3', sans-serif !important;
            background: rgba(5, 10, 10, 0.65) !important;
            backdrop-filter: blur(16px) saturate(120%) !important;
            -webkit-backdrop-filter: blur(16px) saturate(120%) !important;
            border: 1px solid rgba(10, 130, 118, 0.9) !important;
            box-shadow:
                8px 10px 30px -5px rgba(10, 130, 118, 0.9),
                -3px -3px 15px -2px rgba(10, 130, 118, 0.3),
                inset 2px 2px 4px 0px rgba(255, 255, 255, 0.15),
                inset -5px -5px 20px 0px rgba(10, 130, 118, 0.6) !important;
            color: #ffffff !important;
        }

        #root header ul,
        #root header nav {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        #root header a span,
        #root header svg {
            font-family: 'Source Sans 3', sans-serif !important;
            color: #ffffff !important;
            transition: all 0.3s ease-out !important;
        }

        /* =========================================
           2. NUKE DEFAULT STAFFBASE BACKGROUNDS & OUTLINES
           ========================================= */
        #root header .bg-nav-appintranet-accent,
        #root header .bg-nav-appintranet-accent:hover,
        #root header .active\\:bg-nav-appintranet-accent-pressed:active {
            background: transparent !important;
            background-color: transparent !important;
        }

        #root header .hover\\:bg-nav-appintranet-hover:hover,
        #root header .focus-within\\:bg-nav-appintranet-hover:focus-within,
        #root header .group:hover {
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
        }

        /* Strip background/borders off nested elements to prevent double-layering */
        #root header li > div[role="button"] > a {
            background: transparent !important;
            border: none !important;
        }

        /* Kill all focus rings, hidden shadows, and weird text highlights */
        #root header *:focus,
        #root header *:focus-visible,
        #root header *:active {
            outline: none !important;
            box-shadow: none !important;
        }

        /* =========================================
           3. NEW SCI-FI INTERACTIVE EFFECTS
           ========================================= */
        /* Apply base transitions ONLY to the top-level wrappers */
        #root header li > a,
        #root header li > div[role="button"],
        #root header li > button {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
            border: 1px solid transparent !important;
        }

        /* ACTIVE STATE */
        #root header a[data-status="active"] {
            background: rgba(0, 27, 24, 0.6) !important;
            border: 1px solid rgba(30, 252, 230, 0.5) !important;
            box-shadow: inset 0 0 12px rgba(30, 252, 230, 0.2) !important;
        }

        #root header a[data-status="active"] span {
            color: #1efce6 !important;
        }

        /* HOVER EFFECTS - STRICTLY limited to the outer container */
        #root header li > a:hover,
        #root header li > div[role="button"]:hover,
        #root header li > button:hover {
            background: linear-gradient(180deg, rgba(30, 252, 230, 0.05) 0%, rgba(30, 252, 230, 0.15) 100%) !important;
            border: 1px solid rgba(30, 252, 230, 0.6) !important;
            box-shadow:
                0 5px 15px -3px rgba(30, 252, 230, 0.3),
                inset 0 -2px 8px rgba(30, 252, 230, 0.2) !important;
            transform: translateY(-2px) !important;
            border-radius: 9999px !important;
        }
    `;

    // Inject the CSS into the style tag
    style.appendChild(document.createTextNode(css));

    // Append the style tag to the document head
    document.head.appendChild(style);

    /* =========================================
       4. WEATHER IMAGE REPLACEMENT LOGIC
       ========================================= */
    function swapWeatherIcons() {
        // Find all images that match the old eirastaffbase weather path
        const weatherImages = document.querySelectorAll('img[src*="eirastaffbase.github.io/weather-time/resources/img/"]');
        
        weatherImages.forEach(img => {
            const oldSrc = img.getAttribute('src');
            
            // Replace the directory path and swap .svg for .png
            const newSrc = oldSrc
                .replace('/weather-time/resources/img/', '/widget-images/')
                .replace('.svg', '.png');
                
            if (oldSrc !== newSrc) {
                img.setAttribute('src', newSrc);
            }
        });
    }

    // Run once immediately in case the widget is already in the DOM
    swapWeatherIcons();

    // Set up a MutationObserver to watch for dynamically loaded widgets
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                swapWeatherIcons();
            }
        }
    });

    // Start observing the body for injected elements
    observer.observe(document.body, { childList: true, subtree: true });

})();
