# CLAUDE.md — Materialliste Licht

## Projektübersicht

**Materialliste Licht** ist eine Webanwendung zur Verwaltung von Lichttechnik-Equipment für Touring-Produktionen. Sie richtet sich an Lichttechniker und Produktionsfirmen im deutschsprachigen Raum.

Kernfunktionen:
- Kabel, Zubehör, Hardware und Lampen erfassen und verwalten
- Mengen, Reserven und „Im Projekt"-Anzahl pro Position tracken
- DIFF-Berechnung: (Menge + Reserve) − Im Projekt → Grün/Rot
- Mehrere Projekte mit eigenem Sidebar-Menü
- JSON-Import/Export, CSV-Export, PDF-Druck
- Logo-Slots (Planer, Band, Agentur) je Projekt

Die gesamte UI ist auf **Deutsch**.

## Tech-Stack

- **Vanilla JavaScript** — kein Framework, keine Bibliotheken
- **HTML5 + CSS3** — alles in einer einzigen Datei
- **localStorage** — persistente Datenspeicherung im Browser
- **Google Fonts** — Bebas Neue, Barlow Condensed, Share Tech Mono, IBM Plex Mono
- **GitHub Pages** — statisches Hosting, kein Backend
- **Kein Build-System** — kein npm, kein webpack, kein Transpiler

## Projektstruktur

```
Materialliste-Licht/
├── index.html                 ← AKTIVE HAUPTDATEI (~1553 Zeilen)
├── materialliste-licht.html   ← ältere Version, nicht bearbeiten
├── LichtMaterialliste.html    ← noch ältere Version (v3), nicht bearbeiten
└── README.md                  ← Benutzeranleitung & TODO-Liste
```

Alle Änderungen gehören in `index.html`. Die anderen HTML-Dateien sind Entwicklungshistorie.

## Entwicklungs-Workflow

Kein Build-Schritt erforderlich:

1. `index.html` direkt im Browser öffnen (`file://` oder lokaler HTTP-Server)
2. Änderungen speichern → Browser-Tab neu laden
3. Für GitHub Pages: Datei committen und pushen → automatisch live

Kein `npm install`, kein `npm run build`, kein Compiler.

## Architektur

### State-Management
- Globales `state`-Objekt hält alle Projektdaten
- Schreibzugriff immer über `saveState()` (Debounce: 350ms → localStorage)
- Beim Start: `loadState()` aus localStorage oder leerer Initialzustand

### CATALOG-Konstante
- Großes Objekt mit allen vordefinierten Kabeltypen, Zubehör, Hardware
- Schlüssel = Typ-Name (z.B. `"DMX 5-Pin"`), Wert = `{cat: "Kabel Liste", items: [{n, l}]}`
- Benutzer-Ergänzungen (`CATALOG_KEY` im localStorage) werden beim Start eingemischt

### UI-System
- Modal-Overlays für Wizards und Dialoge (Breite: 960px)
- 4 Kategorie-Tabs: Kabel, Zubehör, Hardware, Lampen
- Sektionen/Gruppen innerhalb jeder Kategorie (ein-/ausklappbar)
- CSS Grid für Header, Sidebar und Tabellen

### Wizard-Flow (Material hinzufügen)
- Schritt 1: Katalogtyp wählen (z.B. "DMX 5-Pin")
- Schritt 2: Mengen eingeben — Popup bleibt nach „+ HINZUFÜGEN" offen, schließt erst bei „✓ FERTIG"
- Neue Längen im Wizard: nur Zahl eingeben, `m` wird automatisch ergänzt, Eintrag wird numerisch einsortiert
- Alle Items einer Sektion erhalten immer den Sektionsnamen als Bezeichnung (konsistent)
- Sortierung: beim Rendern (`rerenderCatInto`) und nach jedem Hinzufügen (`wizDone`) wird nach numerischer Länge sortiert

### Katalog
- `CATALOG` Konstante: Schlüssel = Typ-Name (z.B. `"DMX 5-Pin"`), Wert = `{cat, items: [{n, l, b?}]}`
- `n` = Bezeichnung, `l` = Länge/Typ, `b` = Bemerkung (optional)
- Benutzer-Ergänzungen: `localStorage` Key `materialliste-licht-catalog-v1`, werden beim Start eingemischt
- Neue Längen per `wizAddCustomLen()`: nur Zahleingabe → `"20m"` Format, gespeichert in `saveCatalogCustom()`

### Berechnungslogik
- `DIFF = (Qty + Spare) - InProject` → grün wenn ≥ 0, rot wenn < 0
- `TOTAL = Qty + Spare`
- Kategorie-Badges zeigen Anzahl roter (fehlender) Positionen
- Globaler Status-Indikator oben rechts

## Konventionen

- **Sprache:** Alle UI-Texte, Variablennamen im CATALOG und Kommentare auf **Deutsch**
- **Farbpalette beibehalten:**
  - Gold: `#e8c84a` (Akzentfarbe)
  - Grün: `#4ae8a0` (positiver DIFF)
  - Rot: `#e84a4a` (negativer DIFF / fehlende Items)
  - Dark Background: `#1a1a2e` / `#16213e`
- **Keine externen Abhängigkeiten einführen** — die App soll offline und ohne CDN funktionieren
- **Single-File-Prinzip beibehalten** — alles in `index.html`

## Tests

Kein Test-Framework vorhanden. Tests erfolgen manuell im Browser:
- Funktionen in der Browser-Konsole testen
- Verschiedene Browser prüfen (Chrome, Firefox, Safari)
- PDF-Export über Ctrl+P / Cmd+P testen
- Import/Export-Roundtrip mit JSON-Dateien prüfen
