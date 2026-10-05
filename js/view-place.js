/* ==========================================================================
   One city: a watercolor crop of the map around it, the photography series
   and the personal writing that belong to it.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const D = KY.data;
  const site = D.site;
  const W = window.KALLY_WORLD;

  KY.views = KY.views || {};
  const rad = Math.PI / 180;
  const my = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * rad));
  const fx = (lon) => (lon + 180) / 360;
  const fy = (lat) => (W.yTop - my(lat)) * W.k / W.h;

  function localTime(tz) {
    try { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date()); } catch (e) { return ''; }
  }

  function render(r) {
    const p = D.placeById[r.placeId];
    const label = (site.groups.places.find((g) => g[0] === p.group) || [0, ''])[1];
    const from = 'place';

    const hero = h('div', { class: 'city-hero' },
      h('img', { class: 'city-map city-map--day', src: 'assets/watercolor/map.webp', alt: '', decoding: 'async' }),
      h('img', { class: 'city-map city-map--night', src: 'assets/watercolor/map-night.webp', alt: '', decoding: 'async' }),
      h('span', { class: 'city-pin', 'aria-hidden': 'true' }, site.map.pin || '📍'),
      h('div', { class: 'city-head' },
        h('p', { class: 'city-meta' }, h('b', null, p.code), label),
        h('h1', { class: 'city-name', id: 'seat-title', 'data-focus': '', tabindex: '-1' }, p.name),
        h('p', { class: 'city-when' }, p.when, h('span', null, localTime(p.tz)))));

    const photo = (it) => h('a', { class: 'pcard', href: KY.href.piece(it.id, from + ':' + p.id) },
      KY.media(KY.thumbOf(it).m, { ratio: '3 / 2', cls: 'pcard-media' }),
      h('div', { class: 'pcard-body' }, h('h3', null, it.title), h('div', { class: 'pcard-meta' }, KY.tag(it.track), h('span', null, it.work.slides.length + ' photographs'))));
    const writing = (it) => h('a', { class: 'wrow', href: KY.href.piece(it.id, from + ':' + p.id) },
      h('span', { class: 'wrow-title' }, it.title), KY.tag(it.track), KY.icon('arrow-long'));

    const body = h('div', { class: 'city-body' },
      h('section', { class: 'city-col' }, h('h2', null, 'Photography'), h('div', { class: 'pcards' }, (p.photography || []).map(photo))),
      h('section', { class: 'city-col' }, h('h2', null, 'Writing'), h('div', { class: 'wrows' }, (p.writing || []).map(writing))));

    const root = h('div', { class: 'view view--city' }, hero, body);
    if (KY.passport && KY.passport.stamp(p.id)) {
      hero.append(h('a', { class: 'stampnote', href: KY.href.passport, role: 'status' }, h('span', { class: 'emoji', 'aria-hidden': 'true' }, site.ui.passportEmoji), 'Passport stamped'));
    }

    /* put the city in the crop: centred on wide screens, tucked to the right on phones so the title has room */
    const z = 4.4;
    const pinEl = hero.querySelector('.city-pin');
    const aim = () => {
      const cw = hero.clientWidth, ch = hero.clientHeight;
      if (!cw || !ch) return;
      const narrow = cw < 560;
      const px = narrow ? 0.74 : 0.5, py = narrow ? 0.3 : 0.46;
      const sw = z * cw, sh = sw / (W.w / W.h);
      const X = (fx(p.lon) * sw - cw * px), Y = (fy(p.lat) * sh - ch * py);
      pinEl.style.left = (px * 100) + '%'; pinEl.style.top = (py * 100) + '%';
      hero.querySelectorAll('.city-map').forEach((im) => { im.style.width = sw + 'px'; im.style.height = sh + 'px'; im.style.transform = `translate(${-X}px, ${-Y}px)`; });
    };
    requestAnimationFrame(aim);
    if (window.ResizeObserver) new ResizeObserver(aim).observe(hero);
    return root;
  }

  KY.views.place = {
    title: (r) => (D.placeById[r.placeId] || { name: 'Place' }).name,
    back: () => ({ href: KY.href.section('maps'), label: 'Maps' }),
    render,
  };
})();
