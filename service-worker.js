const CACHE_NAME = 'restaurant-cache-v1';
const urlsToCache = [
    '/menu.json',
    '/moim_logo.png',
    '/detailedmenu.html',
    '/main.html',
    '/mainmenu.html',
    '/notification.mp3',
    '/onboarding.html',
    '/ordersummary.html',
    '/recommendation.html',
    '/service-worker.js',
    '/staff.html',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method === 'POST' || request.url.startsWith('chrome-extension')) {
        return; // Skip caching POST requests and chrome-extension URLs
    }

    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response; // Return cached response if found
            }
            return fetch(request).then(fetchResponse => {
                if (request.method === 'GET' && fetchResponse.status === 200) {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, fetchResponse.clone());
                        return fetchResponse;
                    });
                }
                return fetchResponse;
            });
        }).catch(() => caches.match('/mainmenu.html')) // Fallback to offline page if available
    );
});
