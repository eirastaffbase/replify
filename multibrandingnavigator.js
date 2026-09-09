(function () {
  // Map Group IDs to corresponding Brand Logo URLs
  const logoMap = {
    'group-6a9ff3b4079edf19be16ba6a': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/db89d0d158d253e3e4e2b2b8f663295c.jpg',
    'group-6a9ff3b57523b15a0decd3d9': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/1ffe3d171b5ccf8cbad774ad6e77f179.webp',
    'group-6a9ff3b6079edf19be16ba84': 'https://www.war.gov/Portals/1/Images/DOD-Icon-Header.png?ver=5sAfFl2--9znca0j3SrX_g%3d%3d',
    'group-6a9ff3b77523b15a0decd40b': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/2c2f15bdc73bb43cb65f1afcefbb0e80.svg',
    'group-6a9ff3b8079edf19be16ba8a': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/882be487ed752cf24103d5fabe6248dd.webp',
    'group-6a9ff3b9b935e8385d48b1a9': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/bec3227910faf7556f3e75f25309d38f.webp',
    'group-6a9ff3ba7523b15a0decd421': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/cc7e58f9d656b7b1ffe13ff2aa86bc1e.jpg',
    'group-6a9ff3bb079edf19be16bae8': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/3d11a13ad4ec4c34a9aa22790ff669d8.png',
    'group-6a9ff3bc079edf19be16bb10': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/31f399fcb0d517c2fb41b56125d14c84.png',
    'group-6a9ff3bd079edf19be16bb13': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/b498c17b88546ab8963116bf3d340252.png',
    'group-6a9ff3be7523b15a0decd457': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/331f366028d453c23d212d39ef6ef730.png',
    'group-6a9ff3bfb935e8385d48b21d': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/95ff203d505f39d09429b620cdac435c.png',
    'group-6a9ff3c1079edf19be16bb25': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/ff0cce34a8d33baff4195e3a53eda24f.png',
    'group-6a9ff3c2079edf19be16bb36': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/7a6d62bb1f27fee8e900aceb9ccf9921.jpg',
    'group-6a9ff3c37523b15a0decd46f': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/d17c1d2885debb240ee1dab55f63dd41.jpg',
    'group-6a9ff3c47523b15a0decd475': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/7f6e1ce9701422085d38633285982810.png',
    'group-6a9ff3c5b935e8385d48b264': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/15e880046b16a6d0186b81632a1ab06b.webp',
    'group-6a9ff3c6b935e8385d48b267': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/4e9fce6dafb36457376d71d599a71403.webp',
    'group-6a9ff3c7079edf19be16bb74': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/4d9a8ce5152cb28590d5b9a652ed3020.png',
    'group-6a9ff3c8079edf19be16bb7a': 'https://gbi-sep2026.staffbase.rocks/api/media/secure/external/v2/image/upload/f86dd69e3904f555b74c6e2ed965f284.webp'
  };

  function getAllLogoImages() {
    const selector = 'img[data-c13y-purpose="logo"]';
    const logos = new Set();

    // 1. Search main document
    document.querySelectorAll(selector).forEach(img => logos.add(img));

    // 2. Search shadow root or iframe under #ai-assistant-root
    const aiRoot = document.getElementById('ai-assistant-root');
    if (aiRoot) {
      if (aiRoot.shadowRoot) {
        aiRoot.shadowRoot.querySelectorAll(selector).forEach(img => logos.add(img));
      }
      const iframe = aiRoot.querySelector('iframe') || document.querySelector('#ai-assistant-root iframe');
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.querySelectorAll(selector).forEach(img => logos.add(img));
          }
        } catch (e) {}
      }
    }

    return Array.from(logos);
  }

  function updateAssistantLogos() {
    const activeGroupClass = Array.from(document.documentElement.classList).find(c => c.startsWith('group-'));
    const targetLogo = logoMap[activeGroupClass];
    if (!targetLogo) return;

    const logoImages = getAllLogoImages();

    logoImages.forEach(logoImg => {
      // Replace src when mismatched
      if (logoImg.src !== targetLogo) {
        logoImg.src = targetLogo;
      }

      // Preserve aspect ratio for the 72px modal logo so non-square logos aren't squished
      if (logoImg.classList.contains('h-[72px]') || logoImg.getAttribute('alt') === 'AI Assistant Logo') {
        logoImg.style.width = 'auto';
        logoImg.style.maxWidth = 'none';
        logoImg.style.objectFit = 'contain';
      }
    });
  }

  setInterval(updateAssistantLogos, 500);
})();
