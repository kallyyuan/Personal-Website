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
      h('span', { class: 'city-pin', html: '<svg viewBox="0 0 24 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"><path d="M8.5 37L9.8 14H14.2L15.5 37Z"/><path d="M9.3 26H14.7M8.9 32H15.1"/><path d="M7.4 14H16.6"/><rect x="9.6" y="8" width="4.8" height="6"/><path d="M8.6 8L12 3L15.4 8Z"/><path d="M5 37H19"/></g><circle cx="12" cy="11" r="1.7" fill="#E07B39"/></svg>' }),
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
