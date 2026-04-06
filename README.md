# Materialliste Licht

**Touring Production · Material Management · Lichttechnik**

> Web-App für die Verwaltung von Kabeln, Zubehör, Hardware und Lampen auf Tour. 

---

## 🚀 Direkt starten

https://m4dm0nky.github.io/Materialliste-Licht/

---

## Was die App kann

### Material verwalten
- Leere Tabelle beim Start — Material wird über einen **Wizard aus dem Katalog** hinzugefügt
- Kabeltyp auswählen (z.B. DMX 5-Pin, CEE 63A Rot, Socapex) → Längen und Mengen eingeben → fertig
- Alle Felder nachträglich editierbar: Bezeichnung, Länge, # Stk., Spare, Im Projekt, Kapitel, Notiz
- Zeilen und Sektionen einzeln löschbar
- Eigene Längen die im Katalog fehlen direkt im Wizard ergänzen — werden dauerhaft gespeichert

### Excel-Logiken (1:1 aus XLTM übernommen)
- **DIFF = (# Stk. + Spare) − Im Projekt** → Grün ≥ 0 · Rot < 0 (zu buchen)
- **TOTAL = # Stk. + Spare**
- Warn-Badges pro Kategorie zeigen Anzahl roter Positionen
- Globaler Status-Indikator oben rechts

### 4 Kategorien mit vollständigem Katalog

| Kategorie | Inhalt |
|---|---|
| Kabel Liste | DMX 5/3-Pin, LK37, Ethercon, LWL, Cat, Han16/6, Socapex, Schuko, VL5, CEE 16A–125A, Erdung |
| Zubehör Liste | Alurohre, Drop Arms, Stative, Stahlzeug, Verbrauchsmaterial, System, Büro, Farbfolien |
| Hardware Liste | Dimmer, Feststrom VT, GrandMA2, Swisson, Cisco |
| Lampen Liste | Freie Slots für beliebige Lampentypen |

### Logos
- 3 Logo-Slots im Header: **Planer/Company** (links) · **Band/Produktion** (mitte) · **Booking/Agentur** (rechts)
- Logos werden mit dem Projekt gespeichert und erscheinen im PDF

### Speichern & Laden
- **JSON-Export/Import** — vollständige Projektdaten inkl. Logos als eine Datei
- **Mehrere Pläne** — verschiedene Projekte anlegen, benennen, wechseln
- **Automatische Sicherung** im Browser (localStorage)
- **CSV Export** — Excel-kompatibel mit BOM-Header

### PDF Export
- Druckansicht mit Header, Logos und Tabelle
- Filter: welche Kategorien · nur befüllte Zeilen · Differenz-Spalte an/aus
- A4 Querformat optimiert · Cmd+P / Strg+P → Als PDF speichern

### Katalog-Verwaltung
- Eigene Ergänzungen als JSON exportieren, extern bearbeiten, wieder importieren
- Einzelne Ergänzungen in der Übersicht löschbar
- Vollständiger Katalog jederzeit als JSON exportierbar

---

## Bedienung

```
1. Tab wählen          Kabel / Zubehör / Hardware / Lampen
2. "+ AUS KATALOG"     Wizard öffnet sich
3. Kabeltyp wählen     z.B. "DMX 5-Pin"
4. Mengen eingeben     10x 5m, 5x 10m, 2x Spare ...
5. "Hinzufügen"        Einträge erscheinen in der Tabelle
6. Werte anpassen      Alle Felder direkt editierbar
7. Speichern           Sidebar → Speichern (JSON) oder auto. im Browser
```

---

## Technisches

- **Single-File HTML** — alles in `index.html`, keine Dependencies
- **Kein Server** — direkt im Browser öffnen oder via GitHub Pages
- **Fonts** — Bebas Neue · Barlow Condensed · Share Tech Mono · IBM Plex Mono (Google Fonts)
- **Persistenz** — localStorage, kein Account nötig
- **Kompatibel** — Chrome, Firefox, Safari, Edge (aktuell)

---

## Dateistruktur

```
materialliste-licht/
├── index.html     ← Komplette App (HTML + CSS + JS, Single-File)
├── CLAUDE.md      ← Technische Dokumentation für Claude
├── README.md      ← Diese Datei
└── .gitignore
```

---

## TODOs & geplante Features

### Nächste Session
- [ ] **Drag & Drop** — Sektionen und Zeilen per Drag umsortieren
- [ ] **Import zusammenführen** — beim JSON-Import Daten mergen statt ersetzen
- [ ] **PDF Seitenumbrüche** — sauberere Trennung zwischen Kategorien
- [ ] **Lampen-Katalog** — eigene Datenbank für Lampentypen (wie Kabel-Katalog)

### Benutzerfreundlichkeit
- [ ] **Suche / Filter** — Freitextsuche über alle Einträge
- [ ] **Massenbearbeitung** — mehrere Zeilen gleichzeitig auswählen und bearbeiten
- [ ] **Undo / Redo** — letzte Änderungen rückgängig machen
- [ ] **Zeile duplizieren** — Eintrag kopieren und anpassen
- [ ] **Farbmarkierungen** — Zeilen manuell kennzeichnen (z.B. für Priorität oder Status)
- [ ] **Notizen-Feld** — ausklappbares Textfeld für längere Anmerkungen

### Import & Export
- [ ] **Excel-Export** — direkt als .xlsx exportieren (nicht nur CSV)
- [ ] **Differenzliste als PDF** — nur Positionen mit DIFF < 0 drucken
- [ ] **QR-Code** — Projekt als QR teilen
- [ ] **Druck Hochformat** — kompakte Listenansicht für A4 Hochformat

### Erweiterte Funktionen
- [ ] **Tourplan-Verknüpfung** — Showdaten und Venues aus dem Personalplan übernehmen
- [ ] **Kategorien anpassen** — eigene Tabs anlegen und umbenennen
- [ ] **Verfügbarkeits-Tracking** — Material als ausgeliehen / zurück / verloren markieren
- [ ] **Änderungsprotokoll** — wer hat wann was geändert
- [ ] **Kommentare pro Zeile** — Diskussion / Rückfragen direkt am Eintrag

### Technisch
- [ ] **Offline-Modus (PWA)** — App ohne Internet nutzbar machen
- [ ] **Mobile Optimierung** — bessere Bedienbarkeit auf Tablet
- [ ] **Tastaturnavigation** — zwischen Feldern mit Tab/Enter navigieren
- [ ] **Backup-Verlauf** — mehrere automatische Sicherungspunkte im Browser

---

## Verwandte Projekte

- **[Personalplan / Tour Crew](https://m4dm0nky.github.io/Personalplan/tourplan.html)** — Crew-Einsatzplanung für dieselbe Tour

---

*Entwickelt mit Claude (Anthropic) · Single-File HTML App · Touring Production Lichttechnik*
