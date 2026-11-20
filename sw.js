const cacheName = 'spritone-v8'
const assets = [
    'spritone/',
    'spritone/index.html',
    'spritone/generate.html',
    'spritone/Privacy-policy.html',
    'spritone/Terms-of-Service.html',
    'spritone/assets/css/design-system.css',
    'spritone/assets/css/main.css',
    'spritone/assets/css/layout.css',
    'spritone/assets/css/app.css',
    'spritone/assets/js/Design-System.js',
    'spritone/assets/js/main.js',
    'spritone/assets/js/app.js',
    'spritone/assets/icons/sprites/manifest.json',
    'spritone/assets/icons/sprites/icons.svg',
    'spritone/assets/imgs/appAR.png',
    'spritone/assets/imgs/appEN.png',
    'spritone/assets/imgs/mockupAR.svg',
    'spritone/assets/imgs/mockupEN.svg',
    'spritone/assets/imgs/iMac.svg',
    'spritone/assets/res/manifest.json',
    'spritone/assets/res/workflow.mov',
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