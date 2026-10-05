/* ==========================================================================
   One piece of work, full focus.
   The work is drawn according to work.type in the content file:
   text, slides, image, essay, album, puzzle.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;
  const ui = site.ui;
  const el = document.getElementById('screen-piece');
  const seatEl = document.getElementById('screen-seat');
  let puzzle = null, host = null, backHref = KY.href.menu;

  /* ---------- the picture viewer (slides, photographs, one image) ---------- */
  function slideViewer(w, label) {
    const slides = w.slides || [];
    const many = slides.length > 1;
    let i = 0, lastFocus = null;
    const stage = h('div', { class: 'viewer-stage', style: { aspectRatio: w.ratio || '16 / 9' } });
    const made = [];
    function ensure(k) {
      if (made[k]) return made[k];
      const m = KY.media(slides[k], { ratio: null, eager: k === 0 });
      m.classList.add('viewer-slide');
      stage.append(m);
      made[k] = m;
      return m;
    }
    const caption = h('p', { class: 'viewer-caption' });
    const count = h('span', { class: 'viewer-count', 'aria-live': 'polite' });
    const dots = h('div', { class: 'viewer-dots' }, slides.map((s, k) =>
      h('button', { type: 'button', class: 'viewer-dot', 'aria-label': 'Go to ' + (k + 1) + ' of ' + slides.length, onclick: () => go(k) })));
    const prev = h('button', { type: 'button', class: 'viewer-arrow viewer-arrow--prev', 'aria-label': 'Previous image', onclick: () => go(i - 1) }, KY.icon('arrow-left'));
    const next = h('button', { type: 'button', class: 'viewer-arrow viewer-arrow--next', 'aria-label': 'Next image', onclick: () => go(i + 1) }, KY.icon('arrow-right'));
    const expand = h('button', { type: 'button', class: 'viewer-expand', 'aria-label': 'View larger', onclick: () => toggle(true) }, KY.icon('expand'));
    const close = h('button', { type: 'button', class: 'viewer-close', 'aria-label': 'Close larger view', onclick: () => toggle(false) }, KY.icon('close'));
    const [ra, rb] = String(w.ratio || '16 / 9').split('/').map(Number);
    const root = h('div', { class: 'viewer', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': label, tabindex: '0', style: { '--r': (ra / (rb || 1)).toFixed(4) } },
      stage, many ? prev : null, many ? next : null, expand, close,
      h('div', { class: 'viewer-foot' }, many ? count : null, many ? dots : null, caption));

    function go(k) {
      if (!many) return;
      i = (k + slides.length) % slides.length;
      slides.forEach((s, n) => { if (n === i || n === (i + 1) % slides.length) ensure(n); });
      made.forEach((m, n) => { if (m) { m.classList.toggle('is-active', n === i); m.setAttribute('aria-hidden', n === i ? 'false' : 'true'); } });
      dots.childNodes.forEach((d, n) => d.setAttribute('aria-current', n === i ? 'true' : 'false'));
      count.textContent = KY.pad2(i + 1) + ' / ' + KY.pad2(slides.length);
      caption.textContent = slides[i].caption || '';
      caption.hidden = !slides[i].caption;
    }
    function toggle(on) {
      root.classList.toggle('is-expanded', on);
      if (on) { lastFocus = document.activeElement; close.focus(); } else if (lastFocus) lastFocus.focus();
    }
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
      else if (e.key === 'Escape' && root.classList.contains('is-expanded')) { toggle(false); e.stopPropagation(); }
    });
    /* swipe */
    let sx = null;
    stage.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    stage.addEventListener('pointerup', (e) => { if (sx != null && many && Math.abs(e.clientX - sx) > 50) go(i + (e.clientX < sx ? 1 : -1)); sx = null; });
    stage.style.touchAction = 'pan-y';
    ensure(0);
    go(0);
    return root;
  }

  /* ---------- the work, by type ---------- */
  function renderWork(it) {
    const w = it.work || {};
    switch (w.type) {
      case 'text':
        return h('div', { class: 'pwork pwork--text' },
          h('p', { class: 'copy-headline' }, w.headline),
          (w.body || []).length ? h('div', { class: 'copy-body' }, w.body.map((t) => h('p', null, t))) : null);
      case 'slides':
        return h('div', { class: 'pwork pwork--viewer' }, slideViewer(w, it.title));
      case 'image':
        return h('div', { class: 'pwork pwork--viewer' }, slideViewer({ ratio: w.ratio, slides: [w.image] }, it.title));
      case 'essay':
        return h('div', { class: 'pwork pwork--essay' },
          h('div', { class: 'essay-text' }, (w.paragraphs || []).map((t, k) => h('p', { class: k === 0 && !KY.isPlaceholder(t) ? 'dropcap' : null }, t))),
          w.pullQuote ? h('blockquote', { class: 'essay-quote' }, w.pullQuote) : null);
      case 'album': {
        const listen = w.link ? h('a', { class: 'btn', href: w.link, target: '_blank', rel: 'noopener' }, 'Listen', KY.icon('arrow-long')) : null;
        return h('div', { class: 'pwork pwork--album' },
          h('div', { class: 'album-stage' }, KY.disc(it.vinyl), KY.media(w.cover, { ratio: '1 / 1', cls: 'album-cover', eager: true })),
          h('div', { class: 'album-info' },
            h('p', { class: 'album-artist' }, it.artist),
            h('p', { class: 'album-year' }, it.year),
            h('p', { class: 'album-note' }, w.note),
            listen));
      }
      case 'puzzle':
        host = h('div', { class: 'pwork pwork--puzzle' });
        return host;
      default:
        return h('div', { class: 'pwork pwork--text' }, h('p', { class: 'copy-body' }, '[PLACEHOLDER: this piece has no work yet]'));
    }
  }

  function killPuzzle() { if (puzzle) { puzzle.destroy(); puzzle = null; } host = null; }

  /* where this piece lives, for the breadcrumb and the way back */
  const nice = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function whereIs(it) {
    if (it.section === 'maps') {
      const p = it.place;
      return {
        crumbs: [['Maps', KY.href.section('maps')], [p.name, KY.href.place(p.id)]],
        group: it.group === 'photography' ? 'Photography' : 'Writing',
        back: { href: KY.href.place(p.id), label: p.name },
      };
    }
    const label = nice(it.section);
    const groups = site.groups[it.section];
    const g = groups ? (groups.find((x) => x[0] === it.group) || [0, nice(it.group)])[1] : nice(it.group);
    return { crumbs: [[label, KY.href.section(it.section)]], group: g, back: { href: KY.href.section(it.section), label } };
  }

  function render(r) {
    const it = D.itemById[r.itemId];
    const from = r.q.get('from');
    const list = it.siblings || [it];
    const prevIt = list[it.index - 1], nextIt = list[it.index + 1];
    const where = whereIs(it);
    backHref = where.back.href;

    const crumbs = h('nav', { class: 'pcrumbs', 'aria-label': 'Where you are' },
      h('a', { href: KY.href.menu }, ui.menu),
      where.crumbs.map(([label, href]) => [KY.icon('arrow-right'), h('a', { href }, label)]),
      KY.icon('arrow-right'), h('span', { 'aria-current': 'page' }, where.group),
      h('span', { class: 'pcrumbs-pos' }, KY.pad2(it.index + 1) + ' / ' + KY.pad2(list.length)));

    const step = (target, dir) => {
      const cls = 'pstep pstep--' + (dir < 0 ? 'prev' : 'next');
      if (!target) return h('span', { class: cls + ' is-off', 'aria-hidden': 'true' });
      return h('a', { class: cls, href: KY.href.piece(target.id, from) },
        dir < 0 ? KY.icon('arrow-left') : null,
        h('span', { class: 'pstep-text' }, h('span', { class: 'pstep-label' }, dir < 0 ? ui.previous : ui.next), h('span', { class: 'pstep-title' }, target.title)),
        dir > 0 ? KY.icon('arrow-right') : null);
    };

    killPuzzle();
    const work = renderWork(it);

    const article = h('article', { class: 'piece' },
      crumbs,
      h('header', { class: 'phead' },
        KY.tag(it.track),
        h('h1', { class: 'ptitle', id: 'piece-title', 'data-focus': '', tabindex: '-1' }, it.title),
        it.context ? h('p', { class: 'pcontext' }, h('span', { class: 'plabel' }, ui.context), it.context) : null),
      work,
      it.shows ? h('aside', { class: 'pshows' }, h('span', { class: 'plabel' }, ui.shows), h('p', null, it.shows)) : null,
      h('nav', { class: 'psteps', 'aria-label': where.group }, step(prevIt, -1), step(nextIt, 1)),
      h('div', { class: 'pexits' },
        h('a', { class: 'btn', href: where.back.href }, KY.icon('arrow-left'), where.back.label),
        h('a', { class: 'btn btn--quiet', href: KY.href.menu }, ui.backToMenu),
        it.section === 'maps' ? h('a', { class: 'btn btn--quiet', href: KY.href.section('maps') }, '📍', ui.backToMap) : null));

    el.replaceChildren(article);
    el.scrollTop = 0;
    if (host) puzzle = KY.puzzle.mount(host, it.work);
    return article;
  }

  KY.screens.piece = {
    el,
    title(r) { const it = r && r.itemId && D.itemById[r.itemId]; return it ? it.title : 'Piece'; },
    enter(r, ctx) {
      const article = render(r);
      if (ctx.same) KY.animate(article, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 520 });
    },
    leave() { killPuzzle(); },
    init() {
      /* follow the reading light that was set on the seat screen */
      const sync = () => { el.dataset.night = seatEl.dataset.night === 'true' ? 'true' : 'false'; };
      sync();
      new MutationObserver(sync).observe(seatEl, { attributes: true, attributeFilter: ['data-night'] });
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || e.defaultPrevented) return;
        KY.go(backHref);
      });
    },
  };
})();
