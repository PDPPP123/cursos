// Service worker do app Cursos: cache-first para funcionar 100% offline.
// Ao publicar uma nova versão, aumente o número abaixo para o cache ser renovado.
const VERSAO = 'cursos-v2';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

// Instalação: guarda os arquivos do app
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

// Ativação: apaga caches de versões antigas (inclusive do antigo "MeuFlix")
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO && /^(cursos|meuflix)-/.test(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Busca: primeiro o cache, depois a rede. Os vídeos não passam por aqui (vêm do OPFS via blob:).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSAO);
    const salvo = await cache.match(req, { ignoreSearch: true });
    if (salvo) return salvo;
    try {
      const resp = await fetch(req);
      if (resp.ok && resp.type === 'basic') cache.put(req, resp.clone());
      return resp;
    } catch (err) {
      // Sem rede: qualquer navegação abre o app
      if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
