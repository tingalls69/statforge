const CACHE = 'ascendry-alpha-v0.1.3';
const ASSETS = [
  './', './index.html?v=0.1.3', './css/styles.css?v=0.1.3', './css/alpha.css?v=0.1.3', './css/alpha-workout.css?v=0.1.3',
  './js/data.js?v=0.1.3', './js/storage.js?v=0.1.3', './js/combat.js?v=0.1.3', './js/alpha-exercises.js?v=0.1.3',
  './js/alpha-onboarding-tools.js?v=0.1.3', './js/alpha-generator.js?v=0.1.3', './js/alpha-workout-core.js?v=0.1.3',
  './js/alpha-runner.js?v=0.1.3', './js/alpha-upgrade.js?v=0.1.3', './js/alpha.js?v=0.1.3', './js/app.js',
  './manifest.webmanifest?v=0.1.3', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/icons/logo.svg', './vendor/zxing-library.min.js', './vendor/zxing-browser.min.js',
  './assets/exercises/pushup.svg', './assets/exercises/plank.svg', './assets/exercises/rower.svg',
  './assets/exercises/chest_press.svg', './assets/exercises/seated_row.svg', './assets/exercises/lat_pulldown.svg',
  './assets/exercises/leg_press.svg', './assets/exercises/leg_curl.svg', './assets/exercises/leg_extension.svg',
  './assets/exercises/face_pull.svg', './assets/exercises/shoulder_press.svg', './assets/exercises/farmer_carry.svg',
  './assets/exercises/step_up.svg', './assets/exercises/calf_raise.svg', './assets/exercises/pallof.svg',
  './assets/exercises/side_plank.svg', './assets/exercises/dead_bug.svg', './assets/exercises/bird_dog.svg',
  './assets/exercises/walk.svg', './assets/exercises/chair_stand.svg', './assets/exercises/wall_sit.svg',
  './assets/exercises/balance.svg', './assets/exercises/march.svg',
  './assets/enemies/giant-rat.svg', './assets/enemies/goblin-minion.svg', './assets/enemies/wolf.svg',
  './assets/enemies/skeleton.svg', './assets/enemies/goblin-warrior.svg', './assets/enemies/dire-wolf.svg',
  './assets/enemies/goblin-boss.svg', './assets/enemies/minotaur-skeleton.svg', './assets/enemies/ogre.svg',
  './assets/enemies/giant-scorpion.svg', './assets/enemies/red-dragon-wyrmling.svg', './assets/enemies/troll.svg',
  './assets/enemies/young-red-dragon.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('openfoodfacts.org')) {
    event.respondWith(fetch(event.request).catch(() => new Response(JSON.stringify({ status: 0 }), { headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, clone));
      return response;
    }).catch(() => caches.match('./index.html?v=0.1.3') || caches.match('./index.html')))
  );
});
