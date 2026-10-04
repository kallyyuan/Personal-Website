/* ==========================================================================
   The work index: every piece in one grid, for visitors short on time.
   Share it directly:  your-site-address/#/work
   Filters: #/work?track=Strategy   #/work?place=tokyo   #/work?track=Both&place=kenya
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const el = document.getElementById('screen-work');
  let filters, groups, countEl;

  const TRACKS = ['Copywriting', 'Strategy', 'Both'];

  function hashFor(track, place) {
    const q = [];
    if (track) q.push('track=' + encodeURIComponent(track));
    if (place) q.push('place=' + encodeURIComponent(place));
    return '#/work' + (q.length ? '?' + q.join('&') : '');
  }

  function chip(label, active, onclick, extra) {
    return h('button', { type: 'button', class: 'chip' + (extra ? ' ' + extra : ''), 'aria-pressed': active ? 'true' : 'false', onclick }, label);
  }

  function render(r) {
    const track = TRACKS.includes(r.q.get('track')) ? r.q.get('track') : '';
    const place = D.placeById[r.q.get('place')] ? r.q.get('place') : '';
    KY.lastWork = hashFor(track, place);

    filters.replaceChildren(
      h('div', { class: 'chips', role: 'group', 'aria-label': 'Track' },
        chip(D.site.ui.allTracks, !track, () => KY.go(hashFor('', place))),
        TRACKS.map((t) => chip(t, track === t, () => KY.go(hashFor(t, place)), 'chip--' + t.toLowerCase()))),
      h('div', { class: 'chips', role: 'group', 'aria-label': 'Place' },
        chip(D.site.ui.allPlaces, !place, () => KY.go(hashFor(track, ''))),
        D.places.map((p) => chip(p.name, place === p.id, () => KY.go(hashFor(track, p.id))))));

    let total = 0;
    const blocks = D.places.filter((p) => !place || p.id === place).map((p) => {
      const items = D.all.filter((it) => it.place === p && (!track || it.track === track));
      if (!items.length) return null;
      total += items.length;
      return h('section', { class: 'work-group' },
        h('h2', { class: 'work-group-title' }, p.name, h('span', null, p.sub)),
        h('div', { class: 'work-grid' }, items.map((it) => KY.card(it, { from: 'work', showPlace: true }))));
    });
    groups.replaceChildren(...(total ? blocks.filter(Boolean) : [h('p', { class: 'work-empty' }, 'Nothing under this combination yet.')]));
    countEl.textContent = KY.plural(total, ['piece', 'pieces']);
  }

  KY.screens.work = {
    el,
    title: () => D.site.ui.workTitle,
    init() {
      countEl = h('span', { class: 'work-count' });
      filters = h('div', { class: 'work-filters' });
      groups = h('div', { class: 'work-groups' });
      el.append(h('div', { class: 'work-page' },
        h('header', { class: 'work-head' },
          h('h1', { class: 'work-title', id: 'work-title', 'data-focus': '', tabindex: '-1' }, D.site.ui.workTitle),
          countEl),
        filters, groups));
    },
    enter(r, ctx) {
      render(r);
      if (ctx.same) KY.animate(groups, [{ opacity: 0.3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380 });
    },
  };
})();
