/* Inquiry form: renders, pre-fills from pricing tiers, posts to Apps Script, WhatsApp fallback. */
(function () {
  var C = window.PROEASE_CONFIG;

  function field(id, label, extra) {
    extra = extra || {};
    var req = extra.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
    var attrs = (extra.required ? ' required' : '') + (extra.attrs || '');
    var input;
    if (extra.type === 'textarea') {
      input = '<textarea id="' + id + '" name="' + id + '" rows="' + (extra.rows || 4) + '" class="input"' + attrs + '></textarea>';
    } else if (extra.type === 'select') {
      input = '<select id="' + id + '" name="' + id + '" class="input"' + attrs + '>' + extra.options + '</select>';
    } else {
      input = '<input id="' + id + '" name="' + id + '" type="' + (extra.type || 'text') + '" class="input"' + attrs + '>';
    }
    return '<div class="field' + (extra.full ? ' full' : '') + '"><label for="' + id + '">' + label + req + '</label>' + input +
      '<p class="err" data-err="' + id + '" role="alert"></p></div>';
  }

  function opts(list, selected, blank) {
    var h = blank ? '<option value="">' + U.esc(blank) + '</option>' : '';
    list.forEach(function (o) {
      h += '<option' + (o === selected ? ' selected' : '') + '>' + U.esc(o) + '</option>';
    });
    return h;
  }

  var Form = {
    /**
     * ctx: { product, category, mode: 'product' | 'custom', heading, intro }
     */
    html: function (ctx) {
      var custom = ctx.mode === 'custom';
      var cats = Data.categories();
      var cat = ctx.category || (custom ? 'Custom Software Build' : cats[0]);
      var budgets = U.list(Data.co('custom_budget_options'));
      var times = U.list(Data.co('custom_timeline_options'));
      var wa = Data.whatsapp(ctx.waText || '');

      return '<section class="section" id="enquire" data-form-root>' +
        '<div class="form-card">' +
        '<div class="form-head"><h2>' + U.esc(ctx.heading) + '</h2><p>' + U.esc(ctx.intro) + '</p></div>' +
        '<form id="lead-form" novalidate autocomplete="on">' +
        '<div class="grid-2">' +
        field('f-name', 'Your name', { required: true, attrs: ' autocomplete="name"' }) +
        field('f-company', 'Company', { attrs: ' autocomplete="organization"' }) +
        field('f-email', 'Email', { type: 'email', attrs: ' autocomplete="email" inputmode="email"' }) +
        field('f-phone', 'WhatsApp / phone', { type: 'tel', attrs: ' autocomplete="tel" inputmode="tel" placeholder="+60 12-345 6789"' }) +
        field('f-category', 'I\'m interested in', { type: 'select', options: opts(cats, cat), required: true }) +
        field('f-product', 'Product', { attrs: ' value="' + U.esc(ctx.product || 'Custom Project') + '" readonly' }) +
        (custom ? field('f-budget', 'Budget range', { type: 'select', options: opts(budgets, '', 'Select…') }) +
          field('f-timeline', 'Timeline', { type: 'select', options: opts(times, '', 'Select…') }) :
          field('f-plan', 'Selected plan', { attrs: ' placeholder="Pick a plan above or type one"' })) +
        field('f-message', custom ? 'What do you need built?' : 'Tell us about your business', {
          type: 'textarea', full: true, rows: 5,
          attrs: ' placeholder="' + (custom ? 'Describe the process or tool, who uses it, and what it replaces.' : 'Team size, number of sites, what you use today.') + '"'
        }) +
        '</div>' +
        '<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" id="f-website" tabindex="-1" autocomplete="off"></label></div>' +
        '<div class="form-actions">' +
        '<button type="submit" class="btn btn-primary btn-lg" id="f-submit">' + (custom ? 'Send Build Request' : 'Send Enquiry') + '</button>' +
        (wa ? '<a class="btn btn-wa btn-lg" id="wa-btn" href="' + U.esc(wa) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'Enquire via WhatsApp</a>' : '') +
        '</div>' +
        '<p class="form-note">We reply within one business day. Your details are only used to respond to this request.</p>' +
        '<div class="form-msg" id="form-msg" role="status" aria-live="polite" hidden></div>' +
        '</form></div></section>';
    },

    bind: function (ctx) {
      var form = U.$('#lead-form');
      if (!form) return;
      var wa = U.$('#wa-btn');

      function val(id) { return (U.$('#' + id, form) || { value: '' }).value.trim(); }

      function waText() {
        var parts = ['Hi ProEase Labs,'];
        var prod = val('f-product'), plan = val('f-plan'), cat = val('f-category');
        if (ctx.mode === 'custom') parts.push("I'd like to request a custom software build.");
        else {
          parts.push("I'm interested in " + prod + (plan ? ' (' + plan + ' plan)' : '') + '.');
          if (cat) parts.push('Enquiry type: ' + cat + '.');
        }
        var n = val('f-name'), co = val('f-company');
        if (n) parts.push('My name is ' + n + (co ? ' from ' + co : '') + '.');
        return parts.join(' ');
      }
      function syncWa() { if (wa) wa.href = Data.whatsapp(waText()) || wa.href; }
      form.addEventListener('input', syncWa);
      form.addEventListener('change', syncWa);
      syncWa();

      function setErr(id, msg) {
        var el = U.$('[data-err="' + id + '"]', form);
        if (el) el.textContent = msg || '';
        var inp = U.$('#' + id, form);
        if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }

      function validate() {
        var ok = true;
        ['f-name', 'f-email', 'f-phone'].forEach(function (i) { setErr(i, ''); });
        if (val('f-name').length < 2) { setErr('f-name', 'Please enter your name.'); ok = false; }
        var email = val('f-email'), phone = val('f-phone');
        if (!email && !phone) {
          setErr('f-email', 'Add an email or a WhatsApp number so we can reply.'); ok = false;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr('f-email', 'That email doesn\'t look right.'); ok = false; }
        if (phone && !/^[+\d][\d\s\-()]{6,}$/.test(phone)) { setErr('f-phone', 'Use digits, e.g. +60 12-345 6789.'); ok = false; }
        if (!ok) { var bad = U.$('[aria-invalid="true"]', form); if (bad) bad.focus(); }
        return ok;
      }

      function showMsg(kind, html) {
        var m = U.$('#form-msg', form);
        m.className = 'form-msg ' + kind;
        m.innerHTML = html;
        m.hidden = false;
        m.scrollIntoView({ block: 'nearest' });
      }

      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (!validate()) return;
        var btn = U.$('#f-submit', form);
        var label = btn.textContent;

        var payload = {
          name: val('f-name'), company: val('f-company'), email: val('f-email'), phone: val('f-phone'),
          category: val('f-category'), product: val('f-product') || 'Custom Project', plan: val('f-plan'),
          budget: val('f-budget'), timeline: val('f-timeline'), message: val('f-message'),
          website: val('f-website'),
          page: location.href.split('#')[0] + (location.hash || ''),
          referrer: document.referrer || '', utm: U.utm(), userAgent: navigator.userAgent
        };

        var waUrl = Data.whatsapp(waText());
        var waHtml = waUrl ? ' <a href="' + U.esc(waUrl) + '" target="_blank" rel="noopener">Message us on WhatsApp instead</a>.' : '';

        if (!C.API_URL) {
          showMsg('warn', 'This portal isn\'t connected to its Google Sheet yet, so the form can\'t save your request.' + waHtml);
          return;
        }

        btn.disabled = true; btn.textContent = 'Sending…';
        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : null;

        // text/plain keeps this a "simple" request, so no CORS preflight (Apps Script can't answer one).
        fetch(C.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          signal: ctrl ? ctrl.signal : undefined
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (timer) clearTimeout(timer);
          if (!res || !res.ok) {
            var f = res && res.fields && res.fields.length ? ' Please check: ' + res.fields.join(', ') + '.' : '';
            throw new Error('rejected' + f);
          }
          var msg = Data.co('form_success_message', 'Thank you — your request is in.');
          showMsg('ok', '<strong>' + U.esc(msg) + '</strong>' +
            (res.reference ? '<br><span class="ref">Reference: ' + U.esc(res.reference) + '</span>' : ''));
          form.reset();
          U.$('#f-product', form).value = payload.product;
          U.$('#f-category', form).value = payload.category;
          syncWa();
        }).catch(function (e) {
          if (timer) clearTimeout(timer);
          var detail = /rejected/.test(String(e && e.message)) ? String(e.message).replace('rejected', '').trim() : '';
          showMsg('err', 'We couldn\'t send that just now.' + (detail ? ' ' + U.esc(detail) : '') + ' Please try again, or' + (waHtml || ' email us.'));
        }).then(function () {
          btn.disabled = false; btn.textContent = label;
        });
      });
    },

    /** Called when a pricing tier without a checkout URL is chosen. */
    prefill: function (opts) {
      var set = function (id, v) { var el = U.$('#' + id); if (el && v != null) el.value = v; };
      set('f-plan', opts.plan);
      set('f-product', opts.product);
      if (opts.category) set('f-category', opts.category);
      var form = U.$('#lead-form');
      if (form) form.dispatchEvent(new Event('input'));
      U.scrollToEl(U.$('#enquire'));
      setTimeout(function () { var n = U.$('#f-name'); if (n) n.focus({ preventScroll: true }); }, 450);
    }
  };

  window.Form = Form;
})();
