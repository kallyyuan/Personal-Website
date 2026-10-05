/* ==========================================================================
   Sound. Off until the visitor turns it on, and never plays by itself.
   Everything is made in the browser (no audio files): a low cabin hum,
   a soft chime, and the sound of paper tearing.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const KEY = 'ky-sound';
  let ctx = null, master = null, hum = null, on = false;
  const listeners = [];

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  function noise(seconds, brown) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  }

  function startHum() {
    if (hum) return;
    const src = ctx.createBufferSource();
    src.buffer = noise(5, true);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 340;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start();
    g.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3);
    hum = { src, g };
  }
  function stopHum() {
    if (!hum) return;
    const h = hum; hum = null;
    h.g.gain.cancelScheduledValues(ctx.currentTime);
    h.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => { try { h.src.stop(); } catch (e) { /* ignore */ } }, 900);
  }

  function chime() {
    if (!on || !ctx) return;
    const t = ctx.currentTime;
    [[880, 0], [1318.5, 0.18]].forEach(([f, d]) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + d);
      g.gain.linearRampToValueAtTime(0.14, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + d + 1.3);
      o.connect(g); g.connect(master);
      o.start(t + d); o.stop(t + d + 1.4);
    });
  }

  function tear() {
    if (!on || !ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noise(1, false);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(3600, t); bp.frequency.exponentialRampToValueAtTime(900, t + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    for (let i = 0; i < 30; i++) g.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.34, t + i * 0.024);
    g.gain.linearRampToValueAtTime(0, t + 0.8);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 0.9);
  }

  function paint() {
    document.querySelectorAll('[data-sound-toggle]').forEach((b) => {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      const use = b.querySelector('use');
      if (use) use.setAttribute('href', on ? '#i-speaker' : '#i-speaker-off');
    });
    listeners.forEach((fn) => fn(on));
  }

  function setOn(v, silent) {
    if (v && !ensure()) return;
    on = v;
    try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* private window */ }
    if (v) { master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.4); startHum(); } else if (ctx) { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); stopHum(); }
    paint();
    if (v && !silent) chime();
  }

  KY.audio = {
    toggle() { setOn(!on); },
    isOn: () => on,
    chime, tear,
    onChange(fn) { listeners.push(fn); },
  };

  /* wire up every sound button, now and later */
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-sound-toggle]');
    if (b) KY.audio.toggle();
  });
  const hud = document.getElementById('hud-sound');
  if (hud) hud.setAttribute('data-sound-toggle', '');

  /* a remembered "on" can only start after the visitor does something */
  let remembered = false;
  try { remembered = localStorage.getItem(KEY) === 'on'; } catch (e) { /* ignore */ }
  if (remembered) {
    const resume = () => { document.removeEventListener('pointerdown', resume); document.removeEventListener('keydown', resume); setOn(true, true); };
    document.addEventListener('pointerdown', resume);
    document.addEventListener('keydown', resume);
    document.querySelectorAll('[data-sound-toggle]').forEach((b) => b.setAttribute('aria-pressed', 'true'));
  }
  paint();
})();
