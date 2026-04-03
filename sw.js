const S_CACHE_NAME = 'hothothot-cache-v3';

// add all necessary files to urls to cache
const A_URLS_TO_CACHE = [
        './',
        './index.html',
        './documentation.html',
        './styless.css',
        './js/script.js',
        './js/sensorManager.js',
        './js/temperatureDisplay.js',
        './js/historyManager.js',
        './js/eventManager.js',
        './js/tabs.js',
        './manifest.json'
];

// open cache and add all files to it
self.addEventListener('install', function F_onInstall(O_event) {
    O_event.waitUntil(
        caches.open(S_CACHE_NAME)
            .then(function F_cacheUrls(O_cache) {
                console.log('Cache ouvert');
                return O_cache.addAll(A_URLS_TO_CACHE);
            })
    );
});

// research file in chache and return it if found, otherwise fetch from network
self.addEventListener('fetch', function F_onFetch(O_event) {
    if (O_event.request.method !== 'GET') {
        return;
    }

    const O_requestUrl = new URL(O_event.request.url);
    if (O_requestUrl.origin !== self.location.origin) {
        return;
    }

    O_event.respondWith(
        caches.match(O_event.request)
            .then(function F_matchCache(O_response) {
                if (O_response !== undefined){
                    return O_response;
                }

                return fetch(O_event.request)
                    .catch(function F_onFetchError() {
                        if (O_event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return new Response('', { status: 504, statusText: 'Gateway Timeout' });
                    });
            })
    );
});