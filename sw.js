const CACHE='money-plan-shell-v7';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./wallpaper-christmas.svg','./wallpaper-winter.svg','./wallpaper-japan.svg','./wallpaper-summer.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('money-plan-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).then(x=>{let y=x.clone();caches.open(CACHE).then(c=>c.put(e.request,y));return x}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
