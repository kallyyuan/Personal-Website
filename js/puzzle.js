/* ==========================================================================
   The jigsaw. Pieces have real jigsaw edges.
   Drag a piece onto the board, or tap a piece and then tap a spot on the board.
   Settings (photos, columns, rows, message) live in the Shanghai content file.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const SVGNS = 'http://www.w3.org/2000/svg';
  let uid = 0;

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  function loadSize(src) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve({ w: im.naturalWidth || 1200, h: im.naturalHeight || 800 });
      im.onerror = () => resolve({ w: 1200, h: 800 });
      im.src = src;
    });
  }

  function mount(container, cfg) {
    const cols = cfg.cols || 4, rows = cfg.rows || 3, N = cols * rows;
    const photos = cfg.photos || [];
    let photoIdx = 0;
    let cw, ch, pad, BW, BH, hEdges, vEdges, pieces, selected = null, placed = 0, peek = false, drag = null, suppress = false;
    let destroyed = false;

    /* ----- layout pieces ----- */
    const root = h('div', { class: 'pz' });
    const boardWrap = h('div', { class: 'pz-boardwrap' });
    const side = h('div', { class: 'pz-side' });
    root.append(boardWrap, side);
    container.append(root);

    const counter = h('p', { class: 'pz-counter', 'aria-live': 'polite' });
    const bar = h('span', { class: 'pz-bar-fill' });
    const tray = h('div', { class: 'pz-tray', role: 'group', 'aria-label': 'Loose pieces' });
    const peekBtn = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-pressed': 'false', onclick: () => { peek = !peek; peekBtn.setAttribute('aria-pressed', peek); board && board.classList.toggle('is-peek', peek); } }, KY.icon('eye'), 'Peek');
    const shuffleBtn = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => start(photoIdx) }, KY.icon('shuffle'), 'Shuffle');
    const picker = h('div', { class: 'pz-picker', role: 'group', 'aria-label': 'Choose a photo' },
      photos.map((p, i) => h('button', { class: 'pz-thumb', type: 'button', 'aria-label': p.label || 'Photo ' + (i + 1), 'aria-pressed': i === 0 ? 'true' : 'false', onclick: () => start(i) },
        KY.media(p, { ratio: '3 / 2', eager: true }))));
    side.append(
      h('div', { class: 'pz-status' }, counter, h('span', { class: 'pz-bar' }, bar)),
      tray,
      h('div', { class: 'pz-tools' }, peekBtn, shuffleBtn),
      photos.length > 1 ? picker : null);

    let board, cellsEl, placedG, win, ghostImg;

    /* ----- jigsaw geometry ----- */
    function makeEdge(a, b, vertical, s, rnd) {
      const j = () => (rnd() - 0.5) * 0.07, t = 0.1;
      const A = j(), B = j(), C = j(), Dd = j(), E = j();
      const uv = [[0, 0], [0.2, A], [0.5 + B + Dd, -t + C], [0.5 - t + B, t + C], [0.5 - 2 * t + B - Dd, 3 * t + C],
        [0.5 + 2 * t + B - Dd, 3 * t + C], [0.5 + t + B, t + C], [0.5 + B + Dd, -t + C], [0.8, E], [1, 0]];
      const L = vertical ? b[1] - a[1] : b[0] - a[0];
      return uv.map(([u, v]) => (vertical ? [a[0] - s * v * L, a[1] + u * L] : [a[0] + u * L, a[1] - s * v * L]));
    }
    function seg(edge, reversed, end) {
      if (!edge) return `L${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
      const q = reversed ? edge.slice().reverse() : edge;
      const f = (p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2);
      return `C${f(q[1])} ${f(q[2])} ${f(q[3])}C${f(q[4])} ${f(q[5])} ${f(q[6])}C${f(q[7])} ${f(q[8])} ${f(q[9])}`;
    }
    function pathOf(r, c) {
      const x0 = c * cw, y0 = r * ch, x1 = x0 + cw, y1 = y0 + ch;
      return `M${x0} ${y0}` + seg(hEdges[r][c], false, [x1, y0]) + seg(vEdges[r][c + 1], false, [x1, y1]) +
        seg(hEdges[r + 1][c], true, [x0, y1]) + seg(vEdges[r][c], true, [x0, y0]) + 'Z';
    }
    function pieceSvg(p, src, nested) {
      const id = 'pz' + uid++;
      const vb = [p.c * cw - pad, p.r * ch - pad, cw + 2 * pad, ch + 2 * pad];
      const s = svgEl('svg', nested
        ? { x: vb[0], y: vb[1], width: vb[2], height: vb[3], viewBox: vb.join(' '), class: 'pz-svg pz-svg--placed' }
        : { viewBox: vb.join(' '), class: 'pz-svg' });
      s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      s.style.overflow = 'visible';
      const d = p.d;
      const defs = svgEl('defs', {}), cp = svgEl('clipPath', { id }); cp.append(svgEl('path', { d })); defs.append(cp);
      const im = svgEl('image', { href: src, x: 0, y: 0, width: BW, height: BH, preserveAspectRatio: 'none', 'clip-path': `url(#${id})` });
      s.append(defs, im,
        svgEl('path', { d, fill: 'none', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }),
        svgEl('path', { d, fill: 'none', stroke: 'rgba(23,80,127,.35)', 'stroke-width': .7, 'stroke-linejoin': 'round' }));
      return s;
    }

    /* ----- start / restart ----- */
    async function start(i) {
      photoIdx = i;
      const photo = photos[i];
      if (!photo) return;
      selected = null; placed = 0; peek = false; peekBtn.setAttribute('aria-pressed', 'false');
      picker.querySelectorAll('.pz-thumb').forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      const src = photo.src || KY.puzzleFallback(i);
      const size = await loadSize(src);
      if (destroyed) return;

      /* cell and board sizes in puzzle units */
      cw = 100;
      ch = 100 * (size.h / size.w) * (cols / rows);
      BW = cw * cols; BH = ch * rows;
      pad = 0.3 * Math.max(cw, ch);

      const rnd = rng(1000 + i * 77);
      hEdges = []; vEdges = [];
      for (let r = 0; r <= rows; r++) {
        hEdges[r] = [];
        for (let c = 0; c < cols; c++) hEdges[r][c] = r === 0 || r === rows ? null : makeEdge([c * cw, r * ch], [(c + 1) * cw, r * ch], false, rnd() < 0.5 ? 1 : -1, rnd);
      }
      for (let r = 0; r < rows; r++) {
        vEdges[r] = [];
        for (let c = 0; c <= cols; c++) vEdges[r][c] = c === 0 || c === cols ? null : makeEdge([c * cw, r * ch], [c * cw, (r + 1) * ch], true, rnd() < 0.5 ? 1 : -1, rnd);
      }
      pieces = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const p = { id: r * cols + c, r, c }; p.d = pathOf(r, c); pieces.push(p); }

      /* board */
      boardWrap.replaceChildren();
      board = h('div', { class: 'pz-board', style: { aspectRatio: `${BW} / ${BH}` } });
      const svg = svgEl('svg', { viewBox: `0 0 ${BW} ${BH}`, class: 'pz-board-svg' });
      svg.setAttribute('aria-hidden', 'true');
      ghostImg = svgEl('image', { href: src, x: 0, y: 0, width: BW, height: BH, preserveAspectRatio: 'none', class: 'pz-ghostimg' });
      const outlines = svgEl('g', { class: 'pz-outlines' });
      pieces.forEach((p) => outlines.append(svgEl('path', { d: p.d, fill: 'none' })));
      placedG = svgEl('g', { class: 'pz-placed' });
      svg.append(ghostImg, outlines, placedG);
      cellsEl = h('div', { class: 'pz-cells', style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` } },
        pieces.map((p) => h('button', { class: 'pz-cell', type: 'button', 'data-id': p.id, 'aria-label': `Row ${p.r + 1}, column ${p.c + 1}`, onclick: () => cellClick(p) })));
      win = h('div', { class: 'pz-win', hidden: true, role: 'status' });
      board.append(svg, cellsEl, win);
      boardWrap.append(board);

      /* tray */
      tray.replaceChildren();
      const order = pieces.slice();
      for (let k = order.length - 1; k > 0; k--) { const m = Math.floor(Math.random() * (k + 1)); [order[k], order[m]] = [order[m], order[k]]; }
      tray.style.setProperty('--ratio', ((cw + 2 * pad) / (ch + 2 * pad)).toFixed(4));
      order.forEach((p) => {
        const b = h('button', { class: 'pz-piece', type: 'button', 'data-id': p.id, 'aria-pressed': 'false', 'aria-label': `Piece ${p.id + 1} of ${N}` });
        b.append(pieceSvg(p, src, false));
        wirePiece(b, p);
        p.btn = b; p.src = src;
        tray.append(b);
      });
      updateCounter();
    }

    function updateCounter() {
      counter.textContent = `Pieces placed: ${placed} of ${N}`;
      bar.style.width = (placed / N) * 100 + '%';
    }

    /* ----- selecting (tap) ----- */
    function select(p) {
      selected = selected === p ? null : p;
      pieces.forEach((q) => q.btn && q.btn.setAttribute('aria-pressed', q === selected ? 'true' : 'false'));
      board.classList.toggle('has-selection', !!selected);
    }
    function cellClick(cell) {
      if (!selected || cell.done) return;
      attempt(selected, cell, null);
    }

    /* ----- placing ----- */
    function attempt(p, cell, ghost) {
      if (p.id === cell.id) { place(p); return true; }
      const btn = cellsEl.children[cell.id];
      btn.classList.remove('is-nope'); void btn.offsetWidth; btn.classList.add('is-nope');
      return false;
    }
    function place(p) {
      p.done = true;
      const nested = pieceSvg(p, p.src, true);
      nested.classList.add('pz-pop');
      placedG.append(nested);
      p.btn.remove();
      cellsEl.children[p.id].disabled = true;
      cellsEl.children[p.id].setAttribute('aria-label', `Row ${p.r + 1}, column ${p.c + 1}, placed`);
      if (selected === p) selected = null;
      board.classList.toggle('has-selection', !!selected);
      placed++;
      updateCounter();
      if (placed === N) finish();
    }
    function finish() {
      const next = (photoIdx + 1) % photos.length;
      win.replaceChildren(
        h('span', { class: 'pz-stamp' }, KY.icon('check'), 'Arrived'),
        h('p', { class: 'pz-win-text' }, cfg.congrats || 'Every piece in its place.'),
        h('div', { class: 'pz-win-actions' },
          photos.length > 1 ? h('button', { class: 'btn btn--sm', type: 'button', onclick: () => start(next) }, 'Next photo') : null,
          h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => start(photoIdx) }, 'Play again')));
      win.hidden = false;
      board.classList.add('is-done');
      KY.announce(cfg.congrats || 'Puzzle complete');
    }

    /* ----- dragging ----- */
    function cellAtPoint(x, y) {
      const r = board.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
      const c = Math.min(cols - 1, Math.floor(((x - r.left) / r.width) * cols));
      const rw = Math.min(rows - 1, Math.floor(((y - r.top) / r.height) * rows));
      return pieces[rw * cols + c];
    }
    function wirePiece(btn, p) {
      btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        drag = { p, btn, x0: e.clientX, y0: e.clientY, on: false, id: e.pointerId };
        try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      btn.addEventListener('pointermove', (e) => {
        if (!drag || drag.id !== e.pointerId) return;
        if (!drag.on && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 7) beginDrag(e);
        if (drag.on) moveGhost(e);
      });
      const up = (e) => {
        if (!drag || drag.id !== e.pointerId) return;
        const d = drag; drag = null;
        if (!d.on) return;
        suppress = true; setTimeout(() => { suppress = false; }, 0);
        const cell = e.type === 'pointerup' ? cellAtPoint(e.clientX, e.clientY) : null;
        if (cell && attempt(d.p, cell, d.ghost)) { d.ghost.remove(); d.btn.classList.remove('is-lifted'); return; }
        returnGhost(d);
      };
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('click', () => { if (!suppress) select(p); });
    }
    function beginDrag(e) {
      drag.on = true;
      const r = board.getBoundingClientRect();
      const scale = r.width / BW;
      const w = (cw + 2 * pad) * scale, hh = (ch + 2 * pad) * scale;
      const g = h('div', { class: 'pz-ghost', style: { width: w + 'px', height: hh + 'px' } });
      g.append(pieceSvg(drag.p, drag.p.src, false));
      document.body.append(g);
      drag.ghost = g; drag.w = w; drag.h = hh;
      drag.btn.classList.add('is-lifted');
      if (selected) select(selected);
    }
    function moveGhost(e) {
      drag.ghost.style.transform = `translate(${e.clientX - drag.w / 2}px, ${e.clientY - drag.h / 2}px)`;
    }
    function returnGhost(d) {
      const r = d.btn.getBoundingClientRect();
      const g = d.ghost;
      const cur = g.style.transform;
      const a = g.animate([{ transform: cur }, { transform: `translate(${r.left + r.width / 2 - d.w / 2}px, ${r.top + r.height / 2 - d.h / 2}px)` }], { duration: KY.reducedMotion() ? 1 : 320, easing: 'cubic-bezier(.3,.9,.3,1)' });
      a.finished.then(() => { g.remove(); d.btn.classList.remove('is-lifted'); }, () => { g.remove(); d.btn.classList.remove('is-lifted'); });
    }

    start(0);
    return { destroy() { destroyed = true; root.remove(); document.querySelectorAll('.pz-ghost').forEach((g) => g.remove()); } };
  }

  /* a plain pastel picture used only when a puzzle photo slot has no src */
  KY.puzzleFallback = function (i) {
    const hues = [200, 160, 20];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hues[i % 3]},70%,86%)"/><stop offset="1" stop-color="hsl(${hues[i % 3] + 40},70%,76%)"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="300" cy="260" r="120" fill="#fff" opacity=".8"/><rect x="620" y="420" width="420" height="260" rx="30" fill="#fff" opacity=".7"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  KY.puzzle = { mount };
})();
