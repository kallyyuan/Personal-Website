/* ==========================================================================
   Shared helpers and the content index. Nothing here needs editing for
   normal content changes.
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
        } else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
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
    const wrap = h('div', { class: 'media' + (opts.cls ? ' ' + opts.cls : ''), style: opts.ratio ? { aspectRatio: opts.ratio } : null });
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

  /* motion and input preferences */
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

  KY.href = {
    gate: '#/',
    menu: '#/menu',
    section: (id) => '#/' + id,
    place: (id) => '#/place/' + id,
    piece: (id, from) => '#/piece/' + id + (from ? '?from=' + from : ''),
    tour: '#/tour',
    passport: '#/passport',
  };
  KY.plural = (n, unit) => n + ' ' + (n === 1 ? unit[0] : unit[1]);
  KY.pad2 = (n) => String(n).padStart(2, '0');

  /* ---------- content index ---------- */
  const K = window.KALLY;
  const site = K.site;
  const places = (K.places || []).slice().sort((a, b) => (a.group === 'based' ? -1 : 0) - (b.group === 'based' ? -1 : 0));
  const placeById = {};
  const itemById = {};
  const items = [];

  function register(it, meta, siblings) {
    Object.assign(it, meta);
    it.siblings = siblings;
    it.index = siblings.indexOf(it);
    itemById[it.id] = it;
    items.push(it);
  }
  function byKind(list) {
    const m = {};
    list.forEach((it) => { (m[it.kind] = m[it.kind] || []).push(it); });
    return m;
  }

  const work = K.work || [], writing = K.writing || [], music = K.music || [], play = K.play || [];
  const workBy = byKind(work), writingBy = byKind(writing);
  work.forEach((it) => register(it, { section: 'work', group: it.kind }, workBy[it.kind]));
  writing.forEach((it) => register(it, { section: 'writing', group: it.kind }, writingBy[it.kind]));
  music.forEach((it) => register(it, { section: 'music', group: 'albums' }, music));
  play.forEach((it) => register(it, { section: 'play', group: 'games' }, play));
  places.forEach((p) => {
    placeById[p.id] = p;
    (p.photography || []).forEach((it) => register(it, { section: 'maps', group: 'photography', place: p }, p.photography));
    (p.writing || []).forEach((it) => register(it, { section: 'maps', group: 'writing', place: p }, p.writing));
  });

  const count = (arr, key, val) => arr.filter((x) => x[key] === val).length;
  KY.data = {
    site, places, placeById, items, itemById, work, writing, music, play,
    counts: {
      work: { total: work.length, copy: count(work, 'kind', 'copy'), strategy: count(work, 'kind', 'strategy'), research: count(work, 'kind', 'research') },
      writing: { total: writing.length, personal: count(writing, 'kind', 'personal'), academic: count(writing, 'kind', 'academic') },
      maps: { total: places.length, based: count(places, 'group', 'based'), been: count(places, 'group', 'been') },
      music: { total: music.length },
      play: { total: play.length },
    },
  };

  /* the first image an item can show as a thumbnail */
  KY.thumbOf = function (it) {
    const w = it.work || {};
    if (w.type === 'slides') return { m: w.slides[0], ratio: w.ratio || '16 / 9' };
    if (w.type === 'image') return { m: w.image, ratio: w.ratio || '4 / 3' };
    if (w.type === 'album') return { m: w.cover, ratio: '1 / 1' };
    if (w.type === 'puzzle') return { m: w.photos[0], ratio: '3 / 2' };
    return null;
  };
})();
