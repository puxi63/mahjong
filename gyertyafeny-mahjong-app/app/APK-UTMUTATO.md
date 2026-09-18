# Hogyan lesz a játékból igazi APK

Két út van. Az **A** út körülbelül fél óra, nem kell hozzá számítógép,
csak egy GitHub-fiók. A **B** út teljesen offline appot ad, de kell hozzá
egy PC Android Studióval.

Mindkettőhöz a `gyertyafeny-mahjong-app.zip` tartalma kell kicsomagolva:
`index.html`, `manifest.webmanifest`, `sw.js`, és az `icons` mappa.

---

# A út — PWABuilder (számítógép nélkül is megy)

Ez a módszer egy TWA-t készít: az app a saját webcímedet nyitja meg teljes
képernyőn, de a telefon szemében rendes alkalmazás, ikonnal, a többi app között.

## A1. Tedd fel a fájlokat a netre (GitHub Pages)

1. Menj a **github.com** oldalra, és készíts fiókot, ha még nincs.
2. Jobb fent a **+** jel → **New repository**.
3. A neve legyen `mahjong`, a típusa **Public**, majd **Create repository**.
4. A megnyíló oldalon kattints az **uploading an existing file** linkre.
5. Húzd be (vagy válaszd ki) a következőket:
   - `index.html`
   - `manifest.webmanifest`
   - `sw.js`
   - az egész `icons` mappa
6. Lent **Commit changes**.
7. Fent a **Settings** fül → bal oldalon **Pages**.
8. A *Source* legyen **Deploy from a branch**, a branch **main**, a mappa
   **/ (root)**. **Save**.
9. Várj 1–2 percet, majd frissítsd az oldalt. Megjelenik a címed:
   `https://FELHASZNALONEVED.github.io/mahjong/`
10. Nyisd meg ezt a címet, és ellenőrizd, hogy a játék elindul.

## A2. Készítsd el a csomagot

1. Menj a **pwabuilder.com** oldalra.
2. Írd be a fenti címet, majd **Start**.
3. Az elemzés után kattints a **Package for stores** gombra.
4. Válaszd az **Android** csempét, majd az **Options** részt nyisd le:
   - *Package ID*: `hu.otthon.mahjong` (bármi lehet, de pont kell bele,
     és később már nem érdemes változtatni)
   - *App name*: `Gyertyafény Mahjong`
   - *App version*: `1.0.0`
   - *Signing key*: **Create new** (a PWABuilder generál egyet)
5. **Download Package**. Kapsz egy zip-et.

A zip tartalma:
- `app-release-signed.apk` — ezt lehet telepíteni
- `app-release-bundle.aab` — ez csak a Play Áruházhoz kell
- `signing.keystore` és `signing-key-info.txt` — **tedd el ezeket!**
  Ha később frissíteni akarod az appot, ugyanezzel a kulccsal kell aláírni.
- `assetlinks.json` — a következő lépéshez

## A3. Tüntesd el a böngészősávot (fontos!)

Enélkül az app tetején megmarad egy vékony címsáv, és nem érződik igazi
alkalmazásnak.

1. A GitHub-tárolódban hozz létre egy `.well-known` nevű mappát.
   (Add file → Create new file → a névhez írd: `.well-known/assetlinks.json` —
   a perjel automatikusan mappát csinál.)
2. Másold bele a PWABuilder zip-jéből az `assetlinks.json` tartalmát.
3. Commit.
4. Ellenőrizd, hogy elérhető:
   `https://FELHASZNALONEVED.github.io/mahjong/.well-known/assetlinks.json`

## A4. Telepítés a telefonra

1. Másold át az `app-release-signed.apk` fájlt a telefonra
   (kábel, felhő, vagy küldd el magadnak).
2. Nyisd meg a Fájlok appból. A telefon rákérdez, hogy engedélyezed-e az
   ismeretlen forrásból való telepítést — engedélyezd annak az appnak,
   amiből indítottad.
3. Telepítés. Kész: ott az ikon a többi játék között.

---

# B út — Capacitor (teljesen offline app, PC kell hozzá)

Itt a játék bekerül magába az APK-ba, nem kell hozzá se webcím, se internet.

## B1. Amit előre telepíts a gépre

- **Node.js** LTS: nodejs.org
- **Android Studio**: developer.android.com/studio
  Az első indításkor letölti az SDK-t — ez több giga, legyen türelmed.

## B2. Projekt létrehozása

Nyiss egy parancssort, és add ki sorban:

```bash
mkdir mahjong-app
cd mahjong-app
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Gyertyafeny Mahjong" hu.otthon.mahjong --web-dir=www
```

Az ékezet nélküli név nem véletlen: a projekt belső nevében biztonságosabb.
A megjelenő nevet a B5 lépésben állítod be szépre.

## B3. A játék bemásolása

Hozz létre egy `www` mappát a projekten belül, és másold bele:

```
www/index.html
www/manifest.webmanifest
www/sw.js
www/icons/...
```

Ha saját zenét vagy képeket használsz, azok is ide jönnek
(`www/zene/`, `www/kepek/`).

## B4. Android projekt hozzáadása

```bash
npx cap add android
npx cap sync
```

## B5. Ikon és név

Ikonokhoz a legegyszerűbb:

```bash
npm install -D @capacitor/assets
mkdir assets
```

Másold az `icons/icon-1024.png` fájlt `assets/icon.png` néven, majd:

```bash
npx capacitor-assets generate --android
```

A megjelenő nevet az `android/app/src/main/res/values/strings.xml` fájlban
írhatod át:

```xml
<string name="app_name">Gyertyafény Mahjong</string>
<string name="title_activity_main">Gyertyafény Mahjong</string>
```

## B6. Fordítás

```bash
npx cap open android
```

Ez megnyitja az Android Studiót. Várd meg, míg a Gradle végez (alul látszik).
Aztán:

**Gyors, kipróbálásra:**
Build menü → *Build Bundle(s) / APK(s)* → *Build APK(s)*.
A kész fájl: `android/app/build/outputs/apk/debug/app-debug.apk`

**Rendes, aláírt változat:**
Build menü → *Generate Signed App Bundle or APK* → **APK** → *Create new…*
(itt hozol létre egy kulcstárat — a jelszót és a fájlt őrizd meg) →
build variant: **release** → Finish.
A kész fájl: `android/app/build/outputs/apk/release/app-release.apk`

## B7. Telepítés

Másold a telefonra és nyisd meg, ahogy az A4-ben.
Vagy USB-kábellel, bekapcsolt fejlesztői módban az Android Studio
zöld ▶ gombjával közvetlenül is felteheti.

---

# Melyiket válaszd

| | A út (PWABuilder) | B út (Capacitor) |
|---|---|---|
| Kell hozzá PC | nem | igen |
| Idő | ~30 perc | 1–2 óra az első alkalommal |
| Internet az apphoz | csak az első indításnál | soha |
| A kód nyilvános | igen (public repo) | nem |
| Frissítés | elég a weboldalt frissíteni | új APK kell |

Ha csak magadnak kell, kezdd az **A** úttal. Ha zavar, hogy a fájlok
nyilvánosak, vagy tényleg minden a telefonon legyen, menj a **B** úton.

---

# Gyakori gubancok

**„A csomag sérült" telepítéskor.** Általában félbeszakadt másolás. Küldd át
újra a fájlt, lehetőleg kábellel.

**Megmaradt a címsáv az app tetején (A út).** Az `assetlinks.json` nincs a
helyén, vagy a package ID nem egyezik. Nézd meg a fenti A3 lépést.

**Fehér képernyő indításkor (B út).** A `www` mappában nincs `index.html`,
vagy elfelejtetted a `npx cap sync` parancsot a másolás után.

**Nem frissül a játék (A út).** A `sw.js` első sorában lévő verziószámot kell
megemelni (`gyertyafeny-v2` → `gyertyafeny-v3`), különben a telefon a
gyorsítótárból tölt.

**Elveszett a haladás.** A szintek és tallérok a böngésző tárolójában élnek.
Az app törlése és újratelepítése kinullázza. Az A és a B út külön tárolót
használ, tehát a kettő nem látja egymás mentését.
