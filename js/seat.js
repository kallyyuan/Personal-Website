/* ==========================================================================
   Screen 3: the seatback entertainment screen.
   One screen for every stop. It shows the menu (Snacks, Movies, Music, Games)
   or one category's drawer. The skyline and colors come from the stop's theme.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const el = document.getElementById('screen-seat');

  let place = null, bar, view, timeEl, placeEl, backBtn, clock = 0;

  function timeIn(tz) {
    try { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date()); } catch (e) { return ''; }
  }
  function tick() { if (place && timeEl) timeEl.textContent = timeIn(place.tz); }

  function build() {
    backBtn = h('a', { class: 'ife-back', href: KY.href.map }, KY.icon('arrow-left'), h('span', null, D.site.ui.map));
    placeEl = h('span', { class: 'ife-place' });
    timeEl = h('span', { class: 'ife-time' });
    bar = h('header', { class: 'ife-bar' }, backBtn,
      h('div', { class: 'ife-meta' }, placeEl, timeEl, h('span', { class: 'ife-seat' }, D.site.ui.seat)));
    view = h('div', { class: 'ife-view' });
    const ife = h('div', { class: 'ife', id: 'ife' }, bar, view);
    el.append(
      h('div', { class: 'seat-back' },
        h('div', { class: 'seat-rest', 'aria-hidden': 'true' }),
        h('div', { class: 'bezel' }, h('span', { class: 'bezel-cam', 'aria-hidden': 'true' }), ife),
        h('div', { class: 'seat-jack', 'aria-hidden': 'true' })));

    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !place) return;
      const cat = el._cat;
      KY.go(cat ? KY.href.place(place.id) : KY.href.map);
    });
  }

  /* ---------- menu ---------- */
  function renderMenu(p) {
    const tiles = D.site.categories.map((c) => {
      const n = (p.categories[c.id] || []).length;
      return h('a', { class: 'tile', href: KY.href.cat(p.id, c.id), 'data-cat': c.id },
        h('span', { class: 'tile-icon' }, KY.icon(c.icon)),
        h('span', { class: 'tile-label' }, c.label),
        h('span', { class: 'tile-count' }, KY.plural(n, c.unit)));
    });
    const grid = h('div', { class: 'tiles', role: 'group', 'aria-label': 'In flight menu' }, tiles);
    grid.addEventListener('keydown', (e) => navTiles(e, grid));

    return h('div', { class: 'ife-menu' },
      h('div', { class: 'ife-banner' },
        h('div', { class: 'ife-banner-text' },
          h('h1', { class: 'ife-title', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, p.name),
          h('p', { class: 'ife-sub' }, p.sub)),
        h('div', { class: 'ife-art', html: KY.motif(p.theme), 'aria-hidden': 'true' })),
      h('div', { class: 'ife-menu-body' },
        h('p', { class: 'eyebrow' }, 'In flight menu'),
        grid));
  }

  function navTiles(e, grid) {
    const keys = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 'down', ArrowUp: 'up', Home: 'home', End: 'end' };
    if (!(e.key in keys)) return;
    const items = Array.from(grid.querySelectorAll('.tile'));
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
    let n = i;
    const k = keys[e.key];
    if (k === 1 || k === -1) n = i + k;
    else if (k === 'down') n = i + cols;
    else if (k === 'up') n = i - cols;
    else if (k === 'home') n = 0;
    else if (k === 'end') n = items.length - 1;
    if (n >= 0 && n < items.length) { e.preventDefault(); items[n].focus(); }
  }

  /* ---------- category drawer ---------- */
  function renderCategory(p, catId) {
    const cat = D.catById[catId];
    const list = p.categories[catId] || [];
    const from = '';
    let body;
    if (catId === 'music') {
      const groups = [['song', D.site.musicGroups.song], ['photos', D.site.musicGroups.photos], ['essay', D.site.musicGroups.essay]];
      const kindOf = (it) => (it.work.type === 'song' ? 'song' : it.work.type === 'essay' ? 'essay' : 'photos');
      body = groups.map(([k, label]) => {
        const items = list.filter((it) => kindOf(it) === k);
        if (!items.length) return null;
        return h('section', { class: 'cat-group' }, h('h2', { class: 'cat-group-title' }, label),
          h('div', { class: 'cat-grid' }, items.map((it) => KY.card(it, { from }))));
      });
    } else {
      body = h('div', { class: 'cat-grid' }, list.map((it) => KY.card(it, { from })));
    }
    return h('div', { class: 'ife-cat' },
      h('div', { class: 'cat-head' },
        h('span', { class: 'cat-icon' }, KY.icon(cat.icon)),
        h('h1', { class: 'cat-title', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, cat.label),
        h('span', { class: 'cat-count' }, KY.plural(list.length, cat.unit))),
      body);
  }

  function setPlace(p) {
    place = p;
    el.dataset.theme = p.theme;
    placeEl.textContent = p.name;
    tick();
    clearInterval(clock);
    clock = setInterval(tick, 20000);
  }

  KY.screens.seat = {
    el,
    placeId: null,
    init: build,
    title(r) {
      if (!r || !r.placeId) return 'Seatback menu';
      const p = D.placeById[r.placeId];
      return r.cat ? p.name + ', ' + D.catById[r.cat].label : p.name;
    },
    enter(r, ctx) {
      const p = D.placeById[r.placeId];
      this.placeId = p.id;
      setPlace(p);
      el._cat = r.cat;
      backBtn.setAttribute('href', r.cat ? KY.href.place(p.id) : KY.href.map);
      backBtn.lastChild.textContent = r.cat ? D.site.ui.menu : D.site.ui.map;
      const next = r.cat ? renderCategory(p, r.cat) : renderMenu(p);
      view.replaceChildren(next);
      view.scrollTop = 0;
      if (ctx.same) {
        KY.animate(next, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 520 });
      }
    },
    arrive(kind) {
      if (kind !== 'irisIn') return;
      const tiles = el.querySelectorAll('.tile, .ife-banner-text');
      tiles.forEach((t, i) => KY.animate(t, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 800 + i * 90 }));
    },
    leave() { clearInterval(clock); },
  };
})();
