/* ==========================================================================
   Screen 2: the world map with its lighthouses.
   Stops come from the place files (lat, lon). Add a file, get a lighthouse.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const el = document.getElementById('screen-map');
  const W = window.KALLY_WORLD;
  const places = KY.data.places;
  const SVGNS = 'http://www.w3.org/2000/svg';

  const rad = Math.PI / 180;
  const my = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * rad));
  const px = (lon) => ((lon + 180) / 360) * W.w;
  const py = (lat) => (W.yTop - my(lat)) * W.k;

  let world, scroll, curtain, lights = {};

  const LIGHTHOUSE = `<svg class="lh-svg" viewBox="0 0 60 100" aria-hidden="true" focusable="false">
    <ellipse cx="30" cy="95" rx="25" ry="5" fill="#bcd8ef"/>
    <path d="M18 95L22 40H38L42 95Z" fill="#fff" stroke="#17507f" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M19.3 75L20.5 62H39.5L40.7 75Z" fill="#6fb0e8"/>
    <path d="M21.4 55L22.1 46H37.9L38.6 55Z" fill="#6fb0e8"/>
    <rect x="16" y="35" width="28" height="6" rx="2.5" fill="#1f6db3" stroke="#17507f" stroke-width="1.2"/>
    <rect class="lh-lamp" x="23" y="21" width="14" height="14" rx="2.5" fill="#ffe08a" stroke="#17507f" stroke-width="1.4"/>
    <path d="M23 28h14M30 21v14" stroke="#f2a43f" stroke-width="1.2"/>
    <path d="M20 22L30 9L40 22Z" fill="#1f6db3" stroke="#17507f" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="30" cy="7" r="2.6" fill="#1f6db3" stroke="#17507f" stroke-width="1"/>
  </svg>`;

  function arc(a, b, lift) {
    const mx = (a.x + b.x) / 2, my2 = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * lift;
    return `Q${mx.toFixed(1)} ${my2.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }

  function buildSvg() {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'map-svg');
    svg.setAttribute('viewBox', `0 0 ${W.w} ${W.h}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    let grat = '';
    for (let lon = -150; lon <= 150; lon += 30) grat += `M${px(lon).toFixed(1)} 0V${W.h}`;
    [-30, 0, 30, 60].forEach((lat) => { grat += `M0 ${py(lat).toFixed(1)}H${W.w}`; });

    const pts = places.map((p) => ({ x: px(p.lon), y: py(p.lat), id: p.id }));
    const byId = Object.fromEntries(pts.map((p) => [p.id, p]));
    const route = ['los-angeles', 'new-york', 'kenya', 'shanghai', 'tokyo'].filter((id) => byId[id]).map((id) => byId[id]);
    let d = route.length ? `M${route[0].x.toFixed(1)} ${route[0].y.toFixed(1)}` : '';
    for (let i = 1; i < route.length; i++) d += arc(route[i - 1], route[i], 0.22);

    svg.innerHTML = `
      <defs>
        <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6f2fc"/></linearGradient>
        <pattern id="landDots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1.4" cy="1.4" r=".65" fill="#b9d8f2"/></pattern>
        <path id="land" d="${W.path}"/>
        <clipPath id="landClip"><use href="#land"/></clipPath>
        <path id="flightPath" d="${d}"/>
      </defs>
      <path d="${grat}" fill="none" stroke="#fff" stroke-width=".7" stroke-dasharray="2 5" opacity=".85"/>
      <use href="#land" transform="translate(0 3.5)" fill="#7fb4e0" opacity=".38"/>
      <use href="#land" fill="url(#landGrad)" stroke="#8fc0e8" stroke-width=".9" stroke-linejoin="round"/>
      <rect width="${W.w}" height="${W.h}" fill="url(#landDots)" clip-path="url(#landClip)" opacity=".75"/>
      <use href="#flightPath" fill="none" stroke="#1f6db3" stroke-width="1" stroke-dasharray="1.5 6" stroke-linecap="round" opacity=".5" class="flight-line"/>
      <g class="flight-plane"><g transform="rotate(90)"><path d="M0 -8L2.2 -2.5L9 1.5V3.6L2.2 1.8L1.8 6.2L4 8V9.4L0 8.4L-4 9.4V8L-1.8 6.2L-2.2 1.8L-9 3.6V1.5L-2.2 -2.5Z" fill="#fff" stroke="#1f6db3" stroke-width=".9" stroke-linejoin="round"/></g>
        <animateMotion dur="70s" repeatCount="indefinite" rotate="auto"><mpath href="#flightPath"/></animateMotion></g>`;
    return svg;
  }

  function buildLights() {
    const frag = document.createDocumentFragment();
    places.forEach((p, i) => {
      const a = h('a', {
        class: 'lh', href: KY.href.place(p.id), 'data-place': p.id,
        style: { left: ((px(p.lon) / W.w) * 100).toFixed(3) + '%', top: ((py(p.lat) / W.h) * 100).toFixed(3) + '%', '--d': (-i * 0.9) + 's' },
        'aria-label': p.name + ', ' + p.sub,
      },
        h('span', { class: 'lh-ring', 'aria-hidden': 'true' }),
        h('span', { class: 'lh-glow', 'aria-hidden': 'true' }),
        h('span', { class: 'lh-beam lh-beam--l', 'aria-hidden': 'true' }),
        h('span', { class: 'lh-beam lh-beam--r', 'aria-hidden': 'true' }),
        h('span', { class: 'lh-icon', html: LIGHTHOUSE }),
        h('span', { class: 'lh-label', 'aria-hidden': 'true' },
          h('span', { class: 'lh-name' }, p.name),
          h('span', { class: 'lh-sub' }, p.sub),
          h('span', { class: 'lh-go' }, KY.data.site.ui.flyTo + ' ' + p.name, KY.icon('arrow-long'))));
      a.addEventListener('pointerdown', (e) => { a._pt = e.pointerType; });
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (a._pt === 'touch' && !a.classList.contains('is-active')) { activate(a); return; }
        fly(p.id);
      });
      a.addEventListener('mouseenter', () => { a.parentNode.append(a); }); // raise above neighbors
      lights[p.id] = a;
      frag.append(a);
    });
    return frag;
  }

  function activate(a) {
    Object.values(lights).forEach((x) => x.classList.toggle('is-active', x === a));
  }

  function originOf(placeId) {
    const a = lights[placeId];
    if (!a) return null;
    const r = a.querySelector('.lh-icon').getBoundingClientRect();
    return {
      x: Math.min(innerWidth - 20, Math.max(20, r.left + r.width / 2)),
      y: Math.min(innerHeight - 20, Math.max(20, r.top + r.height * 0.3)),
    };
  }

  function fly(placeId) {
    const a = lights[placeId];
    if (scroll.scrollWidth > scroll.clientWidth + 2) {
      const r = a.getBoundingClientRect(), s = scroll.getBoundingClientRect();
      scroll.scrollLeft += r.left + r.width / 2 - (s.left + s.width / 2);
    }
    KY.go(KY.href.place(placeId), { origin: originOf(placeId) });
  }

  /* zoom the map toward (or back out from) a lighthouse */
  function zoom(o, dir) {
    if (scroll.scrollWidth <= scroll.clientWidth + 1) el.classList.add('is-zooming');
    const rect = world.getBoundingClientRect();
    world.style.transformOrigin = `${o.x - rect.left}px ${o.y - rect.top}px`;
    const to = `translate(${innerWidth / 2 - o.x}px, ${innerHeight / 2 - o.y}px) scale(2.6)`;
    const frames = dir === 'in' ? [{ transform: 'none' }, { transform: to }] : [{ transform: to }, { transform: 'none' }];
    return KY.animate(world, frames, { duration: dir === 'in' ? 1500 : 1100, easing: 'cubic-bezier(.5, 0, .2, 1)' }).finished;
  }

  /* clouds that part when you arrive from the boarding gate */
  function arrive(kind) {
    if (kind !== 'tear' || KY.reducedMotion()) return;
    curtain.hidden = false;
    const kids = Array.from(curtain.children);
    const anims = kids.map((c, i) => {
      const dir = i % 2 ? 1 : -1;
      return KY.animate(c, [
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
        { offset: 0.35, opacity: 1 },
        { transform: `translate3d(${dir * (70 + (i % 3) * 25)}vw, ${(i % 2 ? -1 : 1) * 8}vh, 0) scale(1.15)`, opacity: 0 },
      ], { duration: 2600 + i * 120, delay: 380 + i * 60, easing: 'cubic-bezier(.5, 0, .3, 1)' }).finished;
    });
    Promise.allSettled(anims).then(() => { curtain.hidden = true; });
  }

  function build() {
    scroll = h('div', { class: 'map-scroll' });
    world = h('div', { class: 'map-world', style: { '--aspect': (W.w / W.h).toFixed(4) } });
    world.append(buildSvg(), buildLights());
    scroll.append(world);

    const departures = h('nav', { class: 'departures', 'aria-label': KY.data.site.map.departures },
      places.map((p) => {
        const a = h('a', { class: 'dep', href: KY.href.place(p.id) }, KY.icon('plane'), p.name);
        a.addEventListener('click', (e) => { e.preventDefault(); fly(p.id); });
        return a;
      }));

    const decor = h('div', { class: 'map-fore', 'aria-hidden': 'true' },
      [['a', -6, 70, 24], ['c', 80, 12, 14], ['d', 78, 76, 28], ['c', 2, 14, 12]].map(([v, l, t, w]) => cloud(v, l, t, w)));

    curtain = h('div', { class: 'map-curtain', 'aria-hidden': 'true', hidden: true },
      [['a', -10, 6, 60], ['d', 40, 0, 70], ['b', 70, 14, 46], ['d', -14, 38, 64], ['a', 52, 40, 62], ['b', 8, 62, 50], ['d', 56, 68, 70], ['a', -16, 74, 58]].map(([v, l, t, w]) => cloud(v, l, t, w)));

    el.append(
      h('h1', { class: 'map-title', id: 'map-title', 'data-focus': '', tabindex: '-1' }, KY.data.site.map.title),
      scroll, departures, decor, curtain);

    /* touch: tap elsewhere to dismiss an open label */
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest || e.target.closest('.lh')) return;
      Object.values(lights).forEach((x) => x.classList.remove('is-active'));
    });
  }

  const VB = { a: '0 0 400 200', b: '0 0 300 220', c: '0 0 230 130', d: '0 0 500 160' };
  function cloud(v, l, t, w) {
    const s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', VB[v]);
    s.setAttribute('class', 'mcloud');
    s.style.cssText = `left:${l}%;top:${t}%;width:${w}vw`;
    const u = document.createElementNS(SVGNS, 'use');
    u.setAttribute('href', '#cloud-' + v);
    s.append(u);
    return s;
  }

  KY.screens.map = {
    el,
    init: build,
    zoom,
    originOf,
    arrive,
    title: () => 'World map',
    enter() {
      el.classList.remove('is-zooming');
      Object.values(lights).forEach((x) => x.classList.remove('is-active'));
      /* on phones start centered on Los Angeles */
      if (!this._centered) {
        this._centered = true;
        requestAnimationFrame(() => {
          if (scroll.scrollWidth > scroll.clientWidth) scroll.scrollLeft = scroll.scrollWidth * 0.17 - scroll.clientWidth / 2;
        });
      }
    },
  };
})();
