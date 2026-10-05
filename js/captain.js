/* ==========================================================================
   "Your captain": the contact card in the top corner. Text lives in
   js/content/site.js under "captain".
   ========================================================================== */
(function () {
  const KY = window.KY;
  const h = KY.h;
  const c = KY.data.site.captain;
  const dlg = document.getElementById('captain-dialog');
  const btn = document.getElementById('hud-captain');

  function contact(row) {
    const live = row.href && !KY.isPlaceholder(row.value);
    return h('li', { class: 'cap-row' },
      h('span', { class: 'cap-label' }, row.label),
      live ? h('a', { href: row.href, target: row.href.startsWith('http') ? '_blank' : null, rel: 'noopener' }, row.value) : h('span', { class: 'cap-value' }, row.value));
  }

  const closeBtn = h('button', { class: 'cap-close', type: 'button', 'aria-label': 'Close', onclick: () => dlg.close() }, KY.icon('close'));
  dlg.append(h('div', { class: 'cap-tag' },
    h('span', { class: 'cap-hole', 'aria-hidden': 'true' }),
    closeBtn,
    h('p', { class: 'cap-eyebrow' }, c.title),
    h('h2', { id: 'captain-title', class: 'cap-name' }, c.name),
    h('ul', { class: 'cap-lines' }, c.lines.map((l) => h('li', null, l))),
    h('p', { class: 'cap-goal' }, c.goal),
    c.bio ? h('p', { class: 'cap-bio' }, c.bio) : null,
    h('ul', { class: 'cap-contacts' }, c.contacts.map(contact))));

  btn.addEventListener('click', () => { if (!dlg.open) dlg.showModal(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
})();
