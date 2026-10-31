# GRAND RP · Admin-Bewerbung · Lenny Kok

Bewerbung von **Lenny Kok** (ID 126082) für das Admin-Team von GRAND RP DE1 – als statische Website ohne Build-Schritt.
Sie kombiniert zwei Vorlagen: die filmische Scroll-Erzählung (Skyline, Zeitleiste, gepinnter Abschnitt, Unterschrift) und die Admin-Akte (IC/OOC-Trennung, Statuscheck, Wappen). Dunkel, Gold und Orange, Rot als zweiter Akzent.

Live: https://cyrexmv.github.io/ADMIN-GRAND-LENNY/

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Lange Scroll-Seite: Start, Begrüßung mit Kurzdaten, Über mich, Erfahrung (Zeitleiste), „Warum ich“, Schlusswort |
| `voraussetzungen.html` | Alle Kriterien mit Statuscheck (4 / 4) |
| `bewerbung.html` | Vollständige Bewerbung mit Inhaltsverzeichnis |
| `ueber-mich.html`, `erfahrung.html` | Weiterleitungen auf die Abschnitte der Startseite |

## Struktur

```
assets/
  css/style.css  Design (Tokens, Atmosphäre, Komponenten, Seiten, Druck)
  js/app.js      Interaktionen (Ladezähler, Intro, Scroll-Erscheinen, Skyline, Zeitleiste,
                 gepinnter Abschnitt, Unterschrift, Wappen-Neigung, Cursor, Kopieren, Inhaltsverzeichnis)
  img/           Wappen (SVG) und Social-Preview
favicon.svg
apple-touch-icon.png
```

Keine externen Bibliotheken außer Google Fonts. Ohne JavaScript bleibt jede Seite vollständig lesbar, und `prefers-reduced-motion` schaltet alle Animationen ab.

## IC / OOC

- **IC – In Character** (Gold): alles zum Charakter *Lenny Kok* – Nickname, Spieler-ID, Organisationen sowie die Fragen 03–05.
- **OOC – Out of Character** (Blau): alles zu *Lenny* als Person – Name, Alter, Discord, Voraussetzungen, Online-Zeit und Regelkenntnis (Fragen 01–02).

## Lokal ansehen

```bash
npx serve .
```
