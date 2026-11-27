/**
 * ProEase Labs - Google Sheets Headless CMS + Lead Capture
 * ---------------------------------------------------------
 * Paste this file (Code.gs) and Seed.gs into Extensions > Apps Script of the
 * Google Sheet that powers the portal, then:
 *   1. Run setupSheets() once (creates the 3 tabs and fills sample rows).
 *   2. Deploy > New deployment > Web app
 *        Execute as: Me      Who has access: Anyone
 *   3. Copy the /exec URL into assets/js/config.js (API_URL).
 *
 *   GET  {url}               -> { ok, company, products, inquiryCategories, updatedAt }
 *   GET  {url}?fresh=1       -> same, bypassing the server cache
 *   GET  {url}?action=ping   -> { ok:true }
 *   POST {url}  body = JSON (Content-Type: text/plain) -> saves a row to Enquiries_&_Requests
 *
 * Only public commercial content lives in this sheet. No product source code,
 * credentials or private repository details should ever be placed here.
 */

var CONFIG = {
  // Leave blank when the script is bound to the sheet (recommended).
  SPREADSHEET_ID: '',
  TAB_COMPANY: 'Company_Profile',
  TAB_PRODUCTS: 'Products',
  TAB_ENQUIRIES: 'Enquiries_&_Requests',
  CACHE_KEY: 'proease_cms_v1',
  CACHE_SECONDS: 300,            // 5 min server cache; cleared automatically on edit
  NOTIFY_EMAIL: '',              // optional: email address to alert on every new enquiry
  MAX_FIELD_LENGTH: 4000,
  DUPLICATE_WINDOW_SECONDS: 30   // same email + same category within this window is ignored
};

/* ============================== HTTP ============================== */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'ping') return json_({ ok: true, time: new Date().toISOString() });
    var data = getCms_(p.fresh === '1');
    return json_(data);
  } catch (err) {
    return json_({ ok: false, error: 'CMS_READ_FAILED', message: String(err && err.message || err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = parseBody_(e);

    // Honeypot: real visitors never fill the hidden "website" field.
    if (body.website) return json_({ ok: true, reference: 'PEL-OK' });

    var lead = cleanLead_(body);
    var problems = validateLead_(lead);
    if (problems.length) return json_({ ok: false, error: 'VALIDATION', fields: problems });

    var cache = CacheService.getScriptCache();
    var dupKey = 'dup_' + Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, (lead.email || lead.phone) + '|' + lead.category + '|' + lead.product)
    );
    var dupRef = cache.get(dupKey);
    if (dupRef) return json_({ ok: true, reference: dupRef, duplicate: true });

    lock.waitLock(10000);
    var sheet = getOrCreateTab_(CONFIG.TAB_ENQUIRIES, SEED.enquiryHeaders);
    var reference = makeReference_();
    var now = new Date();

    var record = {
      Timestamp: now,
      Reference: reference,
      Name: lead.name,
      Company: lead.company,
      Email: lead.email,
      Phone_WhatsApp: lead.phone,
      Inquiry_Category: lead.category,
      Selected_Product: lead.product,
      Selected_Plan: lead.plan,
      Budget: lead.budget,
      Timeline: lead.timeline,
      Message_Requirements: lead.message,
      Source_Page: lead.page,
      Referrer: lead.referrer,
      UTM: lead.utm,
      User_Agent: lead.userAgent,
      Status: 'New',
      Follow_Up_Notes: ''
    };

    // Write by header name so columns can be re-ordered or added in the sheet.
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headers.map(function (h) {
      var v = record.hasOwnProperty(h) ? record[h] : '';
      return (v instanceof Date) ? v : safeCell_(v);
    });
    sheet.appendRow(row);
    lock.releaseLock();

    cache.put(dupKey, reference, CONFIG.DUPLICATE_WINDOW_SECONDS);
    notify_(record);

    return json_({ ok: true, reference: reference });
  } catch (err) {
    try { lock.releaseLock(); } catch (ignore) {}
    return json_({ ok: false, error: 'SAVE_FAILED', message: String(err && err.message || err) });
  }
}

/* ============================== CMS READ ============================== */

function getCms_(fresh) {
  var cache = CacheService.getScriptCache();
  if (!fresh) {
    var hit = cache.get(CONFIG.CACHE_KEY);
    if (hit) { try { return JSON.parse(hit); } catch (ignore) {} }
  }

  var ss = ss_();
  var company = {};
  var cSheet = ss.getSheetByName(CONFIG.TAB_COMPANY);
  if (cSheet && cSheet.getLastRow() > 1) {
    cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 2).getDisplayValues().forEach(function (r) {
      var key = String(r[0] || '').trim();
      if (key) company[key] = String(r[1] == null ? '' : r[1]).trim();
    });
  }

  var products = [];
  var pSheet = ss.getSheetByName(CONFIG.TAB_PRODUCTS);
  if (pSheet && pSheet.getLastRow() > 1) {
    var values = pSheet.getDataRange().getDisplayValues();
    var headers = values.shift().map(function (h) { return String(h).trim(); });
    values.forEach(function (r) {
      var obj = {};
      headers.forEach(function (h, i) { if (h) obj[h] = String(r[i] == null ? '' : r[i]).trim(); });
      if (!obj.Slug || !obj.Product_Name) return;
      if (String(obj.Visible).toUpperCase() === 'FALSE') return;
      obj.Slug = slugify_(obj.Slug);
      products.push(obj);
    });
    products.sort(function (a, b) { return (Number(a.Sort_Order) || 999) - (Number(b.Sort_Order) || 999); });
  }

  var data = {
    ok: true,
    source: 'sheet',
    updatedAt: new Date().toISOString(),
    company: company,
    products: products,
    inquiryCategories: SEED.inquiryCategories
  };

  var str = JSON.stringify(data);
  if (str.length < 95000) cache.put(CONFIG.CACHE_KEY, str, CONFIG.CACHE_SECONDS); // CacheService limit is 100KB per key
  return data;
}

/** Simple trigger: any edit to the CMS tabs clears the server cache so changes go live quickly. */
function onEdit(e) {
  try {
    var name = e && e.range && e.range.getSheet().getName();
    if (name === CONFIG.TAB_COMPANY || name === CONFIG.TAB_PRODUCTS) clearCache();
  } catch (ignore) {}
}

/* ============================== SETUP & MENU ============================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('ProEase CMS')
    .addItem('1. Set up / repair tabs', 'setupSheets')
    .addItem('Clear website cache', 'clearCache')
    .addItem('Preview JSON (logs)', 'previewJson')
    .addToUi();
}

/**
 * Creates the 3 tabs if missing. Seeds sample rows ONLY into empty tabs,
 * so it is safe to run again later (it will never overwrite your content).
 */
function setupSheets() {
  var company = getOrCreateTab_(CONFIG.TAB_COMPANY, SEED.companyHeaders);
  if (company.getLastRow() < 2) {
    company.getRange(2, 1, SEED.company.length, 3).setValues(SEED.company);
  }
  company.setColumnWidth(1, 220).setColumnWidth(2, 640).setColumnWidth(3, 340);
  company.getRange('B:B').setWrap(true);

  var products = getOrCreateTab_(CONFIG.TAB_PRODUCTS, SEED.productHeaders);
  if (products.getLastRow() < 2) {
    products.getRange(2, 1, SEED.products.length, SEED.productHeaders.length).setValues(SEED.products);
  }
  products.setFrozenColumns(4);

  var enquiries = getOrCreateTab_(CONFIG.TAB_ENQUIRIES, SEED.enquiryHeaders);
  var statusCol = SEED.enquiryHeaders.indexOf('Status') + 1;
  if (statusCol > 0) {
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['New', 'Contacted', 'Demo Scheduled', 'Quoted', 'Won', 'Lost'], true)
      .setAllowInvalid(true).build();
    enquiries.getRange(2, statusCol, 1000, 1).setDataValidation(rule);
  }
  enquiries.getRange(2, 1, 1000, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');

  clearCache();
  try { SpreadsheetApp.getUi().alert('ProEase CMS is ready. Next: Deploy > New deployment > Web app.'); } catch (ignore) {}
}

function clearCache() {
  CacheService.getScriptCache().remove(CONFIG.CACHE_KEY);
}

function previewJson() {
  Logger.log(JSON.stringify(getCms_(true), null, 2));
}

/* ============================== HELPERS ============================== */

function ss_() {
  return CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateTab_(name, headers) {
  var ss = ss_();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#1e1b4b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } else {
    // Append any missing headers (never removes or reorders yours).
    var existing = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    var missing = headers.filter(function (h) { return existing.indexOf(h) === -1; });
    if (missing.length) {
      sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing])
        .setFontWeight('bold').setBackground('#1e1b4b').setFontColor('#ffffff');
    }
  }
  return sheet;
}

function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (ignore) {}
  }
  return (e && e.parameter) || {};
}

function cleanLead_(b) {
  function s(v, max) {
    v = (v == null ? '' : String(v)).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
    return v.slice(0, max || CONFIG.MAX_FIELD_LENGTH);
  }
  return {
    name: s(b.name, 120),
    company: s(b.company, 160),
    email: s(b.email, 160).toLowerCase(),
    phone: s(b.phone, 40),
    category: s(b.category, 80),
    product: s(b.product, 120) || 'Custom Project',
    plan: s(b.plan, 120),
    budget: s(b.budget, 80),
    timeline: s(b.timeline, 80),
    message: s(b.message),
    page: s(b.page, 300),
    referrer: s(b.referrer, 300),
    utm: s(b.utm, 300),
    userAgent: s(b.userAgent, 300)
  };
}

function validateLead_(l) {
  var errs = [];
  if (l.name.length < 2) errs.push('name');
  if (!l.email && !l.phone) errs.push('email');
  if (l.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l.email)) errs.push('email');
  if (l.phone && !/^[+\d][\d\s\-()]{6,}$/.test(l.phone)) errs.push('phone');
  if (SEED.inquiryCategories.indexOf(l.category) === -1) errs.push('category');
  return errs;
}

/** Prevents spreadsheet formula injection from form input. */
function safeCell_(v) {
  v = v == null ? '' : String(v);
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function makeReference_() {
  var d = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyMMdd');
  var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'PEL-' + d + '-' + rand;
}

function slugify_(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function notify_(r) {
  if (!CONFIG.NOTIFY_EMAIL) return;
  try {
    var lines = Object.keys(r).filter(function (k) { return r[k] && k !== 'User_Agent'; })
      .map(function (k) { return k.replace(/_/g, ' ') + ': ' + r[k]; });
    MailApp.sendEmail({
      to: CONFIG.NOTIFY_EMAIL,
      subject: '[ProEase Labs] ' + r.Inquiry_Category + ' — ' + r.Name + (r.Company ? ' (' + r.Company + ')' : ''),
      body: lines.join('\n'),
      replyTo: r.Email || undefined
    });
  } catch (ignore) {}
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
