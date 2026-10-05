/* ==========================================================================
   The short haul: a guided two minute tour through a handful of pieces.
   Boarding page here, the stops are the piece pages (js/piece.js), and
   the landing screen is here too (#/tour?landed=1).
   Which pieces, and in what order, is set in js/content/site.js under tour.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;
  const T = site.tour;

  KY.views = KY.views || {};
  KY.state = KY.state || {};

  KY.tourStops = () => (T.ids || []).map((id) => D.itemById[id]).filter(Boolean);

  const labelOf = (list, id) => (list.find((g) => g[0] === id) || [id, id])[1];
  KY.stopLabel = function (it) {
    if (it.section === 'work') return labelOf(site.groups.work, it.kind);
    if (it.section === 'maps') return it.group === 'photography' ? 'Photography' : 'Writing';
    return it.section.charAt(0).toUpperCase() + it.section.slice(1);
  };

  function boarding() {
    const stops = KY.tourStops();
    const go = h('a', { class: 'tour-go', href: stops.length ? KY.href.piece(stops[0].id, 'tour') : KY.href.menu },
      T.takeOff || 'Take off', h('span', { class: 'emoji', 'aria-hidden': 'true' }, T.emoji || ''), KY.icon('arrow-long'));
    go.addEventListener('click', () => { KY.state.tourStart = Date.now(); });
    return h('div', { class: 'view view--list' },
      h('header', { class: 'vhead' },
        h('div', null,
          h('h1', { class: 'vtitle', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, T.label),
          h('p', { class: 'vnote' }, KY.plural(stops.length, ['stop', 'stops']) + ', about ' + T.minutes + ' minutes')),
        go),
      h('ol', { class: 'tour-list' }, stops.map((it, i) =>
        h('li', { class: 'tour-row' },
          h('span', { class: 'tour-n' }, KY.pad2(i + 1)),
          h('span', { class: 'tour-kind' }, KY.stopLabel(it)),
          h('span', { class: 'tour-title' }, it.title),
          KY.tag(it.track)))));
  }

  function landing() {
    const destination = ((site.pass.fields.find((f) => f[0] === 'Destination')) || [0, 'my world'])[1];
    const isNew = KY.passport.stamp('tour');
    let flown = '';
    if (KY.state.tourStart) {
      const sec = Math.max(1, Math.round((Date.now() - KY.state.tourStart) / 1000));
      flown = sec >= 60 ? Math.floor(sec / 60) + ' min ' + (sec % 60) + ' s' : sec + ' s';
    }
    const stamp = KY.stamp({ shape: 'ticket', top: 'LANDED', code: 'KY 2027', name: T.label.toUpperCase(), date: KY.passport.date('tour'), ink: '#E07B39', rot: -4, label: T.label + ' stamp' });
    if (isNew) stamp.classList.add('is-fresh');
    const captain = h('button', { class: 'btn btn--quiet', type: 'button', onclick: () => { const b = document.getElementById('hud-captain'); if (b) b.click(); } }, 'Say hello');
    return h('div', { class: 'view view--landing' },
      h('span', { class: 'landing-emoji', 'aria-hidden': 'true' }, (T.landing && T.landing.emoji) || ''),
      h('h1', { class: 'landing-title', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, (T.landing && T.landing.title) || 'Welcome to ' + destination),
      flown ? h('p', { class: 'landing-time' }, 'Flight time ' + flown) : null,
      h('p', { class: 'landing-line' }, (T.landing && T.landing.line) || ''),
      h('div', { class: 'landing-stamp' }, stamp),
      h('div', { class: 'landing-actions' },
        h('a', { class: 'btn', href: KY.href.menu }, 'Explore the rest'),
        h('a', { class: 'btn btn--quiet', href: KY.href.section('work') }, 'All the work'),
        captain,
        h('a', { class: 'btn btn--quiet', href: KY.href.passport }, site.ui.passport, h('span', { class: 'emoji', 'aria-hidden': 'true' }, site.ui.passportEmoji))));
  }

  KY.views.tour = {
    title: (r) => (r && r.q && r.q.get('landed') ? ((T.landing && T.landing.title) || 'Landed') : T.label),
    render: (r) => (r.q.get('landed') ? landing() : boarding()),
  };
})();
