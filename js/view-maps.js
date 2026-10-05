/* ==========================================================================
   Maps. Opens by asking where to go. Picking a city flies a plane from where
   you are (it starts in the city where you are based) to the city you chose,
   draws the route, zooms in, and opens that city.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;
  const W = window.KALLY_WORLD;
  const NS = 'http://www.w3.org/2000/svg';

  KY.views = KY.views || {};
  const based = D.places.find((p) => p.group === 'based') || D.places[0];
  KY.state = KY.state || {};
  KY.state.at = KY.state.at || based.id;       // where the plane is parked
  KY.state.legs = KY.state.legs || [];         // flights taken so far

  /* ---------- map math ---------- */
  const rad = Math.PI / 180;
  const my = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * rad));
  const px = (lon) => ((lon + 180) / 360) * W.w;
  const py = (lat) => (W.yTop - my(lat)) * W.k;
  const pt = (p) => ({ x: px(p.lon), y: py(p.lat) });
  const mod = (x, n) => ((x % n) + n) % n;
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  function km(a, b) {
    const R = 6371, dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(x)));
  }

  /* A curved route. If the short way round the world crosses the edge of the
     map (Los Angeles to Tokyo), the route leaves one side and enters the other. */
  function leg(A, B) {
    let bx = B.x;
    const dx = B.x - A.x;
    if (Math.abs(dx) > W.w / 2) bx = B.x - Math.sign(dx) * W.w;
    const dist = Math.hypot(bx - A.x, B.y - A.y);
    const cx = (A.x + bx) / 2;
    const cy = Math.max(10, (A.y + B.y) / 2 - dist * 0.26);
    const at = (t) => ({
      x: (1 - t) * (1 - t) * A.x + 2 * (1 - t) * t * cx + t * t * bx,
      y: (1 - t) * (1 - t) * A.y + 2 * (1 - t) * t * cy + t * t * B.y,
    });
    const tan = (t) => ({ x: 2 * (1 - t) * (cx - A.x) + 2 * t * (bx - cx), y: 2 * (1 - t) * (cy - A.y) + 2 * t * (B.y - cy) });
    const d = (o) => `M${(A.x + o).toFixed(1)} ${A.y.toFixed(1)}Q${(cx + o).toFixed(1)} ${cy.toFixed(1)} ${(bx + o).toFixed(1)} ${B.y.toFixed(1)}`;
    const wrap = bx !== B.x ? (bx < 0 ? W.w : -W.w) : 0;
    return { at, tan, d, wrap, dist };
  }

  /* ---------- drawing ---------- */
  const PLANE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="var(--scr-bg)" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"
      d="M12 2.2L13.6 9.2L21.6 13.6V15.4L13.6 13.4L13 19L15.6 20.8V22L12 21L8.4 22V20.8L11 19L10.4 13.4L2.4 15.4V13.6L10.4 9.2Z"/></svg>`;

  function localTime(tz) {
    try { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date()); } catch (e) { return ''; }
  }

  function render(r, ctx) {
    const state = { alive: true, flying: false, skip: false };
    const aspect = W.w / W.h;
    const pct = (p) => ({ left: ((p.x / W.w) * 100).toFixed(3) + '%', top: ((p.y / W.h) * 100).toFixed(3) + '%' });

    /* the map: two paintings (day and night), fine lines, and the routes */
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W.w} ${W.h}`);
    svg.setAttribute('class', 'map-lines');
    svg.setAttribute('aria-hidden', 'true');
    let grat = '';
    for (let lon = -150; lon <= 150; lon += 30) grat += `M${px(lon).toFixed(1)} 0V${W.h}`;
    [-30, 0, 30, 60].forEach((lat) => { grat += `M0 ${py(lat).toFixed(1)}H${W.w}`; });
    const past = KY.state.legs.map((l, i, all) => {
      const g = leg(pt(D.placeById[l[0]]), pt(D.placeById[l[1]]));
      const op = i === all.length - 1 ? 0.7 : 0.35;
      return `<path d="${g.d(0)}" class="route-past" opacity="${op}"/>` + (g.wrap ? `<path d="${g.d(g.wrap)}" class="route-past" opacity="${op}"/>` : '');
    }).join('');
    svg.innerHTML = `<path d="${grat}" class="grat"/><path d="${W.path}" class="coast"/>${past}<g class="routes"></g>`;
    const routes = svg.querySelector('.routes');

    const plane = h('div', { class: 'plane', 'aria-hidden': 'true', html: PLANE_SVG });
    const readout = h('div', { class: 'readout', 'aria-live': 'polite' });

    const pins = {};
    const pinEls = D.places.map((p) => {
      const a = h('a', { class: 'pin pin--' + p.group, href: KY.href.place(p.id), 'data-id': p.id, style: pct(pt(p)), 'aria-label': p.name + ', ' + p.sub },
        h('span', { class: 'pin-ring', 'aria-hidden': 'true' }),
        h('span', { class: 'pin-icon', 'aria-hidden': 'true' }, site.map.pin || '📍'),
        h('span', { class: 'pin-code', 'aria-hidden': 'true' }, p.code),
        h('span', { class: 'pin-card', 'aria-hidden': 'true' },
          h('span', { class: 'pin-name' }, p.name),
          h('span', { class: 'pin-sub' }, p.sub + '  ' + localTime(p.tz)),
          h('span', { class: 'pin-go' }, 'Fly here', KY.icon('arrow-long'))));
      a.addEventListener('click', (e) => { e.preventDefault(); fly(p.id); });
      pins[p.id] = a;
      return a;
    });

    const cam = h('div', { class: 'mapcam', style: { '--aspect': aspect.toFixed(4) } },
      h('img', { class: 'map-day', src: 'assets/watercolor/map.webp', alt: '', decoding: 'async' }),
      h('img', { class: 'map-night', src: 'assets/watercolor/map-night.webp', alt: '', decoding: 'async' }),
      svg, ...pinEls, plane);

    /* the question */
    const choose = (p) => h('button', { class: 'ask-btn', type: 'button', onclick: () => fly(p.id) }, p.name, h('i', null, p.code));
    const groups = site.groups.places.map(([key, label]) => {
      const list = D.places.filter((p) => p.group === key);
      return list.length ? h('div', { class: 'ask-group' }, h('h3', null, label), h('div', { class: 'ask-list' }, list.map(choose))) : null;
    });
    const ask = h('div', { class: 'ask' },
      h('h2', { class: 'ask-title', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, site.map.ask), h('div', { class: 'ask-groups' }, groups));
    ask.addEventListener('click', (e) => { if (e.target === ask) ask.classList.add('is-gone'); });

    const box = h('div', { class: 'mapbox' }, cam, readout, ask);
    const root = h('div', { class: 'view view--maps' }, box);

    /* park the plane where it is */
    const parked = D.placeById[KY.state.at] || based;
    function park(id, heading) {
      const p = pt(D.placeById[id]);
      plane.style.left = ((p.x / W.w) * 100) + '%';
      plane.style.top = ((p.y / W.h) * 100) + '%';
      plane.style.transform = `translate(-50%, -50%) translate(16px, 6px) rotate(${heading == null ? 32 : heading}deg) scale(.8)`;
    }
    park(parked.id);
    pins[parked.id].classList.add('is-here');

    /* the flight */
    async function fly(id) {
      if (state.flying || !state.alive) return;
      const from = KY.state.at;
      ask.classList.add('is-gone');
      if (from === id || KY.reducedMotion()) { await arrive(id, from === id ? 0 : 1); return; }
      state.flying = true;
      const a = D.placeById[from], b = D.placeById[id];
      const g = leg(pt(a), pt(b));
      const mk = (o, cls) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', g.d(o)); p.setAttribute('class', cls); return p;
      };
      const paths = [mk(0, 'route-now')];
      if (g.wrap) paths.push(mk(g.wrap, 'route-now'));
      paths.forEach((p) => routes.append(p));
      const len = paths[0].getTotalLength();
      paths.forEach((p) => { p.style.strokeDasharray = `${len} ${len}`; p.style.strokeDashoffset = len; });

      readout.innerHTML = '';
      readout.append(h('span', { class: 'ro-route' }, a.code, KY.icon('arrow-long'), b.code), h('span', { class: 'ro-km' }, km(a, b).toLocaleString('en-US') + ' km'));
      readout.classList.add('is-on');
      pins[from].classList.remove('is-here');
      plane.classList.add('is-flying');

      const ms = Math.min(3300, Math.max(2000, 1500 + g.dist * 2.5));
      const t0 = performance.now();
      await new Promise((resolve) => {
        (function step(now) {
          if (!state.alive) { resolve(); return; }
          const p = state.skip ? 1 : Math.min(1, (now - t0) / ms);
          const t = easeInOut(p);
          paths.forEach((el) => { el.style.strokeDashoffset = len * (1 - t); });
          const pos = g.at(t), tg = g.tan(Math.min(0.999, Math.max(0.001, t)));
          const ang = Math.atan2(tg.y, tg.x) * 180 / Math.PI + 90;
          plane.style.left = ((mod(pos.x, W.w) / W.w) * 100) + '%';
          plane.style.top = ((pos.y / W.h) * 100) + '%';
          plane.style.transform = `translate(-50%, -50%) rotate(${ang}deg) scale(${1 + 0.35 * Math.sin(Math.PI * t)})`;
          if (p < 1) requestAnimationFrame(step); else resolve();
        })(t0);
      });
      if (!state.alive) return;
      plane.classList.remove('is-flying');
      KY.state.legs.push([from, id]);
      KY.state.at = id;
      state.flying = false;
      await arrive(id, 1);
    }

    async function arrive(id, flew) {
      if (!state.alive) return;
      const el = pins[id];
      el.classList.add('is-arrived');
      if (flew) park(id);
      const p = pt(D.placeById[id]);
      if (!KY.reducedMotion()) {
        cam.style.transformOrigin = `${(p.x / W.w) * 100}% ${(p.y / W.h) * 100}%`;
        cam.classList.add('is-zoomed');
        await KY.wait(720);
      }
      if (!state.alive) return;
      const vb = document.querySelector('.scr-view').getBoundingClientRect();
      const ib = el.querySelector('.pin-icon').getBoundingClientRect();
      KY.go(KY.href.place(id), { via: 'fly', origin: { x: ib.left + ib.width / 2 - vb.left, y: ib.top + ib.height * 0.85 - vb.top } });
    }

    root._onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (state.flying) { state.skip = true; e.preventDefault(); e.stopPropagation(); return; }
      if (!ask.classList.contains('is-gone')) { ask.classList.add('is-gone'); e.preventDefault(); e.stopPropagation(); }
    };
    root.addEventListener('keydown', root._onKey);
    root._leave = () => { state.alive = false; };
    return root;
  }

  KY.views.maps = {
    title: () => 'Maps',
    back: () => ({ href: KY.href.menu, label: site.ui.menu }),
    render,
  };
})();
