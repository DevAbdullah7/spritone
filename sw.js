const cacheName = 'spritone-v8'
const assets = [
    '/',
    '/index.html',
    'generate.html',
    'Privacy-policy.html',
    'Terms-of-Service.html',
    '/assets/css/design-system.css',
    '/assets/css/main.css',
    '/assets/css/layout.css',
    '/assets/css/app.css',
    '/assets/js/Design-System.js',
    '/assets/js/main.js',
    '/assets/js/app.js',
    '/assets/icons/sprites/manifest.json',
    '/assets/icons/sprites/icons.svg',
    '/assets/imgs/appAR.png',
    '/assets/imgs/appEN.png',
    '/assets/imgs/mockupAR.svg',
    '/assets/imgs/mockupEN.svg',
    '/assets/imgs/iMac.svg',
    '/assets/res/manifest.json',
    '/assets/res/workflow.mov',
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(assets).then(() => {
                console.log('caching done !')
            }).catch()
        }).catch(err => {}),
        caches.keys().then(keys => {
            Promise.all(
                keys.filter(key => key != cacheName).map(key => caches.delete(key))
            )
        })
    )
})

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key != cacheName).map(key => caches.delete(key))
            )
        })
    )
})

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then((res) => {
            return res || fetch(event.request).then(res => {
                return res
            }, err => {
                // Network Failure
            })
        })
    )
})