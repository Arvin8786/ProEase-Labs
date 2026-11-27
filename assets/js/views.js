/* Page renderers. Each returns an HTML string; app.js injects it and then calls the bind hook. */
(function () {
  var esc = U.esc;

  function statusClass(s) {
    s = String(s || '').toLowerCase();
    if (/flagship/.test(s)) return 'b-flag';
    if (/production|ready/.test(s)) return 'b-prod';
    if (/prototype/.test(s)) return 'b-proto';
    if (/soon/.test(s)) return 'b-soon';
    return 'b-neutral';
  }
  function statusBadge(s) { return s ? '<span class="badge ' + statusClass(s) + '">' + esc(s) + '</span>' : ''; }

  function productIcon(p, big) {
    var url = U.safeUrl(p.Hero_Image_URL);
    var color = /^#[0-9a-f]{3,8}$/i.test(p.Accent_Color || '') ? p.Accent_Color : '#0891b2';
    var inner = url && !/^#/.test(url) ?
      '<img src="' + esc(url) + '" alt="" loading="lazy" decoding="async">' : icon(p.Icon || 'box');
    return '<span class="pico' + (big ? ' big' : '') + '" style="--accent:' + color + '">' + inner + '</span>';
  }

  function btnLink(href, label, cls) {
    var ext = U.isExternal(href);
    return '<a class="btn ' + cls + '" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
  }

  /* ------------------------------ HOME ------------------------------ */

  function productCard(p, featured) {
    var pill = (p.Sidebar_Pill && p.Sidebar_Pill !== p.Status) ? '<span class="pill">' + esc(p.Sidebar_Pill) + '</span>' : '';
    return '<a class="pcard' + (featured ? ' featured' : '') + '" href="#/product/' + esc(p.Slug) + '" style="--accent:' + esc(p.Accent_Color || '#0891b2') + '">' +
      '<div class="pcard-top">' + productIcon(p) + '<div class="pcard-badges">' + statusBadge(p.Status) + pill + '</div></div>' +
      '<h3>' + esc(p.Product_Name) + '</h3>' +
      '<p class="pcard-tag">' + esc(p.Tagline) + '</p>' +
      '<p class="pcard-desc">' + esc(p.Short_Description) + '</p>' +
      '<span class="pcard-link">' + (featured ? 'See the full suite' : 'View details') + icon('arrow') + '</span></a>';
  }

  function comparison() {
    var cols = U.list(Data.co('comparison_columns'));
    var rows = U.list(Data.co('comparison_rows')).map(function (r) { return r.split('::').map(function (x) { return x.trim(); }); });
    if (cols.length < 3 || !rows.length) return '';
    var head = '<thead><tr><th scope="col">What matters</th>' + cols.map(function (c, i) {
      return '<th scope="col"' + (i === 2 ? ' class="us"' : '') + '>' + esc(c) + '</th>';
    }).join('') + '</tr></thead>';
    var body = '<tbody>' + rows.map(function (r) {
      return '<tr><th scope="row">' + esc(r[0]) + '</th>' + [1, 2, 3].map(function (i) {
        return '<td' + (i === 3 ? ' class="us"' : '') + '>' + esc(r[i] || '') + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';
    var cards = rows.map(function (r) {
      return '<div class="cmp-card"><h4>' + esc(r[0]) + '</h4>' + [1, 2, 3].map(function (i) {
        return '<div class="cmp-line' + (i === 3 ? ' us' : '') + '"><span>' + esc(cols[i - 1]) + '</span><p>' + esc(r[i] || '') + '</p></div>';
      }).join('') + '</div>';
    }).join('');
    return '<section class="section"><div class="section-head"><h2>' + esc(Data.co('comparison_heading')) + '</h2></div>' +
      '<div class="cmp-table-wrap"><table class="cmp-table">' + head + body + '</table></div>' +
      '<div class="cmp-cards">' + cards + '</div></section>';
  }

  function home() {
    var co = Data.co;
    var suite = Data.suite(), apps = Data.apps();
    var stats = U.list(co('stats')).map(U.pair);
    var dna = U.pairs(co('dna_points'));
    var services = U.pairs(co('custom_services'));

    var flagship = suite.filter(function (p) { return /flagship/i.test(p.Status); })[0] || suite[0];
    var rest = suite.filter(function (p) { return p !== flagship; });

    var h = '<section class="hero"><img class="hero-art" src="./assets/img/hero-art.jpg" alt="" width="460" height="1000" decoding="async">' +
      '<span class="eyebrow">' + esc(co('hero_eyebrow')) + '</span>' +
      '<h1>' + esc(co('hero_headline')) + '</h1>' +
      '<p class="lead">' + esc(co('hero_subheadline')) + '</p>' +
      '<div class="hero-cta">' +
      (co('hero_primary_cta') ? btnLink(U.safeUrl(co('hero_primary_link')) || '#/', esc(co('hero_primary_cta')) + icon('arrow'), 'btn-primary btn-lg') : '') +
      (co('hero_secondary_cta') ? btnLink(U.safeUrl(co('hero_secondary_link')) || '#/custom-build', esc(co('hero_secondary_cta')), 'btn-ghost btn-lg') : '') +
      '</div>' +
      (co('hero_trust_line') ? '<p class="trust">' + icon('shield') + esc(co('hero_trust_line')) + '</p>' : '') +
      '</section>';

    if (stats.length) {
      h += '<section class="stats">' + stats.map(function (s) {
        return '<div class="stat"><strong>' + esc(s.title) + '</strong><span>' + esc(s.desc) + '</span></div>';
      }).join('') + '</section>';
    }

    if (suite.length) {
      h += '<section class="section" id="suite"><div class="section-head"><h2>' + esc(co('suite_heading')) + '</h2><p>' + esc(co('suite_intro')) + '</p></div>' +
        '<div class="suite-grid">' + (flagship ? productCard(flagship, true) : '') +
        '<div class="suite-side">' + rest.map(function (p) { return productCard(p); }).join('') + '</div></div></section>';
    }

    if (dna.length) {
      h += '<section class="section dna"><div class="section-head"><h2>' + esc(co('dna_heading')) + '</h2><p>' + esc(co('dna_intro')) + '</p></div>' +
        '<div class="dna-grid">' + dna.map(function (d) {
          return '<div class="dna-item">' + icon('check') + '<div><h4>' + esc(d.title) + '</h4><p>' + esc(d.desc) + '</p></div></div>';
        }).join('') + '</div></section>';
    }

    h += comparison();

    if (apps.length) {
      h += '<section class="section" id="apps"><div class="section-head"><h2>' + esc(co('apps_heading')) + '</h2><p>' + esc(co('apps_intro')) + '</p></div>' +
        '<div class="apps-grid">' + apps.map(function (p) { return productCard(p); }).join('') + '</div></section>';
    }

    h += '<section class="section cta-band"><div><h2>' + esc(co('custom_heading')) + '</h2><p>' + esc(co('custom_summary')) + '</p>' +
      (services.length ? '<ul class="chips">' + services.map(function (s) { return '<li>' + esc(s.title) + '</li>'; }).join('') + '</ul>' : '') +
      '</div><div class="cta-actions"><a class="btn btn-light btn-lg" href="#/custom-build">Request Custom Build' + icon('arrow') + '</a>' +
      (Data.whatsapp() ? '<a class="btn btn-ghost-light btn-lg" href="' + esc(Data.whatsapp()) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'Chat on WhatsApp</a>' : '') +
      '</div></section>';

    return h;
  }

  /* ------------------------------ PRODUCT ------------------------------ */

  function pricing(p, tiers) {
    if (!tiers.length) return '';
    var featIdx = -1;
    tiers.forEach(function (t, i) { if (/popular|best|recommended/i.test(t.badge) && featIdx < 0) featIdx = i; });
    return '<section class="section" id="pricing"><div class="section-head"><h2>' +
      (/subscription|one-time/i.test(p.Monetization_Model) ? 'Plans & pricing' : 'Pricing & licensing') + '</h2>' +
      (p.Pricing_Note ? '<p>' + esc(p.Pricing_Note) + '</p>' : '') + '</div>' +
      '<div class="tiers n' + tiers.length + '">' + tiers.map(function (t, i) {
        var direct = !!t.url;
        var ext = U.isExternal(t.url);
        var cta = direct
          ? '<a class="btn ' + (i === featIdx ? 'btn-primary' : 'btn-outline') + ' btn-block" href="' + esc(t.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(t.cta) + (ext ? icon('external') : icon('arrow')) + '</a>'
          : '<button type="button" class="btn ' + (i === featIdx ? 'btn-primary' : 'btn-outline') + ' btn-block" data-tier="' + t.n + '">' + esc(t.cta) + '</button>';
        return '<article class="tier' + (i === featIdx ? ' hot' : '') + '">' +
          (t.badge ? '<span class="tier-badge">' + esc(t.badge) + '</span>' : '') +
          '<h3>' + esc(t.name) + '</h3>' +
          '<div class="price">' + esc(t.price) + '</div>' +
          (t.billing ? '<div class="billing">' + esc(t.billing) + '</div>' : '') +
          '<ul>' + t.features.map(function (f) { return '<li>' + icon('check') + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' +
          cta + '</article>';
      }).join('') + '</div></section>';
  }

  function bundleBreakdown(p) {
    var items = U.pairs(p.Bundle_Components);
    if (!items.length) return '';
    var icons = ['package', 'users', 'mail', 'lock'];
    var tone = ['t1', 't2', 't3', 't4'];
    return '<section class="section"><div class="section-head"><h2>What\'s inside the bundle</h2>' +
      '<p>Four layers sharing one database, so a receipt, a leave request and a memo all live in the same audit trail.</p></div>' +
      '<div class="bundle">' + items.map(function (b, i) {
        return '<div class="bundle-item ' + (tone[i % 4]) + '"><span class="bi-ic">' + icon(icons[i % 4]) + '</span><h3>' + esc(b.title) + '</h3><p>' + esc(b.desc) + '</p></div>' +
          (i < items.length - 1 ? '<span class="bundle-plus" aria-hidden="true">+</span>' : '');
      }).join('') + '</div></section>';
  }

  function product(slug) {
    var p = Data.product(slug);
    if (!p) return notFound();
    var tiers = Data.tiers(p);
    var soon = /soon/i.test(p.Status);
    var security = U.pairs(p.Database_Security);
    var steps = U.pairs(p.How_It_Works);
    var benefits = U.pairs(p.Key_Benefits);
    var inquiryDefault = p.Default_Inquiry_Type || Data.categories()[0];
    var waText = 'Hi ProEase Labs, I\'d like to know more about ' + p.Product_Name + '.';

    var h = '<section class="phero" style="--accent:' + esc(p.Accent_Color || '#0891b2') + '">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">ProEase Labs</a><span>/</span><span>' + esc(p.Category) + '</span></nav>' +
      '<div class="phero-row">' + productIcon(p, true) + '<div>' +
      '<div class="badges">' + statusBadge(p.Status) + (p.Monetization_Model ? '<span class="badge b-neutral">' + esc(p.Monetization_Model) + '</span>' : '') + '</div>' +
      '<h1>' + esc(p.Product_Name) + '</h1><p class="lead">' + esc(p.Tagline) + '</p></div></div>' +
      (p.Value_Highlight ? '<div class="value-banner">' + icon('sparkles') + '<span>' + esc(p.Value_Highlight) + '</span></div>' : '') +
      '<div class="hero-cta">' +
      (tiers.length && !soon ? '<button type="button" class="btn btn-primary btn-lg" data-scroll="pricing">View Pricing' + icon('arrow') + '</button>' : '') +
      '<button type="button" class="btn ' + (tiers.length && !soon ? 'btn-ghost' : 'btn-primary') + ' btn-lg" data-scroll="enquire">' + esc(soon ? 'Notify Me' : (p.Primary_CTA_Label || 'Enquire')) + '</button>' +
      (Data.whatsapp(waText) ? '<a class="btn btn-wa btn-lg" href="' + esc(Data.whatsapp(waText)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'WhatsApp</a>' : '') +
      '</div></section>';

    var about = '';
    if (p.Overview) about += '<div class="prose-card"><h2>Overview</h2><p>' + esc(p.Overview) + '</p></div>';
    if (p.Why_Switch) about += '<div class="prose-card"><h2>Why switch</h2><p>' + esc(p.Why_Switch) + '</p></div>';
    if (p.Customization) about += '<div class="prose-card"><h2>Customisation</h2><p>' + esc(p.Customization) + '</p></div>';
    if (about) h += '<section class="section prose-grid">' + about + '</section>';

    h += bundleBreakdown(p);

    if (security.length) {
      h += '<section class="section"><div class="section-head"><h2>Database &amp; security</h2>' +
        '<p>Your data sits in its own database, and access is gated twice — by where staff are, and by what device they use.</p></div>' +
        '<div class="sec-grid">' + security.map(function (s) {
          return '<div class="sec-item"><span class="sec-ic">' + icon(iconForTitle(s.title)) + '</span><div><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div></div>';
        }).join('') + '</div></section>';
    }

    if (steps.length) {
      h += '<section class="section"><div class="section-head"><h2>How it works</h2></div><ol class="steps n' + steps.length + '">' +
        steps.map(function (s, i) {
          return '<li><span class="step-n">' + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></li>';
        }).join('') + '</ol></section>';
    }

    if (benefits.length) {
      h += '<section class="section"><div class="section-head"><h2>Key benefits</h2></div><div class="ben-grid">' +
        benefits.map(function (b) {
          return '<div class="ben">' + icon('check') + '<h3>' + esc(b.title) + '</h3><p>' + esc(b.desc) + '</p></div>';
        }).join('') + '</div></section>';
    }

    if (!soon) h += pricing(p, tiers);

    h += Form.html({
      mode: 'product', product: p.Product_Name, category: inquiryDefault, waText: waText,
      heading: soon ? 'Get notified at launch' : 'Enquire about ' + p.Product_Name,
      intro: /suite/i.test(p.Category) ? 'Tell us about your business and we\'ll scope your setup, database and workflows.' : 'Questions, a demo, or ready to start? Send a note and we\'ll get back to you.'
    });
    return h;
  }

  /* ------------------------------ CUSTOM BUILD ------------------------------ */

  function custom() {
    var co = Data.co;
    var services = U.pairs(co('custom_services'));
    var steps = U.pairs(co('custom_process'));
    var h = '<section class="phero" style="--accent:#0891b2"><nav class="crumbs"><a href="#/">ProEase Labs</a><span>/</span><span>Services</span></nav>' +
      '<h1>' + esc(co('custom_heading', 'Custom software, built on request')) + '</h1>' +
      '<p class="lead">' + esc(co('custom_summary')) + '</p>' +
      '<div class="hero-cta"><button type="button" class="btn btn-primary btn-lg" data-scroll="enquire">Request Custom Build' + icon('arrow') + '</button>' +
      (Data.whatsapp('Hi ProEase Labs, I\'d like to discuss a custom software project.') ? '<a class="btn btn-wa btn-lg" href="' + esc(Data.whatsapp('Hi ProEase Labs, I\'d like to discuss a custom software project.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'WhatsApp</a>' : '') +
      '</div></section>';

    if (services.length) {
      h += '<section class="section"><div class="section-head"><h2>What we build</h2></div><div class="ben-grid">' +
        services.map(function (s) { return '<div class="ben">' + icon('wrench') + '<h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div>'; }).join('') + '</div></section>';
    }
    if (steps.length) {
      h += '<section class="section"><div class="section-head"><h2>How a project runs</h2></div><ol class="steps n' + steps.length + '">' +
        steps.map(function (s, i) { return '<li><span class="step-n">' + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></li>'; }).join('') + '</ol></section>';
    }
    h += Form.html({
      mode: 'custom', product: 'Custom Project', category: 'Custom Software Build',
      waText: 'Hi ProEase Labs, I\'d like to discuss a custom software project.',
      heading: 'Tell us what you need built',
      intro: 'A few details are enough to start. We\'ll come back with questions or a proposed scope.'
    });
    return h;
  }

  function notFound() {
    return '<section class="phero"><h1>Page not found</h1><p class="lead">That product or page doesn\'t exist (or has been hidden).</p>' +
      '<div class="hero-cta"><a class="btn btn-primary btn-lg" href="#/">Back to ProEase Labs</a></div></section>';
  }

  window.Views = { home: home, product: product, custom: custom, notFound: notFound };
})();
