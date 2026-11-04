# Endes Tamás – webfejlesztő (saját szolgáltatói oldal)

Statikus, egyoldalas oldal: HTML, CSS, JS, build-lépés és külső könyvtár nélkül. Tárhely: **GitHub Pages**. Űrlap nincs, a kapcsolat e-mail és telefon.

## Fájlok

| Fájl / mappa | Mi ez |
|---|---|
| `index.html` | a fő oldal |
| `impresszum.html`, `adatvedelem.html`, `sutik.html` | jogi aloldalak |
| `404.html` | „nincs ilyen oldal” (GitHub Pages magától használja) |
| `css/style.css` | minden stílus; színek, betűk, térközök a `:root` változókban |
| `js/head.js` | a `<head>`-ben fut: `.js` osztály + keretbe töltés elleni védelem |
| `js/main.js` | animációk (élő build, kurzor, döntés, számlálók stb.) |
| `fonts/` | saját hosztolt betűk + OFL licencek |
| `img/` | portfólióképek, OG-kép (`og-kep.jpg`, 1200×630) |
| `robots.txt`, `sitemap.xml` | keresőknek |
| `.github/workflows/pages.yml` | automatikus élesítés **fehérlistával** |

Nem kerül ki élesbe: `README.md`, `CLAUDE.md`, `adatkezeles-nyilvantartas.md` (az utóbbi kettő a `.gitignore`-ban is benne van).

## Helyi kipróbálás

VS Code Live Server, vagy a projekt mappájában:

```
php -S 127.0.0.1:8080
```

majd: http://127.0.0.1:8080/

## Élesítés GitHub Pages-re

1. Hozz létre egy repót a GitHubon, és töltsd fel (`git push` a `main` ágra).
2. Repó → **Settings → Pages → Build and deployment → Source: „GitHub Actions”**.
3. Minden `main`-re küldött push után az **Actions** fülön lefut az „Oldal élesítése” workflow. A naplóban a „Kikerülő fájlok” résznél látod, pontosan mi ment ki.
4. **Saját domain** (ajánlott):
   - a repó gyökerébe egy `CNAME` fájl, benne egy sorban a domain (pl. `endestamas.hu`);
   - a domainszolgáltatónál a DNS-ben a GitHub Pages IP-címei (A rekordok) és/vagy `www` CNAME a `felhasznalonev.github.io`-ra, a GitHub dokumentációja szerint;
   - Settings → Pages → Custom domain, majd **Enforce HTTPS** be.
5. Utána cseréld a `TODO-domain.hu` helyőrzőket: `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt`, `sitemap.xml`.

**Fontos:** ha új fájlt vagy mappát adsz az oldalhoz, a `.github/workflows/pages.yml` `cp` soraiba is írd be, különben nem kerül ki.

A `404.html` gyökérhez képesti útvonalakat használ (`/css/...`), ez saját domainnel működik. Ha `felhasznalonev.github.io/repo-nev/` címen futna, ott át kell írni.

## Biztonság GitHub Pages-en

- Nincs `.htaccess`, fejlécet nem tudunk küldeni. A CSP és a referrer szabály `<meta>` címkében van minden oldalon. Ha új oldalt adsz hozzá, azt is másold bele.
- Keretbe töltés ellen a `js/head.js` véd (részlegesen).
- Élesítés után ellenőrizd: `curl -I https://domain.hu/`, és a `CLAUDE.md` meg az `adatkezeles-nyilvantartas.md` címe 404-et adjon.
- Webshop vagy online fizetés nem kerülhet erre az oldalra (GitHub Pages szabályai).

## Képek cseréje

- Portré: `img/endes-tamas.webp` (pl. 840×1050), a helyét az `index.html` „RÓLAM” részében egy komment jelöli.
- Új képet WebP-be így konvertálhatsz: `ffmpeg -i kep.png -vf "scale=840:-2" -c:v libwebp -quality 75 img/kep.webp`
