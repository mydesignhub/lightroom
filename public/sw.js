// កំណត់ឈ្មោះ និងជំនាន់នៃ Cache (Versioning)
// រាល់ពេលបងកែ App ធំៗ បងគ្រាន់តែប្តូរ v1 ទៅ v2 នោះទូរស័ព្ទអ្នកប្រើនឹង Update កូដថ្មីភ្លាម
const CACHE_NAME = 'lightroom-master-v2';

// ឯកសារសំខាន់ៗដែលត្រូវ Cache ទុកជាមុន (Precaching)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  // បើសិនបងមាន Font ឬ CSS ក្នុង folder public អាចថែមនៅទីនេះ
];

// ១. វគ្គ Install: រៀបចំទាញយកឯកសារគោលទុកក្នុងម៉ាស៊ីន
self.addEventListener('install', (event) => {
  self.skipWaiting(); // បង្ខំឱ្យ Service Worker ថ្មីដើរភ្លាមៗ
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// ២. វគ្គ Activate: សម្អាត Cache ចាស់ៗចោល (ការពារកុំឱ្យ App ដើរកូដចាស់ហួសសម័យ)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => caches.delete(name))
      );
    })
  );
});

// ៣. វគ្គ Fetch: បច្ចេកទេសឆ្លាតវៃក្នុងការទាញយកទិន្នន័យ
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ប្រសិនបើជាការទាញរូបភាពពី Unsplash ឬរូបភាពក្នុង App
  // យើងប្រើក្បួន "Cache First" (យកពីម៉ាស៊ីនមុន បើគ្មានសឹមប្រើ Internet)
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // រក្សាទុករូបភាពដែលទើបទាញបាន ទុកប្រើ Offline លើកក្រោយ
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // សម្រាប់ឯកសារផ្សេងៗ (HTML, JS): ប្រើក្បួន Stale-while-revalidate
  // គឺបង្ហាញរបស់ពី Cache ភ្លាមៗ តែលួចទៅ Update ពី Network នៅខាងក្រោយ
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
      return cachedResponse || fetchPromise;
    })
  );
});