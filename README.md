# Materialliste Licht

**Touring Production · Material Management · Lichttechnik**

> Web-App für die Verwaltung von Kabeln, Zubehör, Hardware und Lampen auf Tour.  
> Version **v0.7.0** · [Live öffnen](https://m4dm0nky.github.io/Materialliste-Licht/index.html) · [Changelog](CHANGELOG.md)

---

## Was die App kann

### Material verwalten
- Leere Tabelle beim Start — Material wird über einen **Wizard aus dem Katalog** hinzugefügt
- **Mehrfachauswahl im Wizard** — beliebig viele Artikel anklicken (Toggle), dann alle Mengen auf einmal eingeben → "✓ HINZUFÜGEN" speichert alles in einem Schritt
- **Längen-Typen im Multi-Select** — Kabeltypen (z.B. DMX 5-Pin) zeigen im Schritt 2 alle Längen als Checkbox-Zeilen mit je eigenem Stk./Spare
- **Gruppen-Kontext** — Schritt 2 zeigt Untergruppen-Header (z.B. "· Gaffa Tape 50mm") damit klar ist welche Artikel wohin gehören
- **Suchfeld** — Artikel live durchsuchen, Ergebnis mit Pfad (Welt › Gruppe › Artikel)
- **Zuletzt verwendet** — die letzten 8 Artikel direkt zugänglich
- Alle Felder nachträglich editierbar: Bezeichnung, Länge, # Stk., Spare, Im Projekt, Kapitel, Notiz
- Zeilen und Sektionen einzeln löschbar

### Excel-Logik
- **DIFF = (# Stk. + Spare) − Im Projekt** → Grün ≥ 0 · Rot < 0 (zu buchen)
- **TOTAL = # Stk. + Spare**
- Warn-Badges pro Kategorie zeigen Anzahl roter Positionen
- Globaler Status-Indikator oben rechts

### 5 Welten

| Welt | Inhalt |
|---|---|
| Datenwelt | DMX-Kabel, Netzwerk, Ethercon, LWL, DMX-Steuerung |
| Stromwelt | Schuko, CEE 16A–125A, Socapex, Dimmer, Feststrom |
| Lichtwelt | Geräte (frei definierbar — Moving Lights, LED Wash, Konventionell, …) |
| Riggingwelt | Alurohre, Drop Arms, Stative, Stahlzeug |
| Verbrauchswelt | Verbrauchsmaterial, Büro, Farbfolien |

### Katalog-Verwaltung
- **Vollbild-Baum** mit Inline-Editing — kein prompt()-Dialog, kein Panel-Wechsel
- Eigene Kataloge anlegen, kopieren, umbenennen, löschen
- **Hierarchie:** Welt → Gruppe → Untergruppe → Artikel (4 Ebenen)
- Artikel: Typ wählen (Stückzahl oder Mit Längen), Längen als klickbare Tags inline bearbeiten
- Alle Bestätigungs- und Eingabe-Dialoge sind eigene In-App-Modals (kein Browser-Popup)

### Pläne
- Mehrere Pläne (z.B. verschiedene Tours) anlegen, benennen, wechseln
- Jeder Plan hat eigene Positionen (z.B. Bühne, FOH, Halle)
- Jeder Plan kann einen eigenen Katalog verwenden
- **Katalog-Auswahl beim Import** — beim Laden einer Plan-JSON erscheint ein Modal zur Katalog-Wahl; Katalog kann auch direkt aus Datei nachgeladen werden

### Logos & Export
- 3 Logo-Slots im Header: **Planer/Company** (links) · **Band/Produktion** (mitte) · **Booking/Agentur** (rechts); Warning bei Logos > 500 KB
- **JSON-Export/Import** — vollständige Projektdaten inkl. Logos und Katalog
- **CSV Export** — alle Positionen in einer Datei, Positions-Name als erste Spalte, Excel-kompatibel (BOM)
- **PDF Export** — Design wählbar (Standard: dunkel mit Gold), Filter für Kategorien / nur befüllte Zeilen / Differenz-Spalte

---

## Bedienung

```
1. Welt-Tab wählen      Datenwelt / Stromwelt / Lichtwelt / Riggingwelt / Verbrauchswelt
2. "+ AUS KATALOG"      Wizard öffnet sich
3. Suchen oder wählen   Suchfeld oder Kategorie-Browse (Welt-Chips)
4. Artikel anklicken    Karte wird gold markiert (✓) — mehrere möglich
5. "N Artikel — WEITER →" Footer-Button erscheint sobald ≥1 gewählt
6. Mengen eingeben      Alle gewählten Artikel auf einem Bildschirm (Stk. + Spare)
7. "✓ HINZUFÜGEN"       Alle Artikel auf einmal ins Projekt übernehmen
8. Werte anpassen       Alle Felder direkt in der Tabelle editierbar
9. Speichern            Sidebar → Speichern (JSON) oder auto. im Browser
```

---

## Technisches

- **Vanilla JavaScript** — kein Framework, keine Dependencies
- **Aufgeteilte Dateien** — `css/` + `js/` + `index.html` (kein Build-Schritt)
- **Fonts** — Bebas Neue · Barlow Condensed · Share Tech Mono · IBM Plex Mono (Google Fonts)
- **Persistenz** — localStorage, kein Account nötig
- **Kompatibel** — Chrome, Firefox, Safari, Edge (aktuell)

---

## Dateistruktur

```
Materialliste-Licht/
├── index.html          ← HTML-Gerüst + Script-/Style-Tags
├── css/
│   ├── variables.css   ← Farben, Custom Properties
│   ├── layout.css      ← Header, Sidebar, App-Layout
│   ├── components.css  ← Buttons, Tabs, Tabellen
│   └── modals.css      ← Wizard, Katalog-Editor, Dialoge
├── js/
│   ├── utils.js        ← Hilfsfunktionen, In-App-Dialoge (showConfirm, showPrompt)
│   ├── catalog.js      ← Katalog-Konstante + Store
│   ├── state.js        ← Globaler State, save()
│   ├── calc.js         ← DIFF/TOTAL Berechnungen
│   ├── render.js       ← Tabellen-Rendering
│   ├── wizard.js       ← Wizard-Flow (Suche, Multi-Select)
│   ├── catalog-mgr.js  ← Katalog-Editor (Baum, Inline-Edit)
│   ├── logos.js        ← Logo-Upload
│   ├── plans.js        ← Multi-Plan-System
│   ├── positions.js    ← Positions-Bar
│   ├── export.js       ← JSON/CSV Import & Export
│   ├── pdf-themes.js   ← PDF_THEMES Array (Standard-Design)
│   ├── pdf.js          ← PDF-Druckansicht
│   └── init.js         ← App-Start
├── CLAUDE.md           ← Technische Dokumentation für Claude
└── README.md           ← Diese Datei
```

---

## TODOs & geplante Features

### Benutzerfreundlichkeit
- [ ] **Drag & Drop** — Sektionen und Zeilen per Drag umsortieren
- [ ] **Standardgruppen Lichtwelt** — Moving Lights, LED Wash, Konventionell im Built-in-Katalog
- [ ] **Undo / Redo** — letzte Änderungen rückgängig machen
- [ ] **Zeile duplizieren** — Eintrag kopieren und anpassen
- [ ] **Massenbearbeitung** — mehrere Zeilen gleichzeitig bearbeiten

### Import & Export
- [ ] **Import zusammenführen** — beim JSON-Import Daten mergen statt ersetzen
- [ ] **Excel-Export** — direkt als .xlsx
- [ ] **Differenzliste als PDF** — nur Positionen mit DIFF < 0
- [ ] **PDF Seitenumbrüche** — sauberere Trennung zwischen Kategorien

### Erweitert
- [ ] **Offline-Modus (PWA)** — App ohne Internet nutzbar
- [ ] **Mobile Optimierung** — bessere Bedienbarkeit auf Tablet
- [ ] **Backup-Verlauf** — mehrere automatische Sicherungspunkte

### Bereits umgesetzt ✓
- [x] Multi-Select im Wizard — mehrere Artikel auf einmal wählen und Mengen gemeinsam eingeben
- [x] Längen-Typen im Multi-Select — Checkboxen pro Länge mit je eigenem Stk./Spare
- [x] Gleiche Artikel-Namen in verschiedenen Gruppen erlaubt (internes `displayName`-System)
- [x] Live-Suchfeld mit Kategoriepfad-Anzeige
- [x] „Zuletzt verwendet"-Liste (letzte 8 Artikel)
- [x] In-App-Dialoge — keine nativen Browser-Popups mehr
- [x] Vollbild-Katalog-Editor mit Inline-Editing
- [x] Multi-Plan-System mit eigenen Positionen und eigenem Katalog pro Plan
- [x] Katalog-Auswahl beim Plan-Import (mit Option Katalog aus Datei laden)
- [x] CSV-Export aller Positionen mit Positions-Name als erste Spalte
- [x] PDF Theme-System (austauschbares Design für den Druck)

---

## Verwandte Projekte

- **[Personalplan / Tour Crew](https://m4dm0nky.github.io/Personalplan/tourplan.html)** — Crew-Einsatzplanung für dieselbe Tour

---

*Entwickelt mit Claude Code (Anthropic) · Touring Production Lichttechnik*
