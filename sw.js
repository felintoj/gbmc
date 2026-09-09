// v2 — página sempre busca a versão nova quando há sinal; sem sinal, usa o cache.
const CACHE = "gbmc-v3";
const ARQUIVOS = ["./","./index.html","./brasao.png","./manifest.webmanifest","./icone-192.png","./icone-512.png","./apple-touch-icon.png","./favicon.ico","./favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const ehPagina = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html") || url.pathname.endsWith("sw.js");
  if (ehPagina){
    // rede primeiro: atualizações chegam sem precisar reinstalar o ícone
    e.respondWith(
      fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request).then(h => h || caches.match("./index.html")))
    );
  } else {
    e.respondWith(caches.match(e.request).then(h => h || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; })));
  }
});
