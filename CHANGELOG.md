# Changelog

Alle wichtigen Änderungen werden in dieser Datei dokumentiert.
Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [v0.4.0] — 2026-04-21

### Geändert
- `state.js`: Projektname wird jetzt auch im Plan-spezifischen localStorage-Key gespeichert → bleibt nach Reload erhalten
- `state.js`, `plans.js`, `index.html`: Datumsfeld neben Projektname entfernt
- `plans.js`: Sidebar und Header-Anzeige aktualisieren sich sofort beim Tippen des Projektnamens
- `render.js`: Neue „Gesamt"-Spalte (Stk. + Spare) in der qty-Tabelle

---

## [v0.3.9] — 2026-04-21

### Geändert
- `render.js`: Darstellungsfehler bei Tabellenzeilen behoben
- `CLAUDE.md` + `index.html`: Versionsnummer auf v0.3.9 gesetzt

---

## [v0.3.8] — 2026-04-21

### Geändert
- `catalog-mgr.js`: Kleinere Fixes im Katalog-Editor
- `modals.css`: CSS-Anpassung für Modals

---

## [v0.3.7] — 2026-04-21

### Geändert
- `catalog.js`: Katalog-Konstante überarbeitet und bereinigt
- `catalog-mgr.js`: Refactoring des Katalog-Editors (90+ Zeilen umgebaut)
- `LichtMaterialliste_V31_Katalog.json`: Katalogdaten komplett überarbeitet (ca. 380 Einträge bereinigt)

---

## [v0.3.6] — 2026-04-20

### Hinzugefügt
- `render.js`: Umfangreiches Rendering-Update (192 Zeilen neue Funktionalität)
- `catalog-mgr.js`: Katalog-Editor erweitert (38 neue Zeilen)
- `utils.js`: Weitere Hilfsfunktionen ergänzt
- `index.html`: Neue UI-Elemente hinzugefügt
- `css/components.css`, `css/modals.css`: Neue Styles

---

## [v0.3.5] — 2026-04-20

### Geändert
- `js/pdf.js`: PDF-Export überarbeitet
- `index.html`: PDF-Druckansicht angepasst

---

## [v0.2.2] — 2026-04-20

### Geändert
- `catalog-mgr.js`: Popup-Fixes im Katalog-Manager
- `css/modals.css`: Modal-Styles ergänzt

---

## [v0.2.1] — 2026-04-20

### Geändert
- `utils.js`: In-App-Dialog-Logik (showConfirm/showPrompt) weiterentwickelt
- `catalog-mgr.js`: Weitere Popup-Korrekturen
- `wizard.js`: Wizard-Stabilisierung
- `render.js`, `plans.js`, `positions.js`: Minor Fixes
- `index.html`: UI-Anpassungen (Buchungsbereich)

---

## [v0.1.6.1] — 2026-04-19

### Hinzugefügt
- `utils.js`: `showConfirm()` und `showPrompt()` — alle nativen Browser-Dialoge ersetzt
- `index.html`: HTML-Elemente `#appConfirmDialog` und `#appPromptDialog`
- Fehlerbehandlung für localStorage-Überlauf (`_showStorageError()` in catalog.js)

### Geändert
- 18 native `confirm()` / `prompt()` / `alert()` Aufrufe ersetzt in: render.js, positions.js, plans.js, wizard.js, catalog-mgr.js
- Fehlermeldungen jetzt über `toast(..., true)` (rot) statt Browser-Alert

---

## [v0.1.5] — 2026-04-19

### Geändert
- `catalog-mgr.js`: Katalog-Editor stark erweitert (80+ Zeilen neu, Inline-Editing verbessert)

---

## [v0.1.4] — 2026-04-19

### Hinzugefügt
- `wizard.js`: Mehrfachauswahl (`wiz.multiQueue[]`) — mehrere Artikel gleichzeitig wählen
- `wizard.js`: Suchfeld mit Live-Suche (Name + Items, Ergebnis mit Kategoriepfad)
- `wizard.js`: „Zuletzt verwendet"-Liste (localStorage `materialliste-licht-recent-v1`)
- `catalog-mgr.js`: Vollbild-Baum-Editor mit Inline-Editing (kein `prompt()` mehr)
- `css/modals.css`: Tree-Styles, Wizard-Suchfeld-Styles, Queue-Bar

### Geändert
- `catalog.js`: Katalog-Datenmodell aktualisiert

---

## [v0.1.0] — 2026-04-07 bis 2026-04-11

### Hinzugefügt
- Multi-Plan-System (`plans.js`): mehrere Pläne / Touren anlegen und wechseln
- Positions-Bar (`positions.js`): Positionen (Bühne, FOH, Halle …) pro Plan
- JSON-Export und -Import (`export.js`)
- CSV-Export mit BOM-Header für Excel-Kompatibilität
- PDF-Export im Querformat (`pdf.js`) mit Kategorie- und Zeilen-Filtern
- Logo-Verwaltung (`logos.js`): 3 Slots für Planer / Band / Booking
- 5-Welten-Navigation: Datenwelt · Stromwelt · Lichtwelt · Riggingwelt · Verbrauchswelt
- DIFF-Berechnung: `(Qty + Spare) − Im Projekt` → Grün ≥ 0 / Rot < 0
- Warn-Badges pro Kategorie und globaler Status-Indikator
- Sortierung nach Kabellänge (numerisch) beim Hinzufügen und Rendern
- Popup-Bearbeitungsmaske für bestehende Einträge

### Geändert
- Dateistruktur aufgeteilt: `css/` + `js/` + `index.html` (vorher Single-File)

---

## [v0.0.1] — 2026-04-03 bis 2026-04-06

### Hinzugefügt
- Initiales Projekt-Setup (Single-File-Version)
- Grundlegende Tabellenverwaltung für Lichttechnik-Equipment
- localStorage-Persistenz
