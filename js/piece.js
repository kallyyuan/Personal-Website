/* ==========================================================================
   Screen 4: one piece of work, full focus.
   The work itself is drawn according to work.type in the content file:
   text, slides, image, song, essay, puzzle, slot.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const el = document.getElementById('screen-piece');
  let puzzle = null, host = null;

  /* ---------- viewers ---------- */
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
    const root = h('div', { class: 'viewer', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': label, tabindex: '0' },
      stage, many ? prev : null, many ? next : null, expand, close,
      h('div', { class: 'viewer-foot' }, many ? count : null, many ? dots : null, caption));

    function go(k) {
      if (!many) return;
      i = (k + slides.length) % slides.length;
      slides.forEach((s, n) => { if (n === i || n === (i + 1) % slides.length) ensure(n); });
      made.forEach((m, n) => { if (m) { m.classList.toggle('is-active', n === i); m.setAttribute('aria-hidden', n === i ? 'false' : 'true'); } });
      dots.childNodes.forEach((d, n) => d.setAttribute('aria-current', n === i ? 'true' : 'false'));
      count.textContent = (i + 1) + ' / ' + slides.length;
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
        return h('div', { class: 'work work--text' },
          h('p', { class: 'snack-headline' }, w.headline),
          (w.body || []).length ? h('div', { class: 'snack-body' }, w.body.map((t) => h('p', null, t))) : null);
      case 'slides':
        return h('div', { class: 'work work--viewer' }, slideViewer(w, it.title));
      case 'image':
        return h('div', { class: 'work work--viewer' }, slideViewer({ ratio: w.ratio, slides: [w.image] }, it.title));
      case 'song': {
        const listen = w.link ? h('a', { class: 'btn btn--sm', href: w.link, target: '_blank', rel: 'noopener' }, 'Listen', KY.icon('arrow-long')) : null;
        return h('div', { class: 'work work--song' },
          h('div', { class: 'record' },
            h('div', { class: 'record-disc', 'aria-hidden': 'true' }),
            KY.media(w.cover, { ratio: '1 / 1', cls: 'record-cover', eager: true })),
          h('div', { class: 'song-info' },
            h('p', { class: 'song-artist' }, w.artist),
            h('p', { class: 'song-note' }, w.note),
            listen));
      }
      case 'essay':
        return h('div', { class: 'work work--essay' },
          h('div', { class: 'essay-text' }, (w.paragraphs || []).map((t, k) => h('p', { class: k === 0 ? 'dropcap' : null }, t))),
          w.pullQuote ? h('blockquote', { class: 'essay-quote' }, w.pullQuote) : null);
      case 'puzzle':
        host = h('div', { class: 'work work--puzzle' });
        return host;
      case 'slot':
        return h('div', { class: 'work work--slot' }, KY.icon('games'), h('p', null, w.note));
      default:
        return h('div', { class: 'work work--slot' }, h('p', null, '[PLACEHOLDER: this piece has no work yet]'));
    }
  }

  function killPuzzle() { if (puzzle) { puzzle.destroy(); puzzle = null; } host = null; }

  function render(r) {
    const it = D.itemById[r.itemId];
    const from = r.q.get('from');
    const fromQ = from ? '?from=' + from : '';
    const list = it.place.categories[it.cat.id];
    const prevIt = list[it.index - 1], nextIt = list[it.index + 1];
    const workHref = KY.lastWork || KY.href.work;
    const ui = D.site.ui;

    const trail = h('nav', { class: 'trail', 'aria-label': 'Where you are' },
      from === 'work' ? [h('a', { href: workHref }, ui.workTitle), KY.icon('arrow-right')] : [h('a', { href: KY.href.map }, ui.map), KY.icon('arrow-right')],
      h('a', { href: KY.href.place(it.place.id) }, it.place.name), KY.icon('arrow-right'),
      h('a', { href: KY.href.cat(it.place.id, it.cat.id) }, it.cat.label));

    const step = (target, dir) => {
      const label = dir < 0 ? ui.previous : ui.next;
      if (!target) return h('span', { class: 'step step--' + (dir < 0 ? 'prev' : 'next') + ' is-off', 'aria-hidden': 'true' });
      return h('a', { class: 'step step--' + (dir < 0 ? 'prev' : 'next'), href: KY.href.piece(target.id, from) },
        dir < 0 ? KY.icon('arrow-left') : null,
        h('span', { class: 'step-text' }, h('span', { class: 'step-label' }, label), h('span', { class: 'step-title' }, target.title)),
        dir > 0 ? KY.icon('arrow-right') : null);
    };

    killPuzzle();
    const work = renderWork(it);

    const exits = [
      from === 'work' ? h('a', { class: 'btn', href: workHref }, KY.icon('grid'), ui.backToWork) : null,
      h('a', { class: from === 'work' ? 'btn btn--ghost' : 'btn', href: KY.href.place(it.place.id) }, KY.icon('arrow-left'), ui.backToMenu),
      h('a', { class: 'btn btn--ghost', href: KY.href.map }, KY.icon('pin'), ui.backToMap),
    ];

    const article = h('article', { class: 'piece' },
      trail,
      h('header', { class: 'piece-head' },
        h('div', { class: 'piece-meta' }, KY.tag(it.track), h('span', { class: 'piece-pos' }, (it.index + 1) + ' of ' + it.count)),
        h('h1', { class: 'piece-title', id: 'piece-title', 'data-focus': '', tabindex: '-1' }, it.title),
        h('p', { class: 'piece-context' }, h('span', { class: 'label' }, ui.context), it.context)),
      work,
      h('aside', { class: 'piece-shows' }, h('span', { class: 'label' }, ui.shows), h('p', null, it.shows)),
      h('nav', { class: 'steps', 'aria-label': it.cat.label }, step(prevIt, -1), step(nextIt, 1)),
      h('div', { class: 'exits' }, exits));

    el.replaceChildren(article);
    el.scrollTop = 0;

    if (host) puzzle = KY.puzzle.mount(host, it.work);
    el._it = it; el._from = from;
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
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !el._it || e.defaultPrevented) return;
        const it = el._it;
        KY.go(el._from === 'work' ? (KY.lastWork || KY.href.work) : KY.href.cat(it.place.id, it.cat.id));
      });
    },
  };
})();
