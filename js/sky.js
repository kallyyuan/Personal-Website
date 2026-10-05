/* ==========================================================================
   The window: a painted sky with watercolor clouds, following the visitor's
   time of day. Dawn 5 to 8, day 8 to 17, dusk 17 to 20, night after that.
   To preview one, add ?time=night (or dawn, day, dusk) to the address.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const root = document.getElementById('sky');
  const BASE = 'assets/watercolor/';
  const KINDS = ['dawn', 'day', 'dusk', 'night'];

  /* Cloud layers. Each row is [picture 1 to 5, left %, top %, width in vw].
     The top middle is left clear so the headline stays easy to read. */
  const LAYERS = [
    { name: 'far', parallax: 0.4, opacity: 0.62, clouds: [
      [3, -4, 7, 24], [5, 72, 5, 28], [2, 88, 28, 20], [4, 2, 38, 17], [1, 60, 40, 18], [4, 104, 12, 20],
    ] },
    { name: 'near', parallax: 1.1, opacity: 0.96, clouds: [
      [1, -12, 56, 40], [3, 20, 72, 34], [2, 52, 66, 44], [5, 84, 54, 38], [4, 38, 84, 30], [3, 108, 70, 36], [2, -8, 80, 34],
    ] },
  ];

  const timeOfDay = (d) => {
    const hr = d.getHours();
    return hr >= 5 && hr < 8 ? 'dawn' : hr >= 8 && hr < 17 ? 'day' : hr >= 17 && hr < 20 ? 'dusk' : 'night';
  };
  const forced = new URLSearchParams(location.search).get('time');
  const override = KINDS.includes(forced) ? forced : null;

  let current = null, rand = 3;
  const rnd = () => ((rand = (rand * 16807) % 2147483647) / 2147483647);

  function buildClouds(kind) {
    const wrap = KY.h('div', { class: 'clouds' });
    LAYERS.forEach((L) => {
      const layer = KY.h('div', { class: 'cloud-layer cloud-layer--' + L.name, style: { '--parallax': L.parallax, opacity: L.opacity } });
      L.clouds.forEach(([n, left, top, w], i) => {
        const img = new Image();
        img.className = 'cloud';
        img.alt = ''; img.decoding = 'async';
        img.src = BASE + 'cloud-' + kind + '-' + n + '.webp';
        img.style.left = left + '%';
        img.style.top = top + '%';
        img.style.width = w + 'vw';
        img.style.setProperty('--dur', (110 + rnd() * 110).toFixed(0) + 's');
        img.style.setProperty('--delay', (-rnd() * 80).toFixed(0) + 's');
        if (i % 2) img.style.animationDirection = 'alternate-reverse';
        layer.append(img);
      });
      wrap.append(layer);
    });
    return wrap;
  }

  function set(kind) {
    if (kind === current) return;
    current = kind;
    document.body.dataset.time = kind;

    const img = new Image();
    img.className = 'sky-wash';
    img.alt = ''; img.decoding = 'async';
    img.src = BASE + 'sky-' + kind + '.webp';
    const clouds = buildClouds(kind);
    clouds.classList.add('is-fresh');

    const show = () => {
      const oldWash = Array.from(root.querySelectorAll('.sky-wash'));
      const oldClouds = Array.from(root.querySelectorAll('.clouds'));
      root.prepend(img);
      root.append(clouds);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        img.classList.add('is-in');
        clouds.classList.remove('is-fresh');
        oldWash.forEach((o) => { o.classList.remove('is-in'); setTimeout(() => o.remove(), 2600); });
        oldClouds.forEach((o) => { o.classList.add('is-fresh'); setTimeout(() => o.remove(), 2600); });
      }));
    };
    if (img.complete) show(); else { img.onload = show; img.onerror = show; }
  }

  ['a', 'b'].forEach((v) => {
    const m = new Image();
    m.className = 'sky-mist' + (v === 'b' ? ' sky-mist--b' : '');
    m.alt = ''; m.decoding = 'async'; m.src = BASE + 'mist.webp';
    root.append(m);
  });

  set(override || timeOfDay(new Date()));
  if (!override) setInterval(() => set(timeOfDay(new Date())), 5 * 60 * 1000);

  KY.sky = {
    kind: () => current,
    setTime: set,
    /* each screen nudges the clouds sideways, so moving through the site feels like flying */
    setShift(n) { root.style.setProperty('--route-shift', n); },
  };
})();
