/*
 * CMS data layer: cache-first with background refresh.
 *   1. Render instantly from localStorage (or the bundled fallback.json on first visit).
 *   2. If the cache is older than CACHE_MAX_AGE_MS, fetch the Apps Script JSON in the background.
 *   3. If the content changed, tell the app to re-render.
 */
(function () {
  var C = window.PROEASE_CONFIG;

  function readCache() {
    try {
      var raw = localStorage.getItem(C.CACHE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && o.data && o.data.company) ? o : null;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(C.CACHE_KEY, JSON.stringify({ t: Date.now(), data: data })); } catch (e) {}
  }

  function fetchJson(url, timeoutMs) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, timeoutMs || C.FETCH_TIMEOUT_MS) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }

  function valid(d) { return d && d.ok !== false && d.company && Array.isArray(d.products); }

  function apiUrl(bust) {
    var u = C.API_URL;
    if (!u) return '';
    return u + (u.indexOf('?') > -1 ? '&' : '?') + (bust ? 'fresh=1&' : '') + '_=' + Date.now();
  }

  var Data = {
    state: { company: {}, products: [], inquiryCategories: [], source: 'none' },
    _sig: '',

    apply: function (d, source) {
      Data.state = {
        company: d.company || {},
        products: d.products || [],
        inquiryCategories: d.inquiryCategories || [],
        source: source
      };
      Data._sig = JSON.stringify([d.company, d.products]);
    },

    /** Resolves as soon as ANY usable content exists (cache or fallback). */
    load: function (onUpdate) {
      var cached = readCache();
      var ready;

      if (cached) {
        Data.apply(cached.data, 'cache');
        ready = Promise.resolve();
      } else {
        ready = fetchJson(C.FALLBACK_URL, 6000).then(function (d) {
          Data.apply(d, 'fallback');
        });
      }

      ready.then(function () {
        var stale = !cached || (Date.now() - cached.t > C.CACHE_MAX_AGE_MS);
        if (C.API_URL && stale) Data.refresh(onUpdate);
      });
      return ready;
    },

    refresh: function (onUpdate, bust) {
      if (!C.API_URL) return Promise.resolve(false);
      return fetchJson(apiUrl(bust)).then(function (d) {
        if (!valid(d)) throw new Error('Bad CMS payload');
        var sig = JSON.stringify([d.company, d.products]);
        writeCache(d);
        if (sig !== Data._sig) {
          Data.apply(d, 'sheet');
          if (onUpdate) onUpdate();
          return true;
        }
        return false;
      }).catch(function (e) {
        if (window.console) console.warn('[ProEase] CMS refresh failed, using cached content:', e && e.message);
        return false;
      });
    },

    co: function (key, dflt) {
      var v = Data.state.company[key];
      return (v == null || v === '') ? (dflt == null ? '' : dflt) : v;
    },
    suite: function () { return Data.state.products.filter(function (p) { return /suite/i.test(p.Category); }); },
    apps: function () { return Data.state.products.filter(function (p) { return !/suite/i.test(p.Category); }); },
    product: function (slug) {
      return Data.state.products.filter(function (p) { return p.Slug === slug; })[0] || null;
    },
    tiers: function (p) {
      var out = [];
      for (var i = 1; i <= 6; i++) {
        var name = p['Tier' + i + '_Name'];
        if (!name) continue;
        out.push({
          n: i,
          name: name,
          price: p['Tier' + i + '_Price'] || '',
          billing: p['Tier' + i + '_Billing'] || '',
          features: U.list(p['Tier' + i + '_Features']),
          cta: p['Tier' + i + '_CTA'] || 'Enquire',
          url: U.safeUrl(p['Tier' + i + '_Checkout_URL']),
          badge: p['Tier' + i + '_Badge'] || '',
          inquiry: p['Tier' + i + '_Inquiry_Type'] || p.Default_Inquiry_Type || ''
        });
      }
      return out;
    },
    categories: function () {
      var c = Data.state.inquiryCategories;
      return (c && c.length) ? c : ['Custom Software Build', 'ProEase+ Bundle & DB Setup', 'License Purchase & DB Setup',
        'Subscription Inquiry', 'One-Time License Purchase', 'Prototype Walkthrough', 'Demo Request'];
    },
    whatsapp: function (text) {
      return U.waLink(Data.co('whatsapp_number'), text || Data.co('whatsapp_default_message'));
    }
  };

  window.Data = Data;
})();
