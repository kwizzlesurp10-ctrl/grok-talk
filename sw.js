const CACHE_NAME = 'fusionpanda-v4.3.1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/fusionpanda.webmanifest',
  '/icon.svg',
  // Arena assets
  '/assets/arena/arena-bg.jpg',
  '/assets/arena/fusion-panda.jpg',
  '/assets/arena/fusion-panda-victory-keyframe.jpg',
  '/assets/arena/opponent-void-howler.jpg',
  '/assets/arena/opponent-chroma-lynx.jpg',
  '/assets/arena/opponent-prompt-colossus.jpg',
  '/assets/arena/opponent-entropy-hare.jpg',
  '/assets/arena/opponent-fractal-fox.jpg',
  '/assets/arena/opponent-nexus-bear.jpg',
  // Base pandas
  '/assets/pandas/classic_panda.jpg',
  '/assets/pandas/crystal_panda.jpg',
  '/assets/pandas/frostbite_panda.jpg',
  '/assets/pandas/golden_fortune.jpg',
  '/assets/pandas/inferno_panda.jpg',
  '/assets/pandas/mystic_panda.jpg',
  '/assets/pandas/red_panda.jpg',
  '/assets/pandas/shadow_panda.jpg',
  '/assets/pandas/thunder_panda.jpg',
  // Fused hybrids
  '/assets/pandas/fusion_bamboo.jpg',
  '/assets/pandas/fusion_bamboo_evolved.jpg',
  '/assets/pandas/fusion_celestial.jpg',
  '/assets/pandas/fusion_celestial_evolved.jpg',
  '/assets/pandas/fusion_chaos.jpg',
  '/assets/pandas/fusion_chaos_evolved.jpg',
  '/assets/pandas/fusion_eclipse.jpg',
  '/assets/pandas/fusion_eclipse_evolved.jpg',
  '/assets/pandas/fusion_frost.jpg',
  '/assets/pandas/fusion_frost_evolved.jpg',
  '/assets/pandas/fusion_inferno.jpg',
  '/assets/pandas/fusion_inferno_evolved.jpg',
  '/assets/pandas/fusion_nebula.jpg',
  '/assets/pandas/fusion_nebula_evolved.jpg',
  '/assets/pandas/fusion_plasma.jpg',
  '/assets/pandas/fusion_plasma_evolved.jpg',
  '/assets/pandas/fusion_quantum.jpg',
  '/assets/pandas/fusion_quantum_evolved.jpg',
  '/assets/pandas/fusion_solar.jpg',
  '/assets/pandas/fusion_solar_evolved.jpg',
  '/assets/pandas/fusion_void.jpg',
  '/assets/pandas/fusion_void_evolved.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
