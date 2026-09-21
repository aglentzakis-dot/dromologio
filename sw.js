/* Δρομολόγιο — service worker
   Ρόλος: 1) η εφαρμογή να ανοίγει έστω και χωρίς σύνδεση στο διαδίκτυο,
          2) να δέχεται ειδοποιήσεις στο Android.
   ΣΗΜΑΝΤΙΚΟ: όποτε αλλάζει οτιδήποτε στην εφαρμογή, αύξησε τον αριθμό
   στη γραμμή CACHE παρακάτω (π.χ. "dromologio-5.7" -> "dromologio-5.8").
   Έτσι το κινητό καταλαβαίνει ότι υπάρχει νέα έκδοση και δεν μένει
   κολλημένο στην παλιά. Δεν χρειάζεται να ταιριάζει ακριβώς με το
   APP_VERSION μέσα στο index.html, αρκεί να ΑΛΛΑΖΕΙ κάθε φορά. */
const CACHE = "dromologio-8.1";

// Το βασικό «σκελετό» της εφαρμογής: αποθηκεύεται με την εγκατάσταση,
// ώστε να ανοίγει η εφαρμογή ακόμη και την πρώτη φορά χωρίς σύνδεση.
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      SHELL.map(u => c.add(u).catch(() => {})) // ένα αρχείο που λείπει δεν μπλοκάρει τα άλλα
    ))
  );
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
    // Η σελίδα ζητείται πάντα φρέσκια από το δίκτυο όταν υπάρχει σύνδεση,
    // ώστε να βλέπεις πάντα την τελευταία έκδοση· η μνήμη είναι μόνο
    // εφεδρεία για όταν δεν υπάρχει καθόλου σύνδεση.
    e.respondWith(
      fetch(new Request(r.url, { cache: "reload", credentials: "same-origin" }))
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html").then(m => m || caches.match("./")).then(m => m || Response.error()))
    );
    return;
  }

  // Ό,τι άλλο (εικονίδια, manifest κ.λπ.): πρώτα δίκτυο, αλλιώς ό,τι έχει μείνει στη μνήμη.
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
