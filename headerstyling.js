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

        #root header li > div[role="button"] > a {
            background: transparent !important;
            border: none !important;
        }

        #root header *:focus,
        #root header *:focus-visible,
        #root header *:active {
            outline: none !important;
            box-shadow: none !important;
        }

        /* =========================================
           3. NEW SCI-FI INTERACTIVE EFFECTS
           ========================================= */
        #root header li > a,
        #root header li > div[role="button"],
        #root header li > button {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
            border: 1px solid transparent !important;
        }

        #root header a[data-status="active"] {
            background: rgba(0, 27, 24, 0.6) !important;
            border: 1px solid rgba(30, 252, 230, 0.5) !important;
            box-shadow: inset 0 0 12px rgba(30, 252, 230, 0.2) !important;
        }

        #root header a[data-status="active"] span {
            color: #1efce6 !important;
        }

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

        /* =========================================
           4. NEWS SLIDER HEADLINE: SHIMMER & LETTER EXPAND
           ========================================= */
        /* Completely hide the underline */
        .news-slider-header-wrapper h2.news-feed-post-headline a.news-feed-post-link,
        .news-slider-header-wrapper h2.news-feed-post-headline a.news-feed-post-link:hover,
        .news-slider-header-wrapper h2.news-feed-post-headline a.news-feed-post-link:focus {
            text-decoration: none !important;
        }

        /* Parent Span: Gradient, Shimmer, and Shadow */
        .news-slider-header-wrapper h2.news-feed-post-headline a.news-feed-post-link > span {
            font-family: 'Lexend Deca', sans-serif !important;
            font-weight: 500 !important;
            background-image: linear-gradient(to right, #ffffff, #c2efeb, #ffffff) !important; /* 3 colors for looping shimmer */
            background-size: 200% auto !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            color: transparent !important;
            text-shadow: 0px 1px 2px rgba(215, 226, 217, 0.55) !important;
            transition: background-position 0.4s ease-out !important;
            display: inline-block !important; /* Helps with transformations */
        }

        /* Trigger Shimmer when hovering the link */
        .news-slider-header-wrapper h2.news-feed-post-headline a.news-feed-post-link:hover > span {
            background-position: right center !important;
        }

        /* Individual Letter Base Styles (added via JS) */
        .hover-letter {
            display: inline-block !important; /* Required for scaling */
            transition: transform 0.15s cubic-bezier(0.2, 0, 0.2, 1) !important; /* Snappy, smooth scale */
        }

        /* Expand just the specific letter you are hovering over */
        .hover-letter:hover {
            transform: scale(1.15) translateY(-1px) !important;
        }
    `;

    // Inject the CSS into the style tag
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    /* =========================================
       JS LOGIC 1: WEATHER IMAGE REPLACEMENT
       ========================================= */
    function swapWeatherIcons() {
        const weatherImages = document.querySelectorAll('img[src*="eirastaffbase.github.io/weather-time/resources/img/"]');
        weatherImages.forEach(img => {
            const oldSrc = img.getAttribute('src');
            const newSrc = oldSrc
                .replace('/weather-time/resources/img/', '/widget-images/')
                .replace('.svg', '.png');
            if (oldSrc !== newSrc) {
                img.setAttribute('src', newSrc);
            }
        });
    }

    /* =========================================
       JS LOGIC 2: SPLIT HEADLINE TEXT FOR ANIMATION
       ========================================= */
    function splitHeadlineText() {
        // Find all news slider headline spans that haven't been split yet
        const headlines = document.querySelectorAll('.news-slider-header-wrapper h2.news-feed-post-headline a.news-feed-post-link span:not(.split-done)');
        
        headlines.forEach(headline => {
            const text = headline.textContent;
            headline.textContent = ''; // Clear the original text
            
            // Loop through each character and wrap it in a span
            for (let char of text) {
                const charSpan = document.createElement('span');
                charSpan.className = 'hover-letter';
                
                // Preserve spaces properly
                if (char === ' ') {
                    charSpan.innerHTML = '&nbsp;';
                } else {
                    charSpan.textContent = char;
                }
                
                headline.appendChild(charSpan);
            }
            // Mark as done so we don't accidentally split it twice
            headline.classList.add('split-done');
        });
    }

    // Run both functions immediately
    swapWeatherIcons();
    splitHeadlineText();

    // Set up a MutationObserver to watch for dynamically loaded widgets (like sliders changing slides)
    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldRun = true;
                break;
            }
        }
        if (shouldRun) {
            swapWeatherIcons();
            splitHeadlineText();
        }
    });

    // Start observing the body for injected elements
    observer.observe(document.body, { childList: true, subtree: true });

})();
