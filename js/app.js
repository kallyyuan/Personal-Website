/* ==========================================================================
   App: routing and the transitions between screens.
   Addresses (what you see after the # in the link):
     #/             the opening page
     #/menu         the seatback menu
     #/work         Work (copy, strategy, research). Share this one with recruiters.
     #/writing      Writing
     #/maps         Maps
     #/place/la     one city (place id from its content file)
     #/music        Music
     #/play         Play
     #/passport     Passport
     #/tour         the short haul
     #/piece/ID     one piece of work
   ========================================================================== */
(function () {
  const KY = window.KY;
  const D = KY.data;
  const $ = (s, r) => (r || document).querySelector(s);

  const NAMES = ['gate', 'seat', 'piece'];
  const SHIFT = { gate: 0, seat: -3, piece: -6 };
  const SEAT_VIEWS = ['work', 'writing', 'maps', 'music', 'play', 'passport', 'tour'];

  NAMES.forEach((n) => { KY.screens[n] = KY.screens[n] || {}; KY.screens[n].el = $('#screen-' + n); });

  let current = null;       // name of the screen on show
  let pendingOpts = null;   // extra information passed with the next navigation

  /* ---------- routing ---------- */
  function parse(hash) {
    const raw = (hash || '').replace(/^#/, '');
    const [path, query = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = new URLSearchParams(query);
    if (!parts.length) return { name: 'gate', q };
    const head = parts[0];
    if (head === 'menu') return { name: 'seat', view: 'menu', q };
    if (head === 'index') return { name: 'seat', view: 'work', q };
    if (SEAT_VIEWS.includes(head)) return { name: 'seat', view: head, q };
    if (head === 'place' && D.placeById[parts[1]]) return { name: 'seat', view: 'place', placeId: parts[1], q };
    if (head === 'piece' && D.itemById[parts[1]] && KY.screens.piece.enter) return { name: 'piece', itemId: parts[1], q };
    return { name: 'seat', view: 'menu', q };
  }

  KY.go = function (hash, opts) {
    pendingOpts = opts || null;
    if (location.hash === hash) { route(); return; }
    location.hash = hash;
  };

  /* ---------- transitions ---------- */
  const EASE_SOFT = 'cubic-bezier(.4, 0, .2, 1)';

  function pick(from, to, opts) {
    if (!from) return 'intro';
    if (from === 'gate' && to === 'seat' && opts.via === 'tear') return 'tear';
    if (to === 'piece') return 'rise';
    if (from === 'piece') return 'sink';
    return 'fade';
  }

  const T = {
    intro(f, t) {
      return KY.animate(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200 }).finished;
    },
    fade(f, t) {
      f.style.zIndex = 11; t.style.zIndex = 12;
      return Promise.all([
        KY.animate(t, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 800 }).finished,
        KY.animate(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }).finished,
      ]);
    },
    tear(f, t) {
      f.style.zIndex = 12; t.style.zIndex = 11;
      return Promise.all([
        KY.animate(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: 500, easing: EASE_SOFT }).finished,
        KY.animate(t, [{ opacity: 0, transform: 'scale(1.015)' }, { opacity: 1, transform: 'none' }], { duration: 1500, delay: 700 }).finished,
      ]);
    },
    rise(f, t) {
      f.style.zIndex = 11; t.style.zIndex = 12;
      return Promise.all([
        KY.animate(t, [{ opacity: 0, transform: 'translateY(34px)' }, { opacity: 1, transform: 'none' }], { duration: 800 }).finished,
        KY.animate(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 560 }).finished,
      ]);
    },
    sink(f, t) {
      f.style.zIndex = 12; t.style.zIndex = 11;
      return Promise.all([
        KY.animate(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 800 }).finished,
        KY.animate(f, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(24px)' }], { duration: 560 }).finished,
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
    const ctx = { from, to, opts };

    document.body.dataset.screen = to;
    KY.sky.setShift(SHIFT[to]);
    const skip = $('#hud-skip');
    if (to === 'seat' && r.view === 'work') skip.setAttribute('aria-current', 'page'); else skip.removeAttribute('aria-current');

    S.enter(r, Object.assign({ same: from === to }, ctx));
    document.title = (S.title ? S.title(r) + ' | ' : '') + 'Kally Yuan';

    if (from === to) { focusScreen(S, r); return; }

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
    focusScreen(S, r);
  }

  function focusScreen(S, r) {
    const target = S.el.querySelector('[data-focus]') || S.el;
    target.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    const label = (S.title && S.title(r)) || '';
    if (label) KY.announce(label);
  }

  /* ---------- boot ---------- */
  Object.keys(KY.screens).forEach((n) => { if (KY.screens[n].init) KY.screens[n].init(); });
  window.addEventListener('hashchange', route);
  route();

  /* While the opening page plays, quietly fetch what the next screens need. */
  const tall = window.matchMedia('(max-width: 760px), (max-aspect-ratio: 4/5)').matches;
  const later = [tall ? 'assets/seat/seat-tall.webp' : 'assets/seat/seat-wide.webp', 'assets/watercolor/map.webp'];
  const warm = () => later.forEach((src) => { const i = new Image(); i.decoding = 'async'; i.src = src; });
  if ('requestIdleCallback' in window) requestIdleCallback(() => setTimeout(warm, 600), { timeout: 3000 }); else setTimeout(warm, 1800);
})();
