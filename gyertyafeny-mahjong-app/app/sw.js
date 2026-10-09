/* Gyertyafény Mahjong — offline cache.
   Bump the version when index.html changes: the phone then surely loads the new
   one on its next start. */
const CACHE = 'gyertyafeny-v18';

/* Google Fonts live in a cache of their own, which a version bump does not wipe: the
   page links the same stylesheet URLs release after release, and an update that threw
   the fonts away could leave a phone that next starts offline with the fallback type.
   Raise the number only to drop every stored font. */
const FONT_CACHE = 'gyertyafeny-fonts-1';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

/* The font stylesheets index.html links (every fonts.googleapis.com href in it) and the
   font files they name for the latin and latin-ext subsets, the ones a Hungarian page
   draws with. They are fetched here, at install, because the page's own first load runs
   before this worker controls it, so the fetch handler never sees those requests: a
   phone that went offline right after its first start would have no fonts otherwise.
   Files already stored are not fetched again. Entries the current stylesheets no longer
   name are dropped, but only after a complete pass, so an offline install keeps all. */
async function precacheFonts() {
  const page = await (await caches.open(CACHE)).match('./index.html');
  if (!page) return;
  const html = await page.text();
  const sheets = [...html.matchAll(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/g)]
    .map((m) => m[1].replace(/&amp;/g, '&'));
  const cache = await caches.open(FONT_CACHE);
  const keep = new Set();
  let complete = true;
  for (const url of sheets) {
    let res = await cache.match(url, { ignoreVary: true });
    if (!res) {
      res = await fetch(url, { mode: 'cors' }).catch(() => null);
      if (!res || !res.ok) { complete = false; continue; }
      await cache.put(url, res.clone());
    }
    keep.add(new Request(url).url);
    // each @font-face block follows a comment naming its subset; a text= subset has none
    const parts = (await res.text()).split('@font-face');
    for (let i = 1; i < parts.length; i++) {
      const tag = (parts[i - 1].match(/\/\*\s*([\w-]+)\s*\*\/\s*$/) || [])[1];
      const file = (parts[i].match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/) || [])[1];
      if (!file || (tag && tag !== 'latin' && tag !== 'latin-ext')) continue;
      keep.add(new Request(file).url);
      if (await cache.match(file, { ignoreVary: true })) continue;
      const f = await fetch(file, { mode: 'cors' }).catch(() => null);
      if (f && f.ok) await cache.put(file, f); else complete = false;
    }
  }
  if (complete) for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => precacheFonts().catch(() => {}))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fonts, cache first: Google versions the font files in their URLs, so a stored copy
   stays right. The stylesheets come in CORS mode (the link has crossorigin); should one
   come opaque after all, it is kept too. ignoreVary: the stored copy was fetched by this
   worker or by a <link>, and Google varies the stylesheet on the Sec-Fetch-* headers,
   which differ between the two. A miss while offline fails like the network would,
   so the page falls back to its local fonts. */
function fontFirst(req) {
  return caches.open(FONT_CACHE).then(cache =>
    cache.match(req, { ignoreVary: true }).then(hit => hit || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }))
  ).catch(() => Response.error());
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (FONT_HOSTS.includes(new URL(e.request.url).hostname)) { e.respondWith(fontFirst(e.request)); return; }
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        // own files that downloaded fine are kept for later
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
