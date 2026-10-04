/* ==========================================================================
   App: routing and the transitions between screens.
   Addresses (what you see after the # in the link):
     #/            boarding gate
     #/map         world map
     #/place/la    seatback menu for a stop   (place id from its content file)
     #/place/la/snacks   a category drawer
     #/piece/la-snack-1  one piece of work
     #/work        the work index, for recruiters (share this link)
   ========================================================================== */
(function () {
  const KY = window.KY;
  const D = KY.data;
  const $ = (s, r) => (r || document).querySelector(s);

  const NAMES = ['gate', 'map', 'seat', 'piece', 'work'];
  const SHIFT = { gate: 0, map: -3, seat: -6, piece: -9, work: -12 };

  NAMES.forEach((n) => { KY.screens[n] = KY.screens[n] || {}; KY.screens[n].el = $('#screen-' + n); });

  let current = null;       // name of the screen on show
  let pendingOpts = null;   // extra info passed along with the next navigation

  /* ---------- routing ---------- */
  function parse(hash) {
    const raw = (hash || '').replace(/^#/, '');
    const [path, query = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = new URLSearchParams(query);
    if (!parts.length) return { name: 'gate', q };
    switch (parts[0]) {
      case 'map': return { name: 'map', q };
      case 'work':
      case 'index': return { name: 'work', q };
      case 'place': {
        if (!D.placeById[parts[1]]) break;
        const cat = parts[2] && D.catById[parts[2]] ? parts[2] : null;
        return { name: 'seat', placeId: parts[1], cat, q };
      }
      case 'piece':
        if (D.itemById[parts[1]]) return { name: 'piece', itemId: parts[1], q };
        break;
    }
    return { name: 'map', q };
  }

  KY.go = function (hash, opts) {
    if (location.hash === hash) { pendingOpts = opts || null; route(); return; }
    pendingOpts = opts || null;
    location.hash = hash;
  };

  /* ---------- transitions ---------- */
  const EASE_SOFT = 'cubic-bezier(.4, 0, .2, 1)';

  function pick(from, to, opts) {
    if (!from) return 'intro';
    if (from === 'gate' && to === 'map' && opts.via === 'tear') return 'tear';
    if (from === 'map' && to === 'seat') return 'irisIn';
    if (from === 'seat' && to === 'map') return 'irisOut';
    if (to === 'piece') return 'rise';
    if (from === 'piece') return 'sink';
    return 'fade';
  }

  const T = {
    intro(f, t) {
      return KY.animate(t, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 900 }).finished;
    },
    fade(f, t) {
      f.style.zIndex = 11; t.style.zIndex = 12;
      return Promise.all([
        KY.animate(t, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 750 }).finished,
        KY.animate(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }).finished,
      ]);
    },
    tear(f, t) {
      f.style.zIndex = 12; t.style.zIndex = 11;
      return Promise.all([
        KY.animate(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, delay: 500, easing: EASE_SOFT }).finished,
        KY.animate(t, [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: 1500, delay: 250 }).finished,
      ]);
    },
    irisIn(f, t, ctx) {
      /* the zoom carries the lighthouse to the middle of the screen, so the light opens from there */
      const o = (ctx.opts && ctx.opts.origin) || { x: innerWidth / 2, y: innerHeight / 2 };
      const c = { x: innerWidth / 2, y: innerHeight / 2 };
      const R = Math.hypot(c.x, c.y) + 60;
      f.style.zIndex = 11; t.style.zIndex = 12;
      const zoom = KY.screens.map.zoom ? KY.screens.map.zoom(o, 'in') : Promise.resolve();
      const reveal = KY.animate(
        t,
        [{ clipPath: `circle(0px at ${c.x}px ${c.y}px)` }, { clipPath: `circle(${R}px at ${c.x}px ${c.y}px)` }],
        { duration: 1000, delay: 650, easing: 'cubic-bezier(.65, 0, .25, 1)' }
      ).finished;
      return Promise.all([zoom, reveal]);
    },
    irisOut(f, t, ctx) {
      const o = (KY.screens.map.originOf && KY.screens.map.originOf(ctx.fromPlace)) || { x: innerWidth / 2, y: innerHeight / 2 };
      const c = { x: innerWidth / 2, y: innerHeight / 2 };
      const R = Math.hypot(c.x, c.y) + 60;
      f.style.zIndex = 12; t.style.zIndex = 11;
      const zoom = KY.screens.map.zoom ? KY.screens.map.zoom(o, 'out') : Promise.resolve();
      const hide = KY.animate(
        f,
        [{ clipPath: `circle(${R}px at ${c.x}px ${c.y}px)` }, { clipPath: `circle(0px at ${c.x}px ${c.y}px)` }],
        { duration: 1000, easing: 'cubic-bezier(.65, 0, .25, 1)' }
      ).finished;
      return Promise.all([zoom, hide]);
    },
    rise(f, t) {
      f.style.zIndex = 11; t.style.zIndex = 12;
      return Promise.all([
        KY.animate(t, [{ opacity: 0, transform: 'translateY(40px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 700 }).finished,
        KY.animate(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 520 }).finished,
      ]);
    },
    sink(f, t) {
      f.style.zIndex = 12; t.style.zIndex = 11;
      return Promise.all([
        KY.animate(t, [{ opacity: 0, transform: 'scale(1.025)' }, { opacity: 1, transform: 'none' }], { duration: 700 }).finished,
        KY.animate(f, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(28px) scale(.99)' }], { duration: 520 }).finished,
      ]);
    },
  };

  function resetScreen(el) {
    /* cancel scripted animations only; the looping CSS animations keep running */
    el.getAnimations({ subtree: true }).forEach((a) => {
      if (!(a instanceof CSSAnimation) && !(a instanceof CSSTransition)) a.cancel();
    });
    el.style.zIndex = '';
    el.style.clipPath = '';
  }

  /* ---------- show a route ---------- */
  async function route() {
    const r = parse(location.hash);
    const opts = pendingOpts || {};
    pendingOpts = null;

    /* after a tear, let the paper keep fluttering while the next screen arrives */
    const keepGate = opts.via === 'tear' && current === 'gate';
    if (!keepGate) KY.finishAnimations();
    NAMES.forEach((n) => {
      const el = KY.screens[n].el;
      if (!(keepGate && n === 'gate')) resetScreen(el);
      if (n !== current) el.hidden = true;
    });

    const to = r.name;
    const S = KY.screens[to];
    const from = current;
    const fromS = from && KY.screens[from];
    const ctx = { from, to, opts, fromPlace: from === 'seat' && fromS.placeId ? fromS.placeId : null };

    document.body.dataset.screen = to;
    KY.sky.setShift(SHIFT[to]);
    const skip = $('#hud-skip');
    if (to === 'work') skip.setAttribute('aria-current', 'page'); else skip.removeAttribute('aria-current');

    S.enter(r, Object.assign({ same: from === to }, ctx));
    document.title = (S.title ? S.title(r) + ' | ' : '') + 'Kally Yuan';

    if (from === to) { focusScreen(S); return; }

    S.el.hidden = false;
    S.el.scrollTop = 0;
    current = to;
    const kind = pick(from, to, opts);
    if (S.arrive) S.arrive(kind);

    try {
      await (kind === 'intro' ? T.intro(null, S.el) : T[kind](fromS.el, S.el, ctx));
    } catch (e) { /* a newer navigation cancelled this one */ }

    if (current !== to) return;
    if (fromS) {
      fromS.el.hidden = true;
      resetScreen(fromS.el);
      if (fromS.leave) fromS.leave();
    }
    resetScreen(S.el);
    focusScreen(S);
  }

  function focusScreen(S) {
    const target = S.el.querySelector('[data-focus]') || S.el;
    target.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    const label = (S.title && S.title(parse(location.hash))) || '';
    if (label) KY.announce(label);
  }

  /* ---------- boot ---------- */
  Object.keys(KY.screens).forEach((n) => { if (KY.screens[n].init) KY.screens[n].init(); });
  window.addEventListener('hashchange', route);
  route();
})();
