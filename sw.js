const CACHE_NAME = 'buscador-anime-v1';

// Arquivos locais indispensáveis para o funcionamento offline da aplicação
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

// ==========================================================================
// 1. INSTALAÇÃO: Armazena a estrutura estática no cache
// ==========================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Armazenando arquivos estáticos no cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ==========================================================================
// 2. ATIVAÇÃO: Remove versões antigas do cache para manter a app atualizada
// ==========================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deletando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ==========================================================================
// 3. REQUISIÇÕES (FETCH): Estratégia Cache First com fallback para a Rede
// ==========================================================================
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam do tipo GET ou que venham de extensões
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna a versão em cache se existir
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não estiver no cache, busca na rede
      return fetch(event.request).catch(() => {
        // Fallback offline: se falhar a rede e for navegação de página, carrega a index
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
