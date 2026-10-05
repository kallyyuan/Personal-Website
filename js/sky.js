/* ==========================================================================
   The window: a painted sky that follows the visitor's time of day.
   Dawn 5 to 8, day 8 to 17, dusk 17 to 20, night after that.
   To preview one, add ?time=night (or dawn, day, dusk) to the address.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const root = document.getElementById('sky');
  const BASE = 'assets/watercolor/';
  const KINDS = ['dawn', 'day', 'dusk', 'night'];

  const timeOfDay = (d) => {
    const hr = d.getHours();
    return hr >= 5 && hr < 8 ? 'dawn' : hr >= 8 && hr < 17 ? 'day' : hr >= 17 && hr < 20 ? 'dusk' : 'night';
  };
  const forced = new URLSearchParams(location.search).get('time');
  const override = KINDS.includes(forced) ? forced : null;

  let current = null;
  function set(kind) {
    if (kind === current) return;
    current = kind;
    document.body.dataset.time = kind;
    const img = new Image();
    img.className = 'sky-wash';
    img.alt = '';
    img.decoding = 'async';
    img.src = BASE + 'sky-' + kind + '.webp';
    const show = () => {
      const old = Array.from(root.querySelectorAll('.sky-wash'));
      root.prepend(img);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        img.classList.add('is-in');
        old.forEach((o) => { o.classList.remove('is-in'); setTimeout(() => o.remove(), 2600); });
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
    /* each screen nudges the mist sideways, so moving through the site feels like flying */
    setShift(n) { root.style.setProperty('--route-shift', n); },
  };
})();
