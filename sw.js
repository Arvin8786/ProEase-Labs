/*
 * ProEase Labs service worker.
 *  - App shell (HTML/CSS/JS/icons/fallback JSON): stale-while-revalidate, so repeat visits are instant and updates arrive on the next load.
 *  - Google Sheets / Apps Script traffic: never touched here. data.js owns that cache (localStorage) so product data stays fresh.
 * All paths are relative to the worker's own location, so it works on /repo-name/ (GitHub Pages) and / (Render) unchanged.
 * Bump VERSION when you ship a breaking change to force old caches out.
 */
var VERSION = 'v1';
var CACHE = 'proease-shell-' + VERSION;
var SHELL = [
  './', './index.html', './manifest.json',
  './assets/css/app.css',
  './assets/js/config.js', './assets/js/util.js', './assets/js/icons.js', './assets/js/data.js',
  './assets/js/form.js', './assets/js/views.js', './assets/js/app.js',
  './assets/data/fallback.json',
  './assets/img/icon.svg', './assets/img/icon-192.png', './assets/img/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // addAll is all-or-nothing; add individually so one missing file can't block install.
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('proease-shell-') === 0 && k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // leave Google (and everything cross-origin) alone

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () { return caches.match('./index.html'); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
