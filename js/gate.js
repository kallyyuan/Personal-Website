/* ==========================================================================
   Screen 1: the opening page and the tearing boarding pass.
   The headline fades in at the top, then the pass arrives. Drag down the
   perforation with a mouse or finger. A tap, a press and hold, or Enter on
   the perforation tears it too.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const el = document.getElementById('screen-gate');
  const gate = KY.data.site.gate;
  const pass = KY.data.site.pass;

  let passEl, mainEl, stubEl, scissors, fibre;
  let progress = 0, target = 0, busy = false, torn = false, raf = 0, readyTimer = 0;

  /* a believable barcode: bars of varied width, same every visit */
  function barcode(seed, bars) {
    let s = seed, x = 0, out = '';
    for (let i = 0; i < bars; i++) {
      s = (s * 16807) % 2147483647;
      const w = 1 + (s % 3);
      if (i % 2 === 0) out += `<rect x="${x}" y="0" width="${w}" height="40"/>`;
      x += w + (s % 5 === 0 ? 2 : 1);
    }
    return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">${out}</svg>`;
  }

  function fieldList(rows, cls) {
    return h('dl', { class: 'pass-fields ' + (cls || '') }, rows.map(([k, v]) =>
      h('div', { class: 'pass-field' }, h('dt', null, k), h('dd', null, v))));
  }

  const seal = (cls) => h('span', { class: 'seal ' + cls, 'aria-hidden': 'true' }, gate.seal);

  function buildTitle() {
    const words = gate.headline.split(' ');
    const kids = [];
    words.forEach((word, i) => {
      const idx = word.indexOf(gate.accentWord);
      const inner = idx === 0 ? [h('em', null, gate.accentWord), word.slice(gate.accentWord.length)] : word;
      kids.push(h('span', { class: 'w', style: { '--i': i } }, inner));
      if (i < words.length - 1) kids.push(' ');
    });
    kids.push(seal('seal--title'));
    return h('h1', { id: 'gate-title', class: 'gate-title', 'data-focus': '', tabindex: '-1', 'aria-label': gate.headline }, kids);
  }

  function build() {
    const dest = pass.fields.find((f) => f[0] === 'Destination');
    const seat = pass.fields.find((f) => f[0] === 'Seat');
    const main = pass.fields.filter((f) => f !== dest);

    mainEl = h('div', { class: 'pass-half pass-main' },
      h('div', { class: 'pass-band' }, h('span', { class: 'pass-airline' }, pass.airline), h('span', { class: 'pass-kind' }, 'Boarding pass')),
      h('div', { class: 'pass-body' },
        dest ? h('div', { class: 'pass-dest' }, h('span', { class: 'pass-label' }, dest[0]), h('span', { class: 'pass-dest-name' }, dest[1])) : null,
        fieldList(main),
        h('div', { class: 'pass-code' }, h('div', { class: 'pass-bars', html: barcode(97, 64) }), h('span', null, pass.flight.replace(' ', '') + '  ' + (seat ? seat[1] : '') + '  0001'))));

    stubEl = h('div', { class: 'pass-half pass-stub' },
      h('div', { class: 'pass-band' }, h('span', { class: 'pass-kind' }, 'Flight ' + pass.flight)),
      h('div', { class: 'pass-body' },
        h('div', { class: 'pass-seat' }, h('span', { class: 'pass-label' }, 'Seat'), h('span', { class: 'pass-seat-no' }, pass.stubSeat || (seat && seat[1]) || '')),
        fieldList(pass.stubFields, 'pass-fields--stub'),
        seal('seal--stub')));

    scissors = h('span', { class: 'pass-scissors', 'aria-hidden': 'true' }, KY.icon('scissors'));
    fibre = h('div', { class: 'pass-fibre', 'aria-hidden': 'true' });
    const grip = h('button', { class: 'pass-grip', type: 'button', 'aria-label': 'Tear the boarding pass along the perforation' }, scissors);
    passEl = h('div', { class: 'pass', role: 'group', 'aria-label': 'Boarding pass' },
      h('div', { class: 'pass-shadow', 'aria-hidden': 'true' }), mainEl, stubEl, fibre, grip);

    el.append(h('div', { class: 'gate-stage' }, buildTitle(), h('div', { class: 'pass-wrap' }, passEl)));

    const teeth = [];
    for (let i = 0; i <= 44; i++) teeth.push(`${i % 2 ? 100 : 30 + (i * 7) % 40}% ${(i / 44) * 100}%`);
    fibre.style.clipPath = `polygon(0 0, ${teeth.join(', ')}, 0 100%)`;

    bind(grip);
    const sync = () => passEl.style.setProperty('--perf', mainEl.offsetHeight + 'px');
    if (window.ResizeObserver) new ResizeObserver(sync).observe(mainEl); else sync();

    /* the pass can be torn once it has arrived */
    const delay = KY.reducedMotion() ? 0 : 3600;
    readyTimer = setTimeout(() => passEl.classList.add('is-ready'), delay);
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
    raf = progress !== target ? requestAnimationFrame(loop) : 0;
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
  const easeBack = (k) => { const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

  async function autoTear() {
    if (busy) return;
    busy = true;
    if (KY.reducedMotion()) setTear(1); else await tween(1, 1000, easeInOut);
    finish();
  }
  async function springBack() { busy = true; await tween(0, 420, easeBack); busy = false; }

  function finish() {
    if (torn) return;
    torn = true; busy = true;
    setTear(1);
    el.classList.add('is-torn');
    if (KY.audio) KY.audio.tear();
    if (KY.reducedMotion()) { KY.go(KY.href.menu, { via: 'tear' }); return; }

    KY.animate(stubEl, [
      { offset: 0.25, transform: 'translate(70px,-60px) rotate(24deg)', opacity: 1 },
      { offset: 0.55, transform: 'translate(20px,-200px) rotate(-12deg)', opacity: 1 },
      { offset: 1, transform: 'translate(130px,-560px) rotate(36deg)', opacity: 0 },
    ], { duration: 3000, easing: 'cubic-bezier(.3,.1,.3,1)' });
    KY.animate(mainEl, [
      { offset: 0.2, transform: 'translate(-60px,-36px) rotate(-7deg)', opacity: 1 },
      { offset: 0.5, transform: 'translate(-24px,-180px) rotate(8deg)', opacity: 1 },
      { offset: 1, transform: 'translate(-150px,-600px) rotate(-28deg)', opacity: 0 },
    ], { duration: 3400, easing: 'cubic-bezier(.3,.1,.3,1)' });
    KY.animate(fibre, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 });
    KY.animate(scissors, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
    setTimeout(() => KY.go(KY.href.menu, { via: 'tear' }), 900);
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
      if (busy || torn || !passEl.classList.contains('is-ready') || (e.pointerType === 'mouse' && e.button !== 0)) return;
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
      if (mode === 'pending') autoTear();                         // a plain tap or click
      else if (mode === 'drag') { if (target >= 0.82) { busy = true; tween(1, 220, easeInOut).then(finish); } else springBack(); }
      else if (mode === 'hold') springBack();
    };
    passEl.addEventListener('pointerup', release);
    passEl.addEventListener('pointercancel', (e) => {
      if (down && down.mode === 'drag') { down = null; stopHold(); springBack(); } else release(e);
    });

    /* keyboard: the perforation is a real button */
    grip.addEventListener('click', (e) => { if (e.detail === 0 && passEl.classList.contains('is-ready')) autoTear(); });
    passEl.addEventListener('dragstart', (e) => e.preventDefault());
  }

  KY.screens.gate = {
    el,
    init: build,
    title: () => 'Boarding gate',
    enter() {
      /* coming back to the gate: put the ticket back together and skip the slow opening */
      if (torn) {
        torn = false; busy = false; progress = 0; target = 0;
        passEl.style.setProperty('--tear', 0);
        el.classList.remove('is-torn');
        el.classList.add('is-seen');
        passEl.classList.add('is-ready');
        [stubEl, mainEl, fibre, scissors].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
      }
    },
  };
})();
