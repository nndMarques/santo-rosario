// Guarda o app para funcionar sem internet (ex.: dentro da igreja).
const CACHE = 'terco-v7';
const ARQUIVOS = [
  './', 'index.html', 'css/style.css', 'js/app.js', 'js/data/terco.js', 'js/rosario.js', 'js/contagem.js', 'js/config.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Rede primeiro (para receber atualizações), cache quando estiver offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});

// Tocar no aviso de oração abre o Lumen no terço.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => {
    const c = cs.find((x) => 'focus' in x);
    const url = (e.notification.data && e.notification.data.url) || './#/terco';
    if (c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});

// Aviso enviado pelo servidor (Web Push), mesmo com o app fechado.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.titulo || 'Hora do terço', {
    body: d.corpo || 'Um momento de oração com o Lumen.',
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'terco-lembrete', data: { url: d.url || './#/terco' },
  }));
});
