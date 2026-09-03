const CACHE_NAME = "buscador-anime-v1";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) => Promise.all(
      chaves.filter((chave) => chave !== CACHE_NAME).map((chave) => caches.delete(chave))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;
  evento.respondWith(
    caches.match(evento.request).then((respostaEmCache) =>
      respostaEmCache || fetch(evento.request).catch(() => caches.match("./index.html"))
    )
  );
});
