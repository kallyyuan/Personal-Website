/* ==========================================================================
   Skyline illustrations for each stop, drawn as simple soft shapes.
   Keyed by the place's "theme" value in its content file.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const W = '#ffffff';

  function palm(x, h, lean) {
    const tx = x + lean, ty = 150 - h;
    let s = `<path d="M${x} 150 Q${x + lean * 0.3} ${150 - h * 0.55} ${tx} ${ty}" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    [200, 235, 270, 305, 340, 165].forEach((deg) => {
      const a = (deg * Math.PI) / 180, L = 34;
      const ex = tx + L * Math.cos(a), ey = ty + L * Math.sin(a) + 12;
      const cx = tx + L * 0.55 * Math.cos(a), cy = ty + L * 0.55 * Math.sin(a) - 8;
      s += `<path d="M${tx} ${ty} Q${cx} ${cy} ${ex} ${ey}" stroke="${W}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    });
    return s;
  }
  const rects = (list, op) => list.map(([x, w, h]) => `<rect x="${x}" y="${150 - h}" width="${w}" height="${h}" rx="2" fill="${W}" opacity="${op}"/>`).join('');

  const ART = {
    la: () =>
      `<circle cx="470" cy="92" r="40" fill="#fff0bd"/>
       <path d="M0 150V112C90 94 170 104 260 116C340 126 430 106 600 114V150Z" fill="${W}" opacity=".75"/>
       ${palm(90, 70, 10)}${palm(140, 52, -8)}${palm(350, 78, 12)}${palm(520, 58, -10)}`,
    ny: () =>
      `${rects([[20, 34, 52], [60, 28, 78], [96, 40, 62], [150, 30, 92], [250, 34, 70], [292, 44, 54], [344, 30, 84], [380, 38, 60], [424, 28, 96], [460, 42, 66], [510, 32, 80], [550, 40, 50]], '.7')}
       <path d="M196 150V78h6v-10h8v-12h5V34h2v22h5v12h8v10h6v72Z" fill="${W}"/>
       <rect x="200" y="20" width="2" height="16" fill="${W}"/>`,
    sh: () =>
      `${rects([[24, 30, 46], [66, 26, 70], [330, 34, 60], [376, 26, 84], [412, 38, 54], [460, 28, 72], [500, 36, 50], [546, 28, 64]], '.7')}
       <path d="M250 150L262 96M262 150L262 96M274 150L262 96" stroke="${W}" stroke-width="3" fill="none"/>
       <rect x="260" y="40" width="4" height="70" fill="${W}"/>
       <circle cx="262" cy="104" r="15" fill="${W}"/><circle cx="262" cy="70" r="9" fill="${W}"/><circle cx="262" cy="44" r="5" fill="${W}"/>
       <path d="M262 40V16" stroke="${W}" stroke-width="2"/>
       <path fill-rule="evenodd" d="M100 150V50h38v100zM108 64a11 11 0 1022 0 11 11 0 10-22 0z" fill="${W}" opacity=".9"/>`,
    tk: () =>
      `<path d="M150 150L330 46L510 150Z" fill="${W}" opacity=".75"/>
       <path d="M284 72L330 46L376 72L356 68L338 80L320 68Z" fill="${W}"/>
       <path d="M60 150L82 70H92L114 150Z" fill="${W}"/>
       <path d="M78 96H96M72 120H102" stroke="#cfe3f5" stroke-width="3"/>
       <rect x="86" y="30" width="2" height="42" fill="${W}"/>
       <circle cx="522" cy="108" r="16" fill="#ffd3e2"/><circle cx="540" cy="98" r="13" fill="#ffc2d6"/><circle cx="506" cy="122" r="12" fill="#ffd3e2"/>
       <path d="M0 150V130C120 122 200 134 600 128V150Z" fill="${W}" opacity=".6"/>`,
    ke: () =>
      `<circle cx="150" cy="86" r="46" fill="#ffe6a6"/>
       <path d="M0 150V120C100 104 200 124 320 112C430 100 520 118 600 110V150Z" fill="${W}" opacity=".78"/>
       <path d="M420 150V96" stroke="${W}" stroke-width="6" stroke-linecap="round"/>
       <path d="M420 110L396 92M420 104L446 86" stroke="${W}" stroke-width="4" stroke-linecap="round"/>
       <ellipse cx="420" cy="80" rx="62" ry="13" fill="${W}"/><ellipse cx="392" cy="86" rx="30" ry="9" fill="${W}"/><ellipse cx="452" cy="84" rx="28" ry="9" fill="${W}"/>
       <path d="M300 56q6-8 12 0M322 44q6-8 12 0M346 60q5-7 10 0" stroke="${W}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  };

  KY.motif = function (theme) {
    const art = (ART[theme] || ART.la)();
    return `<svg viewBox="0 0 600 150" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">${art}</svg>`;
  };
})();
