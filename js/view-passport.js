/* ==========================================================================
   The passport page: one stamp slot per place, plus one for the short haul.
   A slot stays empty until the visitor has been there.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;
  const P = KY.passport;

  KY.views = KY.views || {};

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ink colors, one per stamp (they are art, so they use the bright palette) */
  const INKS = { based: '#E07B39', been: ['#5172BB', '#469A77', '#456F72', '#5172BB'], tour: '#E07B39' };

  /* a rubber stamp, drawn in code and roughened like real ink */
  KY.stamp = function stamp(o) {
    const t = (x, y, size, txt, extra) => `<text x="100" y="${y}" font-size="${size}" ${extra || ''}>${esc(txt)}</text>`;
    const rule = (y) => `<path d="M40 ${y}h120" stroke="currentColor" stroke-width="1"/>`;
    let frame, body;
    if (o.shape === 'ticket') {
      frame = '<path d="M16 30h168v50a12 12 0 0 0 0 24v50H16v-50a12 12 0 0 0 0-24z" fill="none" stroke="currentColor" stroke-width="3"/>'
        + '<path d="M26 40h148v44a12 12 0 0 0 0 16v44H26v-44a12 12 0 0 0 0-16z" fill="none" stroke="currentColor" stroke-width="1"/>';
      body = t(100, 60, 12, o.top, 'letter-spacing="5"') + rule(68)
        + t(100, 100, 27, o.code, 'letter-spacing="2" font-weight="500"') + rule(112)
        + t(100, 126, 12, o.name, 'letter-spacing="4"')
        + t(100, 138, 9, o.date, 'letter-spacing="3"');
    } else if (o.shape === 'box') {
      frame = '<rect x="14" y="30" width="172" height="146" rx="8" fill="none" stroke="currentColor" stroke-width="3"/>'
        + '<rect x="23" y="39" width="154" height="128" rx="4" fill="none" stroke="currentColor" stroke-width="1"/>';
      body = t(100, 62, 12, o.top, 'letter-spacing="5"') + rule(71)
        + t(100, 114, 44, o.code, 'letter-spacing="3" font-weight="500"') + rule(124)
        + t(100, 142, 12, o.name, 'letter-spacing="4"')
        + t(100, 158, 10, o.date, 'letter-spacing="3"');
    } else {
      frame = '<circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="3"/>'
        + '<circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" stroke-width="1"/>';
      body = t(100, 62, 12, o.top, 'letter-spacing="5"') + rule(72)
        + t(100, 122, 50, o.code, 'letter-spacing="3" font-weight="500"') + rule(132)
        + t(100, 152, 13, o.name, 'letter-spacing="4"')
        + t(100, 172, 10, o.date, 'letter-spacing="3"');
    }
    const wrap = document.createElement('span');
    wrap.innerHTML = `<svg class="stamp" viewBox="0 0 200 200" role="img" aria-label="${esc(o.label)}" style="--st:${o.ink};--rot:${o.rot || 0}deg"><g filter="url(#rough-ink)">${frame}${body}</g></svg>`;
    return wrap.firstChild;
  };

  /* what each slot holds, in order: the places, then the short haul */
  function slots() {
    let n = 0;
    const list = D.places.map((p) => {
      const ink = p.group === 'based' ? INKS.based : INKS.been[n++ % INKS.been.length];
      return {
        id: p.id, name: p.name, code: p.code,
        shape: p.group === 'based' ? 'box' : 'circle',
        top: p.group === 'based' ? 'DEPARTED' : 'ARRIVED', ink,
        empty: { text: 'Fly there', href: KY.href.section('maps') },
      };
    });
    list.push({
      id: 'tour', name: site.tour.label, code: 'KY 2027', shape: 'ticket', top: 'LANDED', ink: INKS.tour,
      empty: { text: 'Take the short haul', href: KY.href.tour },
    });
    return list;
  }

  function render() {
    const rots = [-5, 3, -2, 6, -4, 2, -3, 4];
    const cells = slots().map((s, i) => {
      if (P.has(s.id)) {
        const el = KY.stamp({ shape: s.shape, top: s.top, code: s.code, name: s.name.toUpperCase(), date: P.date(s.id), ink: s.ink, rot: rots[i % rots.length],
          label: s.name + ', stamped ' + P.date(s.id) });
        if (P.takeFresh(s.id)) el.classList.add('is-fresh');
        return h('div', { class: 'pp-slot is-stamped' }, el);
      }
      return h('a', { class: 'pp-slot is-empty', href: s.empty.href, 'aria-label': s.name + ', not stamped yet. ' + s.empty.text },
        h('span', { class: 'pp-ghost', 'aria-hidden': 'true' }, s.code),
        h('span', { class: 'pp-hint' }, s.empty.text, KY.icon('arrow-long')));
    });
    return h('div', { class: 'view view--list' },
      h('header', { class: 'vhead' },
        h('div', null,
          h('h1', { class: 'vtitle', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, site.ui.passport),
          h('p', { class: 'vnote' }, P.count() + ' of ' + P.total() + ' stamped'))),
      h('div', { class: 'pp-book' }, cells));
  }

  KY.views.passport = { title: () => site.ui.passport, render };
})();
