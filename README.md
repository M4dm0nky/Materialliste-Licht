# Licht Materialliste V3

Touring Production Material Management Tool — web-based HTML app converted from `LichtMaterialliste_V3.xltm`.

## Features

- **Alle Excel-Logiken übernommen:**
  - `DIFF = (# Kabel + Spare) − Im Projekt` → Grün (OK) / Rot (zu buchen)
  - `TOTAL = # Kabel + Spare`
  - Sektions-Summen und Kategorie-Status
- **4 Kategorien:** Kabel Liste · Zubehör Liste · Hardware Liste · Lampen Liste
- **30+ Sektionen** mit allen Originaleinträgen aus der Vorlage
- **LocalStorage-Persistenz** — Daten bleiben im Browser gespeichert
- **CSV Export** mit Projektname und Datum
- **Alle Zeilen editierbar:** # Kabel, Spare, Im Projekt, Kapitel
- Status-Anzeige: globaler Warn-Indikator wenn Positionen rot (zu buchen)

## Usage

Einfach `index.html` im Browser öffnen — kein Server erforderlich.

## GitHub Pages

Nach dem Push automatisch erreichbar unter:
`https://<username>.github.io/<repo>/`

## Struktur

```
index.html   ← Komplette Single-File App (HTML + CSS + JS)
README.md    ← Diese Datei
```

## Formeln (aus Excel übernommen)

| Spalte | Excel-Formel | HTML-Logik |
|--------|-------------|------------|
| C (Differenz) | `=(E+F-G)` | `(anzahl + spare) - im_projekt` |
| D (Total) | `=(E+F)` | `anzahl + spare` |
| Sektionszeile C | `=SUM(C5:C20)` | Summe aller Differenzen |
| Kategoriecheck | `=IF(SUM=0,"ja","nein")` | Badge grün/rot |

