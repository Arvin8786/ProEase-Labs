/* App shell: sidebar, hash router, boot, service worker registration. */
(function () {
  var esc = U.esc;
  var main, side, overlay;
  var current = { name: '', slug: '' };

  function parseRoute() {
    var h = (location.hash || '#/').replace(/^#/, '');
    var seg = h.split('?')[0].split('/').filter(Boolean);
    if (!seg.length) return { name: 'home' };
    if (seg[0] === 'product' && seg[1] && U.slugOk(seg[1])) return { name: 'product', slug: seg[1] };
    if (seg[0] === 'custom-build') return { name: 'custom' };
    return { name: 'notfound' };
  }

  /* ---------------------------- sidebar ---------------------------- */

  function navLink(href, label, iconName, opts) {
    opts = opts || {};
    return '<a class="nav-link' + (opts.active ? ' active' : '') + '" href="' + esc(href) + '"' + (opts.active ? ' aria-current="page"' : '') + '>' +
      '<span class="nav-ic">' + icon(iconName) + '</span><span class="nav-label">' + esc(label) + '</span>' +
      (opts.pill ? '<span class="pill">' + esc(opts.pill) + '</span>' : '') + '</a>';
  }

  function renderSidebar() {
    var r = parseRoute();
    var link = function (p) {
      return navLink('#/product/' + p.Slug, p.Product_Name, p.Icon || 'box',
        { active: r.name === 'product' && r.slug === p.Slug, pill: p.Sidebar_Pill });
    };
    var co = Data.co;
    var socials = [['linkedin_url', 'linkedin', 'LinkedIn'], ['instagram_url', 'instagram', 'Instagram'],
      ['tiktok_url', 'tiktok', 'TikTok'], ['youtube_url', 'youtube', 'YouTube']].map(function (s) {
      var u = U.safeUrl(co(s[0]));
      return u ? '<a class="soc" href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + s[2] + '">' + icon(s[1]) + '</a>' : '';
    }).join('');
    var wa = Data.whatsapp();
    var logo = U.safeUrl(co('logo_url'));

    var suite = Data.suite(), apps = Data.apps();
    side.innerHTML =
      '<div class="side-head"><a class="brand" href="#/">' +
      (logo ? '<img class="brand-img" src="' + esc(logo) + '" alt="">' : '<span class="brand-mark"><img src="./assets/img/icon.svg" alt=""></span>') +
      '<span class="brand-txt"><strong>' + esc(co('brand_name', 'ProEase Labs')) + '</strong><small>' + esc(co('brand_tagline')) + '</small></span></a>' +
      '<button type="button" class="icon-btn only-mobile" id="side-close" aria-label="Close menu">' + icon('x') + '</button></div>' +
      '<nav class="side-nav" aria-label="Main">' +
      navLink('#/', 'Studio Home', 'home', { active: r.name === 'home' }) +
      (suite.length ? '<div class="nav-group">Business Suite</div>' + suite.map(link).join('') : '') +
      (apps.length ? '<div class="nav-group">Apps &amp; Prototypes</div>' + apps.map(link).join('') : '') +
      '<div class="nav-group">Services</div>' +
      navLink('#/custom-build', 'Custom Software Build', 'wrench', { active: r.name === 'custom' }) +
      '</nav>' +
      '<div class="side-foot">' +
      (wa ? '<a class="btn btn-wa btn-block" href="' + esc(wa) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'WhatsApp us</a>' : '') +
      (co('contact_email') ? '<a class="foot-link" href="mailto:' + esc(co('contact_email')) + '">' + icon('mail') + esc(co('contact_email')) + '</a>' : '') +
      (socials ? '<div class="socials">' + socials + '</div>' : '') +
      '</div>';

    U.$('#side-close', side).addEventListener('click', closeDrawer);
  }

  function openDrawer() { document.body.classList.add('drawer-open'); overlay.hidden = false; }
  function closeDrawer() { document.body.classList.remove('drawer-open'); overlay.hidden = true; }

  /* ---------------------------- footer ---------------------------- */

  function footerHtml() {
    var co = Data.co;
    var legal = co('footer_legal', '© {year} ProEase Labs.').replace('{year}', new Date().getFullYear());
    return '<footer class="foot"><div><strong>' + esc(co('brand_name', 'ProEase Labs')) + '</strong><p>' + esc(co('footer_text')) + '</p>' +
      (co('location') ? '<p class="muted">' + icon('pin') + esc(co('location')) + '</p>' : '') +
      (co('business_hours') ? '<p class="muted">' + icon('clock') + esc(co('business_hours')) + '</p>' : '') + '</div>' +
      '<p class="legal">' + esc(legal) + '</p></footer>';
  }

  /* ---------------------------- routing ---------------------------- */

  function setMeta(title, desc) {
    document.title = title;
    var m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute('content', desc);
  }

  function render(keepScroll) {
    var r = parseRoute();
    var html;
    if (r.name === 'home') {
      html = Views.home();
      setMeta(Data.co('seo_title', 'ProEase Labs'), Data.co('seo_description'));
    } else if (r.name === 'product') {
      var p = Data.product(r.slug);
      html = Views.product(r.slug);
      setMeta(p ? p.Product_Name + ' — ' + Data.co('brand_name', 'ProEase Labs') : 'Not found — ProEase Labs', p ? p.Short_Description : '');
    } else if (r.name === 'custom') {
      html = Views.custom();
      setMeta('Custom Software Build — ' + Data.co('brand_name', 'ProEase Labs'), Data.co('custom_summary'));
    } else {
      html = Views.notFound();
      setMeta('Not found — ProEase Labs', '');
    }
    main.innerHTML = '<div class="page">' + html + footerHtml() + '</div>';
    renderSidebar();
    bindPage(r);
    reveal();
    if (!keepScroll) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    current = r;
  }

  /** Gentle fade-up for sections as they scroll into view. */
  function reveal() {
    var els = U.$$('.section, .stats, .pcard, .tier, .ben, .sec-item, .dna-item, .steps li', main);
    if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  }

  function bindPage(r) {
    U.$$('[data-scroll]', main).forEach(function (b) {
      b.addEventListener('click', function () { U.scrollToEl(document.getElementById(b.getAttribute('data-scroll'))); });
    });
    if (r.name === 'product' || r.name === 'custom') {
      var p = r.name === 'product' ? Data.product(r.slug) : null;
      Form.bind({ mode: r.name === 'custom' ? 'custom' : 'product' });
      if (p) {
        var tiers = Data.tiers(p);
        U.$$('[data-tier]', main).forEach(function (b) {
          b.addEventListener('click', function () {
            var t = tiers.filter(function (x) { return String(x.n) === b.getAttribute('data-tier'); })[0];
            if (t) Form.prefill({ plan: t.name, product: p.Product_Name, category: t.inquiry });
          });
        });
      }
    }
  }

  /** Re-render after a background refresh, unless the visitor is mid-form. */
  function onDataUpdate() {
    var form = U.$('#lead-form');
    var dirty = form && U.$$('input[type=text],input[type=email],input[type=tel],textarea', form).some(function (i) { return i.value && !i.readOnly && i.id !== 'f-website'; });
    if (dirty) { renderSidebar(); return; }
    render(true);
  }

  /* ---------------------------- boot ---------------------------- */

  function boot() {
    main = document.getElementById('main');
    side = document.getElementById('sidebar');
    overlay = document.getElementById('overlay');

    document.getElementById('menu-btn').addEventListener('click', function () {
      if (window.matchMedia('(min-width: 960px)').matches) document.body.classList.toggle('side-collapsed');
      else openDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    side.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a.nav-link, a.brand')) closeDrawer(); });

    window.addEventListener('hashchange', function () { closeDrawer(); render(false); });

    Data.load(onDataUpdate).then(function () {
      render(false);
      document.body.classList.remove('loading');
    }).catch(function () {
      main.innerHTML = '<div class="page"><section class="phero"><h1>ProEase Labs</h1><p class="lead">We couldn\'t load the page content. Check your connection and refresh.</p></section></div>';
      document.body.classList.remove('loading');
    });

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
