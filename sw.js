/* healthLog - 앱 설치(PWA) 서비스워커 */
var CACHE = 'healthlog-v1';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
    .catch(function(){}).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
/* 네트워크 우선 — 항상 최신 코드를 받고, 오프라인일 때만 캐시로 연다 */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== location.origin) return;   /* Firebase 등 외부는 손대지 않음 */
  e.respondWith(
    fetch(req).then(function(res){
      var cp = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, cp); });
      return res;
    }).catch(function(){
      return caches.match(req).then(function(r){ return r || caches.match('./index.html'); });
    })
  );
});
