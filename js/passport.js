/* ==========================================================================
   The passport: remembers which places the visitor has been stamped in.
   One stamp for boarding in the home city, one for every city they fly to,
   and one for finishing the short haul. Kept in the browser only.
   ========================================================================== */
(function () {
  const KY = window.KY;
  const D = KY.data;
  const KEY = 'ky-passport';
  const based = D.places.find((p) => p.group === 'based') || D.places[0];
  const valid = new Set(D.places.map((p) => p.id).concat('tour'));
  const fresh = new Set();     // stamped this visit and not yet shown on the passport page

  let book = {};
  try { book = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { book = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(book)); } catch (e) { /* private window */ } };

  const pad = (n) => String(n).padStart(2, '0');
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const api = {
    has: (id) => !!book[id],
    count: () => Object.keys(book).filter((id) => valid.has(id)).length,
    total: () => valid.size,
    /* "05 OCT 2026" */
    date(id) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(book[id] || '');
      return m ? m[3] + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] : '';
    },
    /* returns true only the first time, so the caller can celebrate */
    stamp(id) {
      if (!valid.has(id) || book[id]) return false;
      const d = new Date();
      book[id] = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      fresh.add(id);
      save();
      return true;
    },
    board: () => api.stamp(based.id),
    takeFresh(id) { const f = fresh.has(id); fresh.delete(id); return f; },
  };
  KY.passport = api;
})();
