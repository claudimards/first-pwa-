const staticCacheName = 'site-static-v2'
const dynamicCacheName = 'site-dynamic-v1'
const assets = [
    '/',
    '/index.html',
    '/pages/fallback.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v70/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
]

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0].then(limitCacheSize(name, size)))
            }
        })
    })
}

// install service worker
self.addEventListener('install', evt => {
    //console.log('service worker has been installed')
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            cache.addAll(assets)
        })
    )
})

// activate event
self.addEventListener('activate', evt => {
    //console.log('service worker has been activated')
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
})

// fetch event
self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt)
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fecthRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fecthRes.clone())
                    limitCacheSize(dynamicCacheName, 15)
                    return fecthRes
                })
            })
        }).catch(() => {
            if(evt.request.url.indexOf('.html') > -1 ){
                caches.match('pages/fallback.html')
            }
        })
    )
})