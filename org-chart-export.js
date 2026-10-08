(function () {
    'use strict';

    const ANCHOR_TEXT = 'Org Chart';
    const BTN_ID = 'org-chart-image-export-button-container';
    const PROFILE_PATH_RE = /^\/profile\/[^/]+/;
    const EXPAND_RE = /show all|show more|view more|see more|weitere|mehr anzeigen/i;
    const REPORTS_RE = /reporting to|direct reports|berichtet an/i;

    const log = (...a) => console.log('[SB Org Image Exporter]', ...a);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    /** Dynamically loads html2canvas since @require is not available in vanilla JS */
    function loadHtml2Canvas() {
        if (window.html2canvas) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load html2canvas library'));
            document.head.appendChild(script);
        });
    }

    // ---------------------------------------------------------------------------
    // BUTTON INJECTION
    // ---------------------------------------------------------------------------

    function onProfilePage() {
        return PROFILE_PATH_RE.test(location.pathname);
    }

    function getOrgChartHeader() {
        const widget = document.querySelector('user-profile-widget');
        if (!widget) return null;
        return Array.from(widget.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .find(h => h.textContent.trim() === ANCHOR_TEXT) || null;
    }

    /** The card element that contains the whole Org Chart (header + tree). */
    function getOrgChartCard() {
        const header = getOrgChartHeader();
        return header ? header.parentElement : null;
    }

    function injectButton(header) {
        if (document.getElementById(BTN_ID)) return;

        const container = document.createElement('div');
        container.id = BTN_ID;
        container.style.marginTop = '16px';
        container.style.marginBottom = '16px';
        container.className = 'px-[12px] md:px-[24px] lg-tablet:px-0';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ds-button ds-button--secondary w-full min-h-[48px]';
        button.addEventListener('click', handleExportImageClick);

        const span = document.createElement('span');
        span.className = 'ds-button-content ds-button__content';
        span.textContent = 'Export Org Chart Image';

        button.appendChild(span);
        container.appendChild(button);
        header.insertAdjacentElement('afterend', container);
        log('✅ Image-export button injected.');
    }

    function waitFor(getter, { timeout = 15000 } = {}) {
        return new Promise(resolve => {
            const immediate = getter();
            if (immediate) return resolve(immediate);
            let settled = false;
            const finish = v => {
                if (settled) return;
                settled = true;
                observer.disconnect();
                clearTimeout(timer);
                resolve(v);
            };
            const observer = new MutationObserver(() => {
                const v = getter();
                if (v) finish(v);
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
            const timer = setTimeout(() => finish(getter() || null), timeout);
        });
    }

    let navToken = 0;
    async function refresh() {
        const stale = document.getElementById(BTN_ID);
        if (stale) stale.remove();
        if (!onProfilePage()) return;
        const token = ++navToken;
        const header = await waitFor(getOrgChartHeader);
        if (token !== navToken) return;
        if (header) injectButton(header);
    }

    // Navigation detection
    if (window.navigation && typeof window.navigation.addEventListener === 'function') {
        window.navigation.addEventListener('navigatesuccess', refresh);
    }
    window.addEventListener('popstate', refresh);
    ['pushState', 'replaceState'].forEach(name => {
        const original = history[name];
        history[name] = function () {
            const r = original.apply(this, arguments);
            refresh();
            return r;
        };
    });

    const guard = new MutationObserver(() => {
        if (onProfilePage() && !document.getElementById(BTN_ID)) {
            const header = getOrgChartHeader();
            if (header) injectButton(header);
        }
    });
    guard.observe(document.body, { childList: true, subtree: true });

    refresh();
    log('👀 Org Chart Image Exporter ready. Frame:', location.href);

    // ---------------------------------------------------------------------------
    // EXPAND + CAPTURE
    // ---------------------------------------------------------------------------

    async function expandAllReports(card) {
        const chartSize = () => card.querySelectorAll('.ds-avatar').length;
        const expandedToggles = new Set();

        for (let pass = 0; pass < 14; pass++) {
            const clickables = Array.from(card.querySelectorAll('button, a, [role="button"]'));

            const showMore = clickables.find(el =>
                EXPAND_RE.test(el.textContent.trim()) && el.textContent.trim().length < 40);
            if (showMore) {
                log('Expanding:', showMore.textContent.trim());
                showMore.click();
                await sleep(600);
                continue;
            }

            const toggle = clickables.find(el =>
                REPORTS_RE.test(el.textContent) && !expandedToggles.has(el));
            if (toggle) {
                expandedToggles.add(toggle);
                log('Expanding reports group:', toggle.textContent.trim().replace(/\s+/g, ' ').slice(0, 40));
                const before = chartSize();
                toggle.click();
                await sleep(700);
                if (chartSize() < before) {
                    toggle.click();
                    await sleep(700);
                }
                continue;
            }

            break;
        }
        await sleep(300);
    }

    function getCaptureTarget(card) {
        return card.querySelector(':scope > div:last-child') || card;
    }

    function reanchorBadges(card) {
        const restores = [];
        const seen = new Set();
        Array.from(card.querySelectorAll('.ds-avatar')).forEach(avatar => {
            let wrapper = null, node = avatar;
            while (node && node !== card) {
                if (getComputedStyle(node).position === 'absolute') { wrapper = node; break; }
                node = node.parentElement;
            }
            wrapper = wrapper || avatar;
            if (seen.has(wrapper)) return;
            seen.add(wrapper);

            let visualCard = wrapper.parentElement;
            while (visualCard && visualCard !== card) {
                const cs = getComputedStyle(visualCard);
                const radius = parseFloat(cs.borderRadius) || 0;
                if ((cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') || radius >= 6) break;
                visualCard = visualCard.parentElement;
            }
            if (!visualCard || visualCard === card) visualCard = wrapper.parentElement;

            const wr = wrapper.getBoundingClientRect();
            const cr = visualCard.getBoundingClientRect();
            const offTop = Math.round(wr.top - cr.top);
            const offLeft = Math.round(wr.left - cr.left);

            restores.push([visualCard, visualCard.getAttribute('style')]);
            restores.push([wrapper, wrapper.getAttribute('style')]);

            visualCard.style.position = 'relative';
            Object.assign(wrapper.style, {
                position: 'absolute',
                top: offTop + 'px',
                left: offLeft + 'px',
                right: 'auto',
                transform: 'none',
                margin: '0',
            });
        });
        return () => restores.forEach(([el, style]) => {
            if (style === null) el.removeAttribute('style');
            else el.setAttribute('style', style);
        });
    }

    function getProfileName() {
        const widget = document.querySelector('user-profile-widget');
        const h1 = widget && widget.querySelector('h1');
        const raw = (h1 && h1.textContent.trim()) || document.title || 'profile';
        return raw.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-]/g, '').slice(0, 60) || 'profile';
    }

    async function handleExportImageClick(event) {
        const button = event.currentTarget;
        const content = button.querySelector('.ds-button__content');
        const original = content ? content.textContent : '';
        button.disabled = true;

        const setLabel = t => { if (content) content.textContent = t; };

        try {
            setLabel('Loading library...');
            await loadHtml2Canvas();

            const card = getOrgChartCard();
            if (!card) throw new Error('Org Chart card not found.');

            setLabel('Expanding reports...');
            await expandAllReports(card);

            setLabel('Rendering image...');
            const target = getCaptureTarget(card);

            const restoreBadges = reanchorBadges(card);
            let canvas;
            try {
                canvas = await window.html2canvas(target, {
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    allowTaint: false,
                    scale: Math.max(2, window.devicePixelRatio || 1),
                    logging: false,
                    onclone: (clonedDoc) => {
                        const stray = clonedDoc.getElementById(BTN_ID);
                        if (stray) stray.remove();
                    },
                });
            } finally {
                restoreBadges();
            }

            const pad = Math.round(24 * (canvas.width / (target.getBoundingClientRect().width || canvas.width)));
            const framed = document.createElement('canvas');
            framed.width = canvas.width + pad * 2;
            framed.height = canvas.height + pad * 2;
            const ctx = framed.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, framed.width, framed.height);
            ctx.drawImage(canvas, pad, pad);

            setLabel('Downloading...');
            const url = framed.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `staffbase_org_chart_${getProfileName()}_${new Date().toISOString().slice(0, 10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            log('🚀 PNG exported.');
        } catch (error) {
            console.error('[SB Org Image Exporter] 🔴 Export failed:', error);
            setLabel('Error! See console.');
            alert('Failed to export org chart image. See the browser console (F12) for details.');
        } finally {
            setTimeout(() => {
                button.disabled = false;
                setLabel(original || 'Export Org Chart Image');
            }, 2500);
        }
    }
})();
