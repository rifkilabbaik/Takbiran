/* Takbiran service worker.
   Shell aplikasi: cache-first (cepat & jalan tanpa sinyal).
   Pustaka ekspor CDN: stale-while-revalidate — inilah yang membuat ekspor
   PDF/Excel tetap bisa di outlet tanpa internet.
   Apps Script: tidak pernah di-cache; kegagalan diurus antrean di aplikasi. */
var VERSION = 'tkb-v2.0.0';
var SHELL = VERSION + '-shell';
var LIBS = VERSION + '-libs';

var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/data.js',
  './js/store.js',
  './js/sync.js',
  './js/charts.js',
  './js/export.js',
  './js/app.js',
  './icons/icon-32.png',
  './icons/icon-152.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

var CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    Promise.all([
      caches.open(SHELL).then(function (c) { return c.addAll(APP_SHELL); }),
      // Pustaka besar: gagal unduh tidak boleh menggagalkan instalasi.
      caches.open(LIBS).then(function (c) {
        return Promise.all(CDN.map(function (u) {
          return c.add(new Request(u, { mode: 'cors' })).catch(function () {});
        }));
      })
    ]).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf(VERSION) !== 0;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // Data spreadsheet selalu langsung ke jaringan.
  if (url.hostname.indexOf('script.google') >= 0 || url.hostname.indexOf('googleusercontent') >= 0) return;

  if (CDN.indexOf(req.url) >= 0) {
    e.respondWith(
      caches.open(LIBS).then(function (cache) {
        return cache.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navigasi: jaringan dulu supaya versi baru cepat terpakai, jatuh ke cache saat offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (m) { return m || caches.match('./'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(SHELL).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
