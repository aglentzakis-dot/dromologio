/* Δρομολόγιο — service worker
   Ρόλος: ειδοποιήσεις στο Android και άνοιγμα χωρίς σύνδεση.
   Η σελίδα ΔΕΝ σερβίρεται ποτέ από τη μνήμη όταν υπάρχει δίκτυο,
   ώστε να βλέπεις πάντα την τελευταία έκδοση. */
const CACHE = "dromologio-1.9";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./manifest.json", "./icon-192.png"]).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const isPage = r.mode === "navigate" || (r.destination === "" && /\.html?($|\?)/.test(r.url));

  if (isPage) {
    // Πάντα από το δίκτυο· η μνήμη μόνο ως εφεδρεία χωρίς σύνδεση.
    e.respondWith(
      fetch(new Request(r.url, { cache: "reload", credentials: "same-origin" }))
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html").then(m => m || Response.error()))
    );
    return;
  }

  e.respondWith(
    fetch(r)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(r))
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) if ("focus" in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
