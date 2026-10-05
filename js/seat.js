/* ==========================================================================
   Screen 2: the seatback. One frame holds the menu and, in time, every
   section (Work, Writing, Maps, Music, Play).
   Details: seat belt sign, reading light (night palette), volume button.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;
  const el = document.getElementById('screen-seat');
  const NS = 'http://www.w3.org/2000/svg';
  const W = window.KALLY_WORLD;

  let viewEl, backEl, brandEl, timeEl, footEl, footCount, bootEl, beltEl, lightBtn, clock = 0, beltTimer = 0;
  const based = D.places.find((p) => p.group === 'based') || D.places[0];
  const NIGHT_KEY = 'ky-night';

  /* ---------- map projection (same as the shape file) ---------- */
  const rad = Math.PI / 180;
  const my = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * rad));
  const px = (lon) => ((lon + 180) / 360) * W.w;
  const py = (lat) => (W.yTop - my(lat)) * W.k;

  /* ---------- fine line art for the tiles ---------- */
  const ART = {
    work: `<svg viewBox="0 0 120 90" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1">
        <path d="M14 10V76H112"/><path d="M14 58H112M14 42H112M14 26H112" stroke-dasharray="1 3.5" opacity=".55"/>
        <path d="M14 64L34 54L52 60L72 34L92 42L112 18"/>
        <circle cx="34" cy="54" r="2" class="pt"/><circle cx="52" cy="60" r="2" class="pt"/><circle cx="72" cy="34" r="2" class="pt"/><circle cx="92" cy="42" r="2" class="pt"/>
        <circle cx="112" cy="18" r="3" fill="#E07B39" stroke="none"/></g></svg>`,
    writing: `<svg viewBox="0 0 120 90" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round">
        <path d="M60 6C70 24 80 40 80 54C80 65 72 73 60 84C48 73 40 65 40 54C40 40 50 24 60 6Z"/>
        <path d="M60 38V80"/><circle cx="60" cy="38" r="3.4"/><path d="M45 56H75" opacity=".55"/></g>
        <circle cx="60" cy="38" r="1.4" fill="#E07B39"/></svg>`,
    music: `<svg viewBox="0 0 120 90" aria-hidden="true"><defs><clipPath id="sleeve-cut"><path clip-rule="evenodd" d="M0 0H120V90H0Z M10 14H72V76H10Z"/></clipPath></defs>
        <g fill="none" stroke="currentColor" stroke-width="1">
        <g clip-path="url(#sleeve-cut)"><circle cx="76" cy="45" r="33"/><circle cx="76" cy="45" r="29" opacity=".5"/><circle cx="76" cy="45" r="25" opacity=".5"/><circle cx="76" cy="45" r="21" opacity=".5"/><circle cx="76" cy="45" r="9"/></g>
        <rect x="10" y="14" width="62" height="62"/><path d="M10 62L72 62" opacity=".55"/></g>
        <circle cx="76" cy="45" r="1.8" fill="#E07B39"/></svg>`,
    play: `<svg viewBox="0 0 120 90" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"
        d="M35 17C45 17 60 22 55 12C50 2 70 2 65 12C60 22 75 17 85 17C85 27 80 42 90 37C100 32 100 52 90 47C80 42 85 57 85 67C75 67 60 62 65 72C70 82 50 82 55 72C60 62 45 67 35 67C35 57 40 42 30 47C20 52 20 32 30 37C40 42 35 27 35 17Z"/>
        <circle cx="60" cy="42" r="1.8" fill="#E07B39"/></svg>`,
  };

  function miniMap() {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W.w} ${W.h}`);
    svg.setAttribute('class', 'mini-svg');
    svg.setAttribute('aria-hidden', 'true');
    let grat = '';
    for (let lon = -150; lon <= 150; lon += 30) grat += `M${px(lon).toFixed(1)} 0V${W.h}`;
    [-30, 0, 30, 60].forEach((lat) => { grat += `M0 ${py(lat).toFixed(1)}H${W.w}`; });
    const dots = D.places.map((p, i) => {
      const x = px(p.lon).toFixed(1), y = py(p.lat).toFixed(1), r = p.group === 'based' ? 6.4 : 4.2;
      return `<g class="dot" style="--d:${(-i * 0.8).toFixed(1)}s"><circle class="dot-ring" cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r}" fill="#E07B39"/></g>`;
    }).join('');
    svg.innerHTML = `<path d="${grat}" fill="none" stroke="currentColor" stroke-width=".5" stroke-dasharray="1 5" opacity=".35"/>
      <path d="${W.path}" fill="none" stroke="currentColor" stroke-width=".6" stroke-linejoin="round" opacity=".75" vector-effect="non-scaling-stroke"/>${dots}`;
    return h('div', { class: 'mini-map', style: { '--aspect': (W.w / W.h).toFixed(4) } },
      h('img', { class: 'mini-day', src: 'assets/watercolor/map.webp', alt: '', decoding: 'async' }),
      h('img', { class: 'mini-night', src: 'assets/watercolor/map-night.webp', alt: '', decoding: 'async' }),
      svg);
  }

  /* ---------- the menu ---------- */
  function lines(id) {
    const c = D.counts;
    switch (id) {
      case 'maps': return [['Based', based ? based.name : ''], ['Been', c.maps.been + ' places']];
      case 'work': return site.groups.work.map(([k, label]) => [label, c.work[k]]);
      case 'writing': return site.groups.writing.map(([k, label]) => [label, c.writing[k]]);
      case 'music': return [['Albums', c.music.total]];
      case 'play': return [['Games', c.play.total]];
      default: return [];
    }
  }

  function renderHub() {
    const tiles = site.hub.tiles.map((t, i) => {
      const art = t.id === 'maps' ? miniMap() : h('div', { class: 'tile-art', html: ART[t.id] || '' });
      return h('a', { class: 'tile tile--' + t.id, href: KY.href.section(t.id), 'data-id': t.id },
        h('div', { class: 'tile-top' }, h('span', { class: 'tile-n' }, KY.pad2(i + 1)), KY.icon('arrow-long', 'tile-go')),
        art,
        h('div', { class: 'tile-bottom' },
          h('h2', { class: 'tile-label' }, t.label),
          h('ul', { class: 'tile-lines' }, lines(t.id).map(([k, v]) => h('li', null, h('span', null, k), h('b', null, v))))));
    });
    const grid = h('div', { class: 'hub', role: 'group', 'aria-label': 'Menu' }, tiles);
    grid.addEventListener('keydown', navTiles);
    return h('div', { class: 'view view--hub' },
      h('h1', { class: 'sr-only', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, 'Menu'), grid);
  }

  /* arrow keys move to the nearest tile in that direction */
  function navTiles(e) {
    const dirs = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
    const d = dirs[e.key];
    if (!d) return;
    const tiles = Array.from(e.currentTarget.querySelectorAll('.tile'));
    const cur = tiles.indexOf(document.activeElement);
    if (cur < 0) return;
    const c = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const from = c(tiles[cur].getBoundingClientRect());
    let best = null, bestScore = Infinity;
    tiles.forEach((t, i) => {
      if (i === cur) return;
      const p = c(t.getBoundingClientRect());
      const dx = p.x - from.x, dy = p.y - from.y;
      const along = dx * d[0] + dy * d[1];
      if (along <= 4) return;
      const across = Math.abs(dx * d[1]) + Math.abs(dy * d[0]);
      const score = along + across * 2 + p.y * 0.001;
      if (score < bestScore) { bestScore = score; best = t; }
    });
    if (best) { e.preventDefault(); best.focus(); }
  }

  function renderStub(view) {
    const label = (site.hub.tiles.find((t) => t.id === view) || { label: view[0].toUpperCase() + view.slice(1) }).label;
    return h('div', { class: 'view view--stub' },
      h('h1', { class: 'stub-title', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, label),
      h('p', { class: 'stub-note' }, 'This section is next in the build.'));
  }

  /* ---------- clock, night, belt ---------- */
  function tick() {
    if (!timeEl || !based) return;
    let t = '';
    try { t = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: based.tz }).format(new Date()); } catch (e) { /* ignore */ }
    timeEl.textContent = based.name + '  ' + t;
  }
  function setNight(on, save) {
    el.dataset.night = on ? 'true' : 'false';
    lightBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (save) { try { localStorage.setItem(NIGHT_KEY, on ? 'on' : 'off'); } catch (e) { /* ignore */ } }
  }

  function build() {
    const seatNo = site.pass.stubSeat || '1A';
    beltEl = h('div', { class: 'belt', 'aria-hidden': 'true' }, KY.icon('belt'));

    backEl = h('a', { class: 'scr-back', href: KY.href.menu }, KY.icon('arrow-left'), h('span', null, site.ui.menu));
    brandEl = h('span', { class: 'scr-brand' }, site.pass.airline);
    timeEl = h('span', { class: 'scr-time' });
    const bar = h('header', { class: 'scr-bar' }, h('div', { class: 'scr-left' }, backEl, brandEl), timeEl);
    viewEl = h('div', { class: 'scr-view' });
    footCount = h('span', { class: 'foot-count' });
    const wink = (e) => (e ? h('span', { class: 'emoji', 'aria-hidden': 'true' }, e) : null);
    footEl = h('footer', { class: 'scr-foot' },
      h('a', { class: 'foot-link', href: KY.href.tour }, h('span', null, site.tour.label + ', ' + site.tour.minutes + ' minutes'), wink(site.tour.emoji), KY.icon('arrow-long')),
      h('a', { class: 'foot-link', href: KY.href.passport }, h('span', null, site.ui.passport), wink(site.ui.passportEmoji), footCount));
    bootEl = h('div', { class: 'boot', 'aria-hidden': 'true' }, h('span', null, site.pass.airline));
    const ui = h('div', { class: 'screen-ui' }, bar, viewEl, footEl);

    const vol = h('button', { class: 'vol', type: 'button', 'data-sound-toggle': '', 'aria-pressed': 'false', 'aria-label': site.ui.sound }, KY.icon('speaker-off'));
    const scene = h('div', { class: 'scene' },
      h('div', { class: 'glass' }, ui, h('div', { class: 'glare', 'aria-hidden': 'true' }), bootEl),
      beltEl,
      h('div', { class: 'bezel-items' },
        h('span', { class: 'bezel-mark', 'aria-hidden': 'true' }, site.pass.airline + '  ' + seatNo),
        h('div', { class: 'bezel-ports' }, h('span', { class: 'jack', 'aria-hidden': 'true' }), vol)));
    el.append(h('div', { class: 'seat-stage' }, scene));

    /* the reading light lives in the header */
    lightBtn = document.getElementById('hud-light');
    lightBtn.addEventListener('click', () => setNight(el.dataset.night !== 'true', true));
    let night = false;
    try { night = localStorage.getItem(NIGHT_KEY) === 'on'; } catch (e) { /* ignore */ }
    setNight(night, false);
    tick();
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.dataset.view && el.dataset.view !== 'menu' && !e.defaultPrevented) KY.go(KY.href.menu);
    });
  }

  let currentNode = null;

  KY.screens.seat = {
    el,
    placeId: null,
    init: build,
    title(r) {
      const view = (r && r.view) || 'menu';
      const V = KY.views && KY.views[view];
      if (V && V.title) return V.title(r);
      const t = site.hub.tiles.find((x) => x.id === view);
      return t ? t.label : 'Menu';
    },
    enter(r, ctx) {
      const view = r.view || 'menu';
      if (KY.passport) { KY.passport.board(); footCount.textContent = KY.passport.count() + '/' + KY.passport.total(); }
      el.dataset.view = view;
      el.classList.toggle('is-hub', view === 'menu');
      const V = KY.views && KY.views[view];
      const next = view === 'menu' ? renderHub() : V ? V.render(r, ctx) : renderStub(view);
      const back = V && V.back ? V.back(r) : { href: KY.href.menu, label: site.ui.menu };
      backEl.setAttribute('href', back.href);
      backEl.lastChild.textContent = back.label;

      if (currentNode && currentNode._leave) currentNode._leave();
      if (currentNode && currentNode._onKey) currentNode.removeEventListener('keydown', currentNode._onKey);
      const old = viewEl.firstElementChild;
      const via = ctx.opts && ctx.opts.via;
      if (via === 'fly' && old && ctx.same && ctx.opts.origin && !KY.reducedMotion()) {
        /* the new page opens like a lens from the pin you flew to */
        next.classList.add('is-overlay');
        viewEl.append(next);
        const o = ctx.opts.origin;
        const R = Math.hypot(Math.max(o.x, viewEl.clientWidth - o.x), Math.max(o.y, viewEl.clientHeight - o.y)) + 40;
        const done = () => { if (old.parentNode) old.remove(); next.classList.remove('is-overlay'); next.style.clipPath = ''; };
        KY.animate(next, [{ clipPath: `circle(0px at ${o.x}px ${o.y}px)` }, { clipPath: `circle(${R}px at ${o.x}px ${o.y}px)` }], { duration: 950, easing: 'cubic-bezier(.65, 0, .25, 1)' }).finished.then(done, done);
      } else {
        viewEl.replaceChildren(next);
        if (ctx.same) KY.animate(next, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 600 });
      }
      currentNode = next;
      viewEl.scrollTop = 0;
      clearInterval(clock);
      clock = setInterval(tick, 20000);
      tick();
    },
    arrive(kind) {
      clearTimeout(beltTimer);
      beltEl.classList.remove('is-lit');
      if (kind !== 'tear' || KY.reducedMotion()) return;
      /* the screen wakes, the belt sign is lit, then goes out with a chime */
      el.classList.add('is-booting');
      beltEl.classList.add('is-lit');
      beltTimer = setTimeout(() => { beltEl.classList.remove('is-lit'); if (KY.audio) KY.audio.chime(); }, 2800);
      setTimeout(() => el.classList.remove('is-booting'), 3400);
    },
    leave() { clearInterval(clock); if (currentNode && currentNode._leave) currentNode._leave(); },
  };
})();
