/**
 * ProEase Labs portal - the ONLY file you normally need to edit.
 * Everything else (copy, products, pricing, links) comes from the Google Sheet.
 */
window.PROEASE_CONFIG = {
  // Paste your Apps Script Web App URL here (ends with /exec).
  // Leave blank to run on the built-in sample content (forms fall back to WhatsApp).
  API_URL: '',

  // Bundled sample content, used on first load and whenever the sheet is unreachable.
  FALLBACK_URL: './assets/data/fallback.json',

  // localStorage cache. Cached content shows instantly; fresh content swaps in behind it.
  CACHE_KEY: 'proease_cms_v1',
  CACHE_MAX_AGE_MS: 10 * 60 * 1000,   // re-check the sheet at most every 10 minutes
  FETCH_TIMEOUT_MS: 12000
};
