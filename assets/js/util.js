/* Small helpers shared by every view. No dependencies. */
(function () {
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  var U = {
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
    },
    /** "a | b | c" -> ['a','b','c'] */
    list: function (s) {
      return String(s || '').split('|').map(function (x) { return x.trim(); }).filter(Boolean);
    },
    /** "Title :: Description" -> {title, desc, parts[]} */
    pair: function (s) {
      var parts = String(s || '').split('::').map(function (x) { return x.trim(); });
      return { title: parts[0] || '', desc: parts.slice(1).join(' :: '), parts: parts };
    },
    pairs: function (s) { return U.list(s).map(U.pair); },
    /** Only allow http(s), mailto/tel, relative and in-app hash links. */
    safeUrl: function (u) {
      u = String(u || '').trim();
      if (!u) return '';
      if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
      if (/^(#|\.\/|\/)/.test(u)) return u;
      return '';
    },
    isExternal: function (u) { return /^https?:/i.test(u || ''); },
    isTrue: function (v) { return String(v).toUpperCase() !== 'FALSE'; },
    waLink: function (number, text) {
      var n = String(number || '').replace(/\D/g, '');
      if (!n) return '';
      return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
    },
    slugOk: function (s) { return /^[a-z0-9-]+$/.test(s); },
    $: function (sel, root) { return (root || document).querySelector(sel); },
    $$: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },
    scrollToEl: function (el) {
      if (!el) return;
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    },
    utm: function () {
      try {
        var q = new URLSearchParams(location.search), out = [];
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
          if (q.get(k)) out.push(k + '=' + q.get(k));
        });
        return out.join('&');
      } catch (e) { return ''; }
    }
  };

  window.U = U;
})();
