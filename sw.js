const S_CACHE_NAME = 'hothothot-cache-v1';

// add all necessary files to urls to cache
const A_URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/styless.css',
    '/js/script.js',
    '/js/tabs.js',
    '/js/eventManager.js',
    '/js/temperatureDisplay.js',
    '/manifest.json'
];

// open cache and add all files to it
self.addEventListener('install', function F_onInstall(O_event) {
    O_event.waitUntil(
        caches.opens(S_CACHE_NAME)
            .then(function(O_cache) {
                console.log('Cache ouvert');
                return O_cache.addAll(A_URLS_TO_CACHE);
            })
    );
});

// research file in chache and return it if found, otherwise fetch from network
self.addEventListener('fetch', function F_onFetch(O_event) {
    O_event.respondWith(
        caches.match(O_event.request)
            .then(function F_matchCache(O_response) {
                if (O_response !== undefined){
                    return O_response;
                }

                return fetch(O_event.request);
            })
    );
});