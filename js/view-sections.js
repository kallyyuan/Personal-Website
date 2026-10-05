/* ==========================================================================
   The four section pages on the seat screen: Work, Writing, Music, Play.
   Each one is a quiet list of what is in its content file (js/content/).
   Clicking an item opens it full size (js/piece.js).
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;

  KY.views = KY.views || {};
  KY.state = KY.state || {};

  const labelOf = (list, id) => (list.find((g) => g[0] === id) || [id, id])[1];

  /* the page title row, shared by all four */
  function head(title, note, extra) {
    return h('header', { class: 'vhead' },
      h('div', null,
        h('h1', { class: 'vtitle', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, title),
        h('p', { class: 'vnote' }, note)),
      extra || null);
  }

  /* ---------------------------------------------------------------- Work */
  function renderWork() {
    const kinds = [['all', 'All']].concat(site.groups.work);
    let cur = KY.state.workKind || 'all';
    const grid = h('div', { class: 'wgrid' });
    const tabs = h('div', { class: 'vtabs', role: 'group', 'aria-label': 'Show' });

    const thumb = (it) => {
      if (it.work.type === 'text') {
        return h('div', { class: 'wthumb wthumb--type' }, h('span', { class: 'wquote', 'aria-hidden': 'true' }, '“'), h('p', null, it.work.headline));
      }
      const t = KY.thumbOf(it);
      return h('div', { class: 'wthumb' }, KY.media(t && t.m, { ratio: '16 / 10', cls: 'wthumb-media' }));
    };
    const card = (it) => h('a', { class: 'wcard', href: KY.href.piece(it.id) },
      thumb(it),
      h('div', { class: 'wmeta' }, h('span', { class: 'wkind' }, labelOf(site.groups.work, it.kind)), KY.tag(it.track)),
      h('h3', { class: 'wtitle' }, it.title),
      h('p', { class: 'wctx' }, it.context),
      KY.icon('arrow-long', 'wgo'));

    function paint() {
      const list = cur === 'all' ? D.work : D.work.filter((x) => x.kind === cur);
      grid.replaceChildren(...list.map(card));
      tabs.querySelectorAll('.vtab').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
      KY.state.workKind = cur;
    }
    kinds.forEach(([id, label]) => {
      const n = id === 'all' ? D.work.length : D.work.filter((x) => x.kind === id).length;
      tabs.append(h('button', { type: 'button', class: 'vtab', 'data-k': id, onclick: () => { cur = id; paint(); } }, label, h('sup', null, n)));
    });
    paint();
    return h('div', { class: 'view view--list' }, head('Work', KY.plural(D.work.length, ['piece', 'pieces']), tabs), grid);
  }

  /* ------------------------------------------------------------- Writing */
  function renderWriting() {
    const col = ([id, label]) => {
      const list = D.writing.filter((x) => x.kind === id);
      return h('section', { class: 'wcol' },
        h('h2', null, label, h('span', null, KY.pad2(list.length))),
        h('div', { class: 'wrows' }, list.map((it, i) =>
          h('a', { class: 'wrow wrow--writing', href: KY.href.piece(it.id) },
            h('span', { class: 'wrow-n' }, KY.pad2(i + 1)),
            h('span', { class: 'wrow-body' }, h('span', { class: 'wrow-title' }, it.title), h('span', { class: 'wrow-ctx' }, it.context)),
            KY.tag(it.track), KY.icon('arrow-long')))));
    };
    return h('div', { class: 'view view--list' },
      head('Writing', KY.plural(D.writing.length, ['piece', 'pieces'])),
      h('div', { class: 'wcols' }, site.groups.writing.map(col)));
  }

  /* --------------------------------------------------------------- Music */
  /* the record: a colored vinyl with a label. Used here and on the album page. */
  KY.disc = (color) => h('span', { class: 'disc disc--' + (color || 'ink'), 'aria-hidden': 'true' }, h('i', null));

  function renderMusic() {
    const rec = (it) => h('a', { class: 'rec', href: KY.href.piece(it.id) },
      h('span', { class: 'rec-stage' },
        KY.disc(it.vinyl),
        KY.media(it.work.cover, { ratio: '1 / 1', cls: 'rec-sleeve' })),
      h('span', { class: 'rec-info' },
        h('span', { class: 'rec-title' }, it.title),
        h('span', { class: 'rec-artist' }, it.artist),
        h('span', { class: 'rec-year' }, it.year)));
    return h('div', { class: 'view view--list' },
      head('Music', KY.plural(D.music.length, ['album', 'albums'])),
      h('div', { class: 'crate' }, D.music.map(rec)));
  }

  /* ---------------------------------------------------------------- Play */
  function renderPlay() {
    const game = (it) => {
      const photos = it.work.photos || [];
      return h('a', { class: 'game', href: KY.href.piece(it.id) },
        h('span', { class: 'game-art', 'aria-hidden': 'true' },
          photos.slice(0, 3).map((p, i) => h('span', { class: 'game-card game-card--' + (i + 1) }, KY.media(p, { ratio: '3 / 2', eager: true })))),
        h('span', { class: 'game-body' },
          h('span', { class: 'game-meta' }, h('b', null, KY.pad2(1)), KY.tag(it.track), h('span', null, it.work.cols * it.work.rows + ' pieces')),
          h('span', { class: 'game-title' }, it.title),
          h('span', { class: 'game-ctx' }, it.context),
          h('span', { class: 'game-go' }, 'Play', KY.icon('arrow-long'))));
    };
    return h('div', { class: 'view view--list' },
      head('Play', KY.plural(D.play.length, ['game', 'games'])),
      h('div', { class: 'games' }, D.play.map(game)));
  }

  const mk = (title, render) => ({ title: () => title, render });
  KY.views.work = mk('Work', renderWork);
  KY.views.writing = mk('Writing', renderWriting);
  KY.views.music = mk('Music', renderMusic);
  KY.views.play = mk('Play', renderPlay);
})();
