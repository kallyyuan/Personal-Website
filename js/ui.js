/* ==========================================================================
   Shared helpers. Nothing here needs editing for normal content changes.
   ========================================================================== */
(function () {
  const KY = (window.KY = window.KY || { screens: {} });
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* tiny element builder: h('div', { class: 'x', onclick: fn }, 'text', child) */
  function append(el, kids) {
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false) continue;
      el.append(k.nodeType ? k : document.createTextNode(k));
    }
  }
  KY.h = function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') {
          for (const p in v) { if (p.startsWith('--')) el.style.setProperty(p, v[p]); else el.style[p] = v[p]; }
        }
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    append(el, kids);
    return el;
  };
  const h = KY.h;

  KY.icon = function (name, cls) {
    const s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('class', 'ico' + (cls ? ' ' + cls : ''));
    s.setAttribute('aria-hidden', 'true');
    const u = document.createElementNS(SVGNS, 'use');
    u.setAttribute('href', '#i-' + name);
    s.append(u);
    return s;
  };

  KY.tag = (track) => h('span', { class: 'tag tag--' + String(track).toLowerCase() }, track);

  KY.isPlaceholder = (s) => /^\s*\[PLACEHOLDER/i.test(s || '');

  /* Image slot. With a src it shows the photo; without one it shows a labeled placeholder. */
  KY.media = function (m, opts) {
    opts = opts || {};
    m = m || {};
    const wrap = h('div', {
      class: 'media' + (opts.cls ? ' ' + opts.cls : ''),
      style: opts.ratio ? { aspectRatio: opts.ratio } : null,
    });
    const placeholder = () => {
      wrap.classList.add('media--placeholder');
      wrap.setAttribute('role', 'img');
      wrap.setAttribute('aria-label', m.alt || 'Image placeholder');
      wrap.replaceChildren(h('span', { 'aria-hidden': 'true' }, m.alt || '[PLACEHOLDER: image]'));
    };
    if (m.src) {
      const img = h('img', { src: m.src, alt: m.alt || '', loading: opts.eager ? 'eager' : 'lazy', decoding: 'async' });
      img.addEventListener('error', placeholder, { once: true });
      wrap.append(img);
    } else placeholder();
    return wrap;
  };

  /* motion + input preferences */
  KY.reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  KY.coarse = () => window.matchMedia('(pointer: coarse)').matches;

  /* Animation wrapper: tracks running animations so a new navigation can finish them. */
  const running = new Set();
  KY.animate = function (el, frames, opts) {
    opts = Object.assign({ fill: 'both', easing: 'cubic-bezier(.22,.8,.24,1)' }, opts);
    if (KY.reducedMotion()) { opts.duration = 1; opts.delay = 0; }
    const a = el.animate(frames, opts);
    running.add(a);
    const done = () => running.delete(a);
    a.finished.then(done, done);
    return a;
  };
  KY.finishAnimations = function () {
    for (const a of Array.from(running)) { try { a.finish(); } catch (e) { /* already done */ } }
    running.clear();
  };
  KY.wait = (ms) => new Promise((r) => setTimeout(r, KY.reducedMotion() ? 0 : ms));

  KY.announce = function (text) {
    const a = document.getElementById('announcer');
    if (!a) return;
    a.textContent = '';
    setTimeout(() => { a.textContent = text; }, 60);
  };

  /* links */
  KY.href = {
    gate: '#/',
    map: '#/map',
    work: '#/work',
    place: (id) => '#/place/' + id,
    cat: (placeId, catId) => '#/place/' + placeId + '/' + catId,
    piece: (id, from) => '#/piece/' + id + (from ? '?from=' + from : ''),
  };

  KY.plural = (n, unit) => n + ' ' + (n === 1 ? unit[0] : unit[1]);

  /* ---------- content index ---------- */
  const site = window.KALLY.site;
  const places = window.KALLY.places;
  const placeById = {};
  const catById = {};
  const itemById = {};
  const all = [];
  site.categories.forEach((c) => { catById[c.id] = c; });
  places.forEach((pl, pi) => {
    placeById[pl.id] = pl;
    pl.index = pi;
    site.categories.forEach((cat) => {
      const list = pl.categories[cat.id] || [];
      list.forEach((it, i) => {
        it.place = pl; it.cat = cat; it.index = i; it.count = list.length;
        itemById[it.id] = it;
        all.push(it);
      });
    });
  });
  KY.data = { site, places, placeById, catById, itemById, all };

  /* ---------- work card, used by the seatback drawers and the work index ---------- */
  KY.subtypeOf = function (it) {
    const w = it.work || {};
    if (it.cat.id !== 'music') return '';
    if (w.type === 'song') return 'Song';
    if (w.type === 'essay') return 'Essay';
    return 'Photo series';
  };

  KY.card = function (it, opts) {
    opts = opts || {};
    const w = it.work || {};
    let art;
    if (w.type === 'text') {
      art = h('div', { class: 'card-art card-art--text' }, h('p', null, w.headline));
    } else if (w.type === 'essay') {
      art = h('div', { class: 'card-art card-art--essay' }, h('p', null, (w.paragraphs && w.paragraphs[0]) || ''));
    } else if (w.type === 'slot') {
      art = h('div', { class: 'card-art card-art--slot' }, KY.icon('games'));
    } else {
      const t = KY.thumbOf(it);
      art = h('div', { class: 'card-art card-art--media' + (w.type === 'song' ? ' card-art--song' : '') },
        KY.media(t.m, { ratio: w.type === 'song' ? '1 / 1' : '16 / 10', cls: 'card-media' }));
      if (w.type === 'slides' && w.slides.length > 1) art.append(h('span', { class: 'card-count' }, w.slides.length));
    }
    const sub = KY.subtypeOf(it);
    const where = opts.showPlace ? it.place.name + ' / ' + it.cat.label : sub;
    return h('a', { class: 'card', href: KY.href.piece(it.id, opts.from), 'data-track': it.track },
      art,
      h('div', { class: 'card-body' },
        h('h3', { class: 'card-title' }, it.title),
        h('div', { class: 'card-meta' }, KY.tag(it.track), where ? h('span', { class: 'card-where' }, where) : null)));
  };

  /* first thing an item can show as a thumbnail */
  KY.thumbOf = function (it) {
    const w = it.work || {};
    if (w.type === 'slides') return { m: w.slides[0], ratio: w.ratio || '16 / 9' };
    if (w.type === 'image') return { m: w.image, ratio: w.ratio || '4 / 3' };
    if (w.type === 'song') return { m: w.cover, ratio: '1 / 1' };
    if (w.type === 'puzzle') return { m: w.photos[0], ratio: '3 / 2' };
    return null;
  };
})();
