/* ==========================================================================
   Screen 1: the boarding gate and the tearing boarding pass.
   Drag down the dotted line with a mouse or finger. A tap, a press and hold,
   or the Enter key on the dotted line tears it too.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const el = document.getElementById('screen-gate');
  const gate = KY.data.site.gate;
  const pass = KY.data.site.pass;

  let passEl, mainEl, stubEl, scissors, fibre;
  let progress = 0, target = 0, busy = false, torn = false;
  let raf = 0;

  function barcode(seed, bars) {
    let s = seed, x = 0, out = '';
    for (let i = 0; i < bars; i++) {
      s = (s * 16807) % 2147483647;
      const w = 1 + (s % 4);
      if (i % 2 === 0) out += `<rect x="${x}" y="0" width="${w}" height="40"/>`;
      x += w + 1;
    }
    return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">${out}</svg>`;
  }

  function fieldList(rows, cls) {
    return h('dl', { class: 'pass-fields ' + (cls || '') }, rows.map(([k, v]) =>
      h('div', { class: 'pass-field' }, h('dt', null, k), h('dd', null, v))
    ));
  }

  function build() {
    const accent = gate.accentWord;
    const parts = gate.headline.split(accent);
    const title = h('h1', { id: 'gate-title', class: 'gate-title', 'data-focus': '', tabindex: '-1' },
      parts[0], h('em', null, accent), parts.slice(1).join(accent));

    const dest = pass.fields.find((f) => f[0] === 'Destination');
    const rest = pass.fields.filter((f) => f !== dest);

    mainEl = h('div', { class: 'pass-half pass-main' },
      h('div', { class: 'pass-head' },
        h('span', { class: 'pass-airline' }, KY.icon('plane'), pass.airline),
        h('span', { class: 'pass-flight' }, 'Boarding pass')),
      h('div', { class: 'pass-body' },
        dest ? h('div', { class: 'pass-dest' }, h('span', { class: 'pass-label' }, dest[0]), h('span', { class: 'pass-dest-name' }, dest[1])) : null,
        fieldList(rest),
        h('div', { class: 'pass-barcode', html: barcode(97, 46) })));

    stubEl = h('div', { class: 'pass-half pass-stub' },
      h('div', { class: 'pass-head' }, h('span', { class: 'pass-flight' }, 'Flight ' + pass.flight)),
      h('div', { class: 'pass-body' },
        fieldList(pass.stubFields, 'pass-fields--stub'),
        h('div', { class: 'pass-barcode', html: barcode(31, 22) })));

    scissors = h('span', { class: 'pass-scissors', 'aria-hidden': 'true' }, KY.icon('scissors'));
    fibre = h('div', { class: 'pass-fibre', 'aria-hidden': 'true' });
    const grip = h('button', { class: 'pass-grip', type: 'button', 'aria-label': 'Tear the boarding pass along the dotted line' }, scissors);

    passEl = h('div', { class: 'pass', role: 'group', 'aria-label': 'Boarding pass' }, h('div', { class: 'pass-shadow', 'aria-hidden': 'true' }), mainEl, stubEl, fibre, grip);

    el.append(
      h('div', { class: 'gate-plane', 'aria-hidden': 'true' }, KY.icon('plane')),
      h('div', { class: 'gate-wrap' },
        h('div', { class: 'gate-copy' },
          h('p', { class: 'eyebrow' }, gate.eyebrow),
          title),
        passEl)
    );

    /* jagged paper edge for the torn strip */
    const teeth = [];
    for (let i = 0; i <= 40; i++) teeth.push(`${i % 2 ? 100 : 35}% ${(i / 40) * 100}%`);
    fibre.style.clipPath = `polygon(0 0, ${teeth.join(', ')}, 0 100%)`;

    bind(grip);

    /* on phones the perforation sits at the bottom of the top half */
    const sync = () => passEl.style.setProperty('--perf', mainEl.offsetHeight + 'px');
    if (window.ResizeObserver) new ResizeObserver(sync).observe(mainEl); else sync();
  }

  /* ---------- tear mechanics ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const horizontal = () => window.matchMedia('(max-width: 640px)').matches;

  function geom() {
    const r = passEl.getBoundingClientRect();
    if (!horizontal()) return { hor: false, x: r.left + mainEl.offsetWidth, y: r.top, len: r.height };
    return { hor: true, x: r.left, y: r.top + mainEl.offsetHeight, len: r.width };
  }
  const proj = (g, e) => (g.hor ? (e.clientX - g.x) / g.len : (e.clientY - g.y) / g.len);

  function setTear(p) {
    progress = clamp(p, 0, 1);
    passEl.style.setProperty('--tear', progress.toFixed(4));
  }

  function loop() {
    progress += (target - progress) * 0.32;
    if (Math.abs(target - progress) < 0.002) progress = target;
    setTear(progress);
    if (progress !== target) raf = requestAnimationFrame(loop); else raf = 0;
  }
  function chase(t) { target = clamp(t, 0, 1); if (!raf) raf = requestAnimationFrame(loop); }

  function tween(to, ms, ease) {
    return new Promise((resolve) => {
      cancelAnimationFrame(raf); raf = 0;
      const from = progress, t0 = performance.now();
      (function step(now) {
        const k = clamp((now - t0) / ms, 0, 1);
        setTear(from + (to - from) * ease(k));
        if (k < 1) requestAnimationFrame(step); else { target = progress; resolve(); }
      })(t0);
    });
  }
  const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const easeBack = (k) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

  async function autoTear() {
    if (busy) return;
    busy = true;
    if (KY.reducedMotion()) setTear(1); else await tween(1, 950, easeInOut);
    finish();
  }
  async function springBack() {
    busy = true;
    await tween(0, 420, easeBack);
    busy = false;
  }

  function finish() {
    if (torn) return;
    torn = true; busy = true;
    setTear(1);
    el.classList.add('is-torn');
    if (KY.reducedMotion()) { KY.go(KY.href.map, { via: 'tear' }); return; }

    KY.animate(stubEl, [
      { offset: 0.25, transform: 'translate(60px,-70px) rotate(26deg)', opacity: 1 },
      { offset: 0.55, transform: 'translate(10px,-210px) rotate(-14deg)', opacity: 1 },
      { offset: 1, transform: 'translate(120px,-560px) rotate(38deg)', opacity: 0 },
    ], { duration: 2800, easing: 'cubic-bezier(.3,.1,.3,1)' });
    KY.animate(mainEl, [
      { offset: 0.2, transform: 'translate(-50px,-40px) rotate(-8deg)', opacity: 1 },
      { offset: 0.5, transform: 'translate(-20px,-190px) rotate(9deg)', opacity: 1 },
      { offset: 1, transform: 'translate(-140px,-600px) rotate(-30deg)', opacity: 0 },
    ], { duration: 3200, easing: 'cubic-bezier(.3,.1,.3,1)' });
    KY.animate(fibre, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 });
    KY.animate(scissors, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });

    setTimeout(() => KY.go(KY.href.map, { via: 'tear' }), 900);
  }

  function bind(grip) {
    let down = null, hold = 0, holdRaf = 0;

    const stopHold = () => { clearTimeout(hold); cancelAnimationFrame(holdRaf); holdRaf = 0; };
    function startHold() {
      if (!down || down.mode !== 'pending') return;
      down.mode = 'hold';
      let last = performance.now();
      (function step(now) {
        if (!down || down.mode !== 'hold') return;
        setTear(progress + (now - last) / 1100);
        last = now;
        if (progress >= 1) { down = null; autoTear(); return; }
        holdRaf = requestAnimationFrame(step);
      })(last);
    }

    passEl.addEventListener('pointerdown', (e) => {
      if (busy || torn || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const g = geom();
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, g, inGrip: !!e.target.closest('.pass-grip'), mode: 'pending', startP: proj(g, e) };
      try { passEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      hold = setTimeout(startHold, 380);
      passEl.classList.add('is-held');
    });

    passEl.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      if (down.mode === 'pending' && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) {
        clearTimeout(hold);
        down.mode = down.inGrip && down.startP < 0.45 ? 'drag' : 'ignore';
      }
      if (down.mode === 'drag') chase(proj(down.g, e));
    });

    const release = (e) => {
      if (!down || (e && e.pointerId !== down.id)) return;
      const mode = down.mode;
      down = null;
      stopHold();
      passEl.classList.remove('is-held');
      if (mode === 'pending') autoTear();                       // a plain tap
      else if (mode === 'drag') { if (target >= 0.82) { tween(1, 220, easeInOut).then(finish); busy = true; } else springBack(); }
      else if (mode === 'hold') springBack();
    };
    passEl.addEventListener('pointerup', release);
    passEl.addEventListener('pointercancel', (e) => {
      if (down && down.mode === 'drag') { down = null; stopHold(); springBack(); } else release(e);
    });

    /* keyboard: the dotted line is a real button */
    grip.addEventListener('click', (e) => { if (e.detail === 0) autoTear(); });
    passEl.addEventListener('dragstart', (e) => e.preventDefault());
  }

  KY.screens.gate = {
    el,
    init: build,
    title: () => 'Boarding gate',
    enter(r, ctx) {
      /* coming back to the gate: put the ticket back together */
      if (torn) {
        torn = false; busy = false; progress = 0; target = 0;
        passEl.style.setProperty('--tear', 0);
        el.classList.remove('is-torn');
        [stubEl, mainEl, fibre, scissors].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
      }
    },
  };
})();
