/* Δρομολόγιο — service worker
   Χρειάζεται για να εμφανίζονται ειδοποιήσεις στο Android
   και για να ανοίγει η εφαρμογή χωρίς σύνδεση. */
const CACHE = "dromologio-v1.6";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png"]).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Δίκτυο πρώτα, με το αποθηκευμένο αντίγραφο ως εφεδρεία όταν δεν υπάρχει σύνδεση. */
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html")))
  );
});

/* Πάτημα στην ειδοποίηση: φέρνει μπροστά την ανοιχτή εφαρμογή ή την ανοίγει. */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) if ("focus" in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
