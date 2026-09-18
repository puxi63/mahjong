# Gyertyafény Mahjong — hogyan lesz ebből telefonos app

A mappa tartalma egy kész, telepíthető webalkalmazás (PWA). Két úton juthatsz
ikonos játékhoz a telefonodon. Az elsőhöz semmilyen fejlesztői eszköz nem kell,
a második ad igazi APK-t.

---

## 1. út — ikon a kezdőképernyőn (5 perc, ingyenes)

Ehhez a fájloknak egy webcímen kell lenniük. A legegyszerűbb a GitHub Pages.

1. Készíts fiókot a github.com oldalon, ha még nincs.
2. Hozz létre egy új, **nyilvános** tárolót, például `mahjong` néven.
3. Töltsd fel ennek a mappának a teljes tartalmát: `index.html`,
   `manifest.webmanifest`, `sw.js` és az `icons` mappa a képekkel.
   (Add file → Upload files → húzd be mindet → Commit.)
4. A tároló **Settings → Pages** menüjében a Source legyen `Deploy from a branch`,
   a branch `main`, a mappa `/ (root)`. Mentés.
5. Egy-két perc múlva megkapod a címet:
   `https://FELHASZNALONEVED.github.io/mahjong/`
6. Nyisd meg ezt a címet a telefonod **Chrome** böngészőjében.
7. Jobb felül a három pont → **Alkalmazás telepítése** (vagy *Hozzáadás a
   kezdőképernyőhöz*).

Ezután a gyertyás ikon ott lesz a többi app között. Megnyitva teljes képernyőn
indul, böngészősáv nélkül, és **internet nélkül is működik**, mert a `sw.js`
letárolja magát az első indításnál.

iPhone-on ugyanez a Safariból: Megosztás → Hozzáadás a Főképernyőhöz.

---

## 2. út — igazi APK fájl

Ha telepíthető `.apk` kell (mondjuk mert másnak is oda akarod adni):

1. Végezd el az 1. út 1–5. lépését, hogy legyen egy élő webcímed.
2. Menj a **pwabuilder.com** oldalra, írd be a címet, majd *Start*.
3. Az elemzés után válaszd az **Android → Generate Package** lehetőséget.
4. A csomagoló ad egy zip-et, benne a `.apk` és a `.aab` fájllal, plus egy
   aláíró kulccsal. Az APK-t másold a telefonra és telepítsd
   (az ismeretlen forrásból való telepítést engedélyezni kell).

Ez a módszer egy úgynevezett TWA-t készít: az app valójában a saját oldaladat
nyitja meg teljes képernyőn, de a rendszer szemében rendes alkalmazás.

**Ha szeretnéd, hogy tényleg minden a telefonon legyen**, webcím nélkül, akkor
a Capacitor kell hozzá, számítógépen:

```
npm install -g @capacitor/cli
npx cap init "Gyertyafeny Mahjong" hu.otthon.mahjong --web-dir=.
npm install @capacitor/core @capacitor/android
npx cap add android
npx cap open android
```

Az Android Studio ezután fordít egy APK-t. Ehhez viszont már kell egy gép
Android Studióval.

---

## Saját zene és saját képek

**Zene.** Tedd a hangfájlt egy `zene` mappába a többi fájl mellé, majd az
`index.html` elején írd át ezt a sort:

```js
const CUSTOM_MUSIC_URL = 'zene/sajat.mp3';
```

Ha üresen hagyod, a játék a beépített, generált aláfestést szólaltatja meg.
Ne felejtsd el a fájlt felvenni az `sw.js` `FILES` listájába, hogy offline is
szóljon.

**Csempeképek.** Az `index.html`-ben keresd meg a `render()` függvényt, és
cseréld ki benne a `d.textContent=t.s;` sort erre:

```js
d.style.backgroundImage=`url(kepek/${t.s}.png)`;
d.style.backgroundSize='cover';
```

Ekkor a `PACKS` listákban a jelek helyére fájlneveket írj (`'bagoly'`,
`'palca'`, …), a képeket pedig tedd egy `kepek` mappába. Készletenként 36 kép
kell. A képek méretaránya nagyjából 40×52 legyen.

---

## Frissítés

Ha módosítod az `index.html`-t, emeld meg a verziót az `sw.js` első sorában
(`gyertyafeny-v1` → `gyertyafeny-v2`), különben a telefon a régi változatot
tölti be a gyorsítótárból.

---

## A haladás mentése

A szintek, tallérok és a kinyitott készletek a böngésző tárolójában élnek.
Ha törlöd a böngészőadatokat vagy eltávolítod az appot, elvesznek. Telepített
alkalmazásként ez ritkán fordul elő, de érdemes tudni.
