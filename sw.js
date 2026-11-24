// Guarda só a casca (esta página e os ícones) para o app abrir rápido.
// Os dados da loja NÃO passam por aqui: ficam no Caderno da loja de cada MEI, no Google.
var VERSAO = 'casca-v1';
var ARQUIVOS = ['./', './index.html', './manifest.webmanifest',
  './icones/icone-192.png', './icones/icone-512.png', './icones/icone-maskable-512.png', './icones/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== VERSAO; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // Google segue direto pela internet
  // Rede primeiro (pega atualizações); sem internet, usa a cópia guardada.
  e.respondWith(fetch(e.request).then(function (r) {
    var copia = r.clone(); caches.open(VERSAO).then(function (c) { c.put(e.request, copia); });
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); });
  }));
});
