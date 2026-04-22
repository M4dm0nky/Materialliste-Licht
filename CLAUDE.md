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
- **HTML5 + CSS3** — separate Dateien, kein Build-Schritt
- **localStorage** — persistente Datenspeicherung im Browser
- **Google Fonts** — Bebas Neue, Barlow Condensed, Share Tech Mono, IBM Plex Mono
- **GitHub Pages** — statisches Hosting, kein Backend
- **Kein Build-System** — kein npm, kein webpack, kein Transpiler

## Projektstruktur

```
Materialliste-Licht/
├── index.html                 ← Einstiegspunkt: HTML-Gerüst + <link>/<script> Tags
├── css/
│   ├── variables.css          ← :root Custom Properties, Farben, Animationen
│   ├── layout.css             ← Header, Sidebar, App-Layout, Posbar
│   ├── components.css         ← Buttons, Tabs, Tabellen, Inputs, Sektionen
│   └── modals.css             ← Overlays, Wizard, Katalog-Manager, Logo/PDF-Modal
├── js/
│   ├── utils.js               ← Hilfsfunktionen: parseLen(), showConfirm(), showPrompt()
│   ├── catalog.js             ← CATALOG-Konstante + catalogsStore-Verwaltung
│   ├── state.js               ← state-Objekt, save(), initState(), esc()
│   ├── calc.js                ← xdiff(), xtotal(), lc(), recalcAll(), recalcBadge()
│   ├── render.js              ← render(), buildSecEl(), buildRow(), upn(), upf(), UI-Steuerung
│   ├── wizard.js              ← Wizard-Flow (step1/2, wizDone, toast, eigener Eintrag)
│   ├── catalog-mgr.js         ← Katalog-Manager UI (CRUD für Typen, Gruppen, Kataloge)
│   ├── logos.js               ← Logo-Upload, Header-Anzeige, Sidebar-Toggle
│   ├── plans.js               ← Multi-Plan-System (switchPlan, savePlanToLS, migrateState)
│   ├── positions.js           ← Positions-Bar (renderPosBar, switchPos, addPosition)
│   ├── export.js              ← saveProjectJSON(), importProjectJSON(), exportCSV()
│   ├── pdf.js                 ← openPDFExport(), generatePDF()
│   └── init.js                ← App-Start (initCatalogs, initState, initPlans)
├── materialliste-licht.html   ← ältere Version, nicht bearbeiten
├── LichtMaterialliste.html    ← noch ältere Version (v3), nicht bearbeiten
├── CHANGELOG.md               ← Versionshistorie (alle Änderungen)
└── README.md                  ← Benutzeranleitung & TODO-Liste
```

**Ladereihenfolge der JS-Dateien ist kritisch** (globaler Scope, kein Modulsystem):
`utils` → `catalog` → `state` → `calc` → `render` → `wizard` → `catalog-mgr` → `logos` → `plans` → `positions` → `export` → `pdf` → `init`

## Version & Live-URL

- Aktuelle Version: **v0.5**
- Live: https://m4dm0nky.github.io/Materialliste-Licht/

## Entwicklungs-Workflow

Kein Build-Schritt erforderlich:

```bash
python3 -m http.server 8080   # lokalen Server starten
# dann http://localhost:8080 im Browser öffnen
```

Alternativ: VS Code Live Server Extension.

Datei in `css/` oder `js/` bearbeiten → Browser-Tab neu laden → fertig.
Für GitHub Pages: committen und pushen → automatisch live.

**Wichtig:** Bei `file://`-Protokoll blockieren manche Browser das Laden externer JS/CSS-Dateien — immer über HTTP testen. GitHub Pages funktioniert problemlos.

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
- 5 Welten-Tabs: Datenwelt / Stromwelt / Lichtwelt / Riggingwelt / Verbrauchswelt
- Geräte (qty-Typen): Gruppe = Sektionskopf, jedes Gerät = eine Tabellenzeile; 3-Ebenen in Licht-/Datenwelt (Gruppe → Untergruppe → Artikel)
- Kabel (lengths-Typen): Typ = Sektionskopf, Längen als Zeilen (wie bisher)
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
- **Dateistruktur beibehalten** — CSS in `css/`, JS in `js/`, HTML-Gerüst in `index.html`
- **Kein Modulsystem** — alle JS-Dateien teilen den globalen Scope, Ladereihenfolge beachten

## Tests

Kein Test-Framework vorhanden. Tests erfolgen manuell im Browser:
- Funktionen in der Browser-Konsole testen
- Verschiedene Browser prüfen (Chrome, Firefox, Safari)
- PDF-Export über Ctrl+P / Cmd+P testen
- Import/Export-Roundtrip mit JSON-Dateien prüfen

## LLM Council Skill

Wenn der User "Consult the council:", "Frag andere KIs", "Was denken ChatGPT und Gemini darüber" oder ähnliches sagt — nutze den `llm-council` Skill via Skill-Tool.

Der Skill befragt ChatGPT und Gemini, analysiert deren Antworten und synthetisiert einen Plan mit Quellenangaben.

Voraussetzung: `.env`-Datei im Projektverzeichnis mit API-Keys (siehe `~/.claude/skills/llm-council/.env.template`).

## Tipps

- **`#` in Claude Code** — während einer Session drücken um Learnings direkt in diese CLAUDE.md zu schreiben
- **`.claude.local.md`** — für persönliche Einstellungen die nicht ins Git sollen (in `.gitignore` aufnehmen)
