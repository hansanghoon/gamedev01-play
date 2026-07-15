// 스티커 플래닛 서비스 워커 — 인터넷이 안 될 때도 앱이 열리게 함.
// 전략(network-first): 항상 인터넷에서 최신 파일을 먼저 받아서 업데이트가 바로 반영되고,
// 실패하면(오프라인) 마지막으로 받아둔 복사본을 보여준다. (기록 데이터는 폰 안에 있어서 원래 오프라인 OK)
const CACHE = 'sticker-planet-v1';
const CORE = [
  'sticker-planet.html',
  'sticker-sprites.js',
  'pixel-art.js',
  'sticker-planet.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        const copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      })
      .catch(function () { return caches.match(e.request); })
  );
});
