/* ==========================================================================
   Sky: soft clouds drifting behind every screen.
   Each row is [cloud shape, left %, top %, width in vw]. Shapes: a, b, c, d.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const VIEW = { a: '0 0 400 200', b: '0 0 300 220', c: '0 0 230 130', d: '0 0 500 160' };

  const LAYERS = [
    { name: 'far', parallax: 0.35, opacity: 0.8, clouds: [
      ['c', -4, 9, 13], ['d', 16, 3, 20], ['c', 42, 13, 11], ['d', 60, 5, 21], ['c', 82, 17, 13],
      ['b', 28, 33, 8], ['c', 72, 40, 10], ['d', 4, 45, 15], ['c', 104, 24, 12], ['d', 96, 8, 19],
    ] },
    { name: 'mid', parallax: 0.7, opacity: 0.95, clouds: [
      ['a', -8, 30, 23], ['d', 34, 25, 21], ['b', 69, 27, 15], ['c', 52, 47, 13], ['a', 86, 50, 19],
      ['d', 6, 62, 19], ['b', 104, 38, 15], ['a', 112, 58, 18],
    ] },
    { name: 'near', parallax: 1.1, opacity: 1, clouds: [
      ['a', -10, 76, 34], ['b', 20, 81, 22], ['d', 42, 85, 38], ['a', 68, 78, 34], ['b', 90, 84, 22],
      ['a', 108, 72, 32], ['d', -14, 50, 26], ['d', 112, 90, 30],
    ] },
  ];

  const root = document.getElementById('sky');
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  root.append(KY.h('div', { class: 'sky-rainbow' }));

  LAYERS.forEach((L) => {
    const layer = KY.h('div', { class: 'cloud-layer cloud-layer--' + L.name, style: { '--parallax': L.parallax, opacity: L.opacity } });
    L.clouds.forEach(([v, left, top, w], i) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', VIEW[v]);
      svg.setAttribute('class', 'cloud');
      svg.style.left = left + '%';
      svg.style.top = top + '%';
      svg.style.width = w + 'vw';
      svg.style.setProperty('--dur', (80 + rand() * 90).toFixed(0) + 's');
      svg.style.setProperty('--delay', (-rand() * 60).toFixed(0) + 's');
      if (i % 2) svg.style.animationDirection = 'alternate-reverse';
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#cloud-' + v);
      svg.append(use);
      layer.append(svg);
    });
    root.append(layer);
  });

  /* Each screen nudges the clouds sideways, so moving through the site feels like flying. */
  KY.sky = {
    setShift(n) { root.style.setProperty('--route-shift', n); },
  };
})();
