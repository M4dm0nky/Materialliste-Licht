# Changelog

Alle wichtigen Änderungen werden in dieser Datei dokumentiert.
Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [v0.6.16] — 2026-06-02

### Behoben
- `wizard.js`: Multi-Select Schritt 2 zeigt für Längen-Typen (z.B. "DMX 5-Pin") jetzt alle verfügbaren Längen als Checkbox-Zeilen mit je eigenem Stk./Spare-Feld — statt einer einzigen Mengenzeile. Längen werden numerisch sortiert angezeigt. `_wizDoneMulti()` speichert korrekt mit `unit_type:'lengths'` und den richtigen Längen-Werten.

---

## [v0.6.15] — 2026-06-02

### Neu
- `export.js` + `index.html`: **Katalog-Auswahl beim Plan-Import** — nach dem Einlesen einer Plan-JSON erscheint ein Modal „Welchen Katalog soll dieser Plan verwenden?" mit allen vorhandenen Katalogen als Radiobuttons und der Option, einen Katalog direkt aus einer Datei nachzuladen. Verhindert stilles Fallback auf den Standard-Katalog bei fehlendem Katalog (z.B. neuer Rechner / anderer Arbeitsplatz).
- `js/pdf-themes.js` (neu): **PDF Theme-System** — das aktuelle PDF-Design ist als „Standard"-Theme in ein separates globales `PDF_THEMES`-Array ausgelagert. Basis für spätere Design-Varianten beim PDF-Export.

---

## [v0.6.14] — 2026-06-02

### Behoben
- `wizard.js`: Multi-Select Schritt 2 zeigt jetzt Gruppen-Header (z.B. "· Gaffa Tape 50mm x 25m") vor den zugehörigen Artikeln, sodass klar ist, welche Farben zu welchem Tape-Typ gehören.

---

## [v0.6.13] — 2026-06-02

### Neu
- `wizard.js`: **Multi-Select im Wizard** — Artikel-Karten können jetzt mehrfach angeklickt werden (Toggle). Ausgewählte Karten erhalten goldenen Rahmen und "✓"-Prefix. Der Footer zeigt einen "N Artikel — WEITER →"-Button sobald ≥1 Artikel gewählt ist. Schritt 2 zeigt alle gewählten Artikel gleichzeitig mit je eigenem Stk./Spare-Feld. "✓ HINZUFÜGEN" speichert alle auf einmal.
- `wizard.js`: "← ZURÜCK" in Schritt 2 kehrt zu Schritt 1 zurück und erhält die aktuelle Selektion.

### Verbessert
- `wizard.js`: "0 Eintr."-Badge auf Karten wird ausgeblendet, wenn keine Sub-Items vorhanden sind (Gerät/Qty-Typen).
- `wizard.js`: Gruppen-Header im Browsegrid vergrößert (14px/700 statt 10px) und Untergruppen-Header (12px/600 statt 10px) für bessere Lesbarkeit.

---

## [v0.6.12] — 2026-06-02

### Behoben
- `catalog-mgr.js`: Gleiche Artikel-Namen in verschiedenen Gruppen jetzt erlaubt. Drei Stellen (`catTreeSaveAddArtikel`, `catTreeSaveRenameArtikel`, `_artEditSaveName`) prüfen Duplikate nun nur noch innerhalb derselben Gruppe. Bei Namenskonflikt in einer anderen Gruppe wird automatisch ein eindeutiger interner Key generiert (`Schwarz_2`, `Schwarz_3` …) und ein optionales `displayName`-Feld gesetzt, sodass der Benutzer überall immer den gewünschten Namen sieht.
- `wizard.js`, `render.js`: Alle Anzeigen (Wizard-Karten, Step-2-Header, Sektions-Titel im Projekt) nutzen `displayName || key`, sodass interne Schlüssel nie sichtbar sind.

---

## [v0.6.11] — 2026-06-02

### Behoben
- `render.js`: "NEUE LÄNGE / MATERIAL"-Button in `buildSecEl` nutzte `openWiz(ci)` statt `openWizToSec(ci,si)` — dadurch hatte der Wizard kein `targetSi` gesetzt und `wizDone()` fand via `findIndex` immer die **erste** Sektion mit passendem `type_name`. Artikel wie "Schwarz" wurden in die falsche Sektion eingetragen oder dort fusioniert, statt in der gewünschten Sektion neu angelegt zu werden. Fix: Button ruft jetzt `openWizToSec(ci,si)` auf, sodass der Wizard immer die richtige Sektion anspricht.

---

## [v0.6.10] — 2026-05-27

### Behoben
- `export.js`: Custom-Katalog wird beim JSON-Export eingebettet (`catalog`-Key); beim Import wird ein fehlender Katalog aus dem JSON wiederhergestellt und in `catalogsStore` registriert — `_migrateSectionWorlds()` kann damit Sections korrekt in die Welt des Katalogs verschieben, auch wenn der Katalog lokal nicht vorhanden ist
- `plans.js`: `switchPlan()` setzt `activeCatalogId` jetzt VOR `loadPlanFromLS()`, sodass `_migrateSectionWorlds()` beim Plan-Wechsel den richtigen Katalog verwendet

---

## [v0.6.9] — 2026-05-27

### Behoben
- `plans.js`: `_migrateSectionWorlds()` — Sections werden beim Laden automatisch in die laut Katalog korrekte Welt verschoben; verhindert, dass Typen nach einer Welt-Änderung im Katalog-Manager noch in der alten Welt erscheinen
- `wizard.js`: `_doCloseWiz()` ruft `_migrateSectionWorlds()` + `save()` auf wenn der Katalog-Manager geschlossen wird — Welt-Korrekturen sind sofort sichtbar und persistent

---

## [v0.6.8] — 2026-05-27

### Geändert
- `pdf.js`: PDF-Design auf App-eigenen Stil zurückgesetzt — IBM Plex Mono + Bebas Neue, schwarzer Positionsbalken mit goldenem Span, simpler 3-spaltiger Header ohne NYX-CI-Branding; NYX-CI-Stand als Git-Tag `pdf-nyx-ci-v0.6.7` gesichert

---

## [v0.6.7] — 2026-05-27

### Behoben
- `pdf.js`: `diffHeader` wurde innerhalb der positions-Loop referenziert, aber erst danach als `const` deklariert (Temporal Dead Zone) → `generatePDF()` warf ReferenceError → Druckfenster öffnete sich nicht; Fix: Deklaration vor die Loop verschoben

---

## [v0.6.6] — 2026-05-27

### Geändert
- `pdf.js`: Jede Position bekommt eine eigene Tabelle mit eigenem `<thead>` — Positionsname (z.B. "DIMMERCITY") steht jetzt über den Spaltenköpfen, nicht darunter; beide Zeilen wiederholen sich bei Seitenumbrüchen automatisch; 6mm Abstand zwischen Positionen

---

## [v0.6.5] — 2026-05-27

### Geändert
- `pdf.js`: Positionsbalken im PDF-Export verkleinert — `font-size` 22pt → 13pt, `padding` 12px → 7px; fügt sich jetzt proportional in das Gesamtlayout ein

---

## [v0.6.4] — 2026-05-27

### Behoben
- `wizard.js`: `_doCloseWiz()` erkennt jetzt ob der Katalog-Manager geschlossen wurde (`catmgr-mode`) und löst `rerenderCat()` für alle Welten aus — Katalog-Änderungen (z.B. umbenannte Typen) sind sofort in der Planung sichtbar ohne Seitenreload

---

## [v0.6.3] — 2026-05-27

### Behoben
- `render.js`: Items ohne Länge (Adapter/Verbinder in Längen-Sektionen) werden jetzt ans Ende sortiert statt an den Anfang — konsistenteres Rendering bei gemischten Katalog-Typen wie "Stromkabel Han16" (Kabel + Verbinder)
- `wizard.js`: `_mergeItems()` verwendet dieselbe Sortierlogik
- `render.js`: `lenPlaceholder` in `buildRow` zeigt jetzt immer "Länge/Typ…" statt fälschlich den Item-Namen — verhindert verwirrende Anzeige wenn ein Item kein Länge-Feld hat

---

## [v0.6.2] — 2026-05-27

### Hinzugefügt
- `catalog-mgr.js`: `→ Gruppe`-Button an ungruppierten Artikel-Typen — erstellt in einem Klick eine gleichnamige Gruppe und ordnet den Artikel darin ein; neue Funktion `catTreeTypeToGroup()`

---

## [v0.6.1] — 2026-05-27

### Behoben
- `catalog-mgr.js`: Untergruppen haben jetzt einen `↑ Gruppe`-Button — damit kann eine Untergruppe zur eigenständigen Top-Level-Gruppe hochgestuft werden, die dann selbst Untergruppen aufnehmen kann; neue Funktion `catTreePromoteToGroup()`

---

## [v0.6.0] — 2026-05-27

### Geändert
- `catalog-mgr.js` + `modals.css`: Katalog-Manager als Fullscreen-Seite (100vw/100vh) statt 960px-Modal; die zwei Tabs wurden aufgelöst — links Katalogliste, rechts Baum-Editor, beide gleichzeitig sichtbar
- `wizard.js`: `_doCloseWiz()` entfernt `catmgr-mode`-Klasse beim Schließen

---

## [v0.5.9.38] — 2026-05-27

### Hinzugefügt / Behoben
- `render.js`: Render-Bug behoben — Längen-Sektionen die einer Untergruppe zugeordnet sind, wurden bisher komplett nicht gerendert (unsichtbar); jetzt erscheinen sie korrekt mit Untergruppen-Header unterhalb der Eltergruppe
- `render.js`: Qty-Sektionen zeigen Untergruppen jetzt als eigene Zeilen-Header innerhalb des Gruppen-Blocks; legacy `weltDepth===3`/`subgroup`-Textfeld-Logik durch die `parentId`-Hierarchie ersetzt
- `catalog-mgr.js`: `+UG`-Button zum Anlegen von Untergruppen ist jetzt ausgeschrieben (`+ Untergruppe`) und visuell hervorgehoben statt winzigem `+UG`-Label
- `components.css` + `modals.css`: CSS für `.subgrp-section-hdr` (Untergruppen-Trennzeile in Längen-Ansicht) und `.tree-btn-ug` hinzugefügt

---

## [v0.5.9.37] — 2026-05-26

### Behoben
- `export.js` + `plans.js`: Datenverlust beim JSON-Import wenn Projekt mit anderem Katalog erstellt wurde — `catalogId` wird jetzt im exportierten JSON gespeichert und beim Import aufgelöst; Migration in `migrateState()` löscht keine expliziten `lengths`-Sections mehr; Auto-Registrierung korrigiert fehlerhafte `qty`-Einträge im Katalog wenn die importierten Daten `lengths` tragen

---

## [v0.5.9.36] — 2026-05-26

### Behoben
- `pdf.js`: Closing-Page-Architektur korrigiert — `page-break-before:always` zurück, damit slim-footer (`<tfoot>`) nicht auf der ABSCHLUSS-Seite erscheint (closing-page liegt außerhalb der outer-Tabelle); `height:281mm` + `justify-content:flex-end` zurück, damit der dicke Balken am unteren Seitenrand sitzt

---

## [v0.5.9.35] — 2026-05-26

### Behoben
- `pdf.js`: Abschluss-Balken erschien immer auf einer eigenen leeren Seite — `page-break-before:always` und `height:281mm` entfernt; Footer fließt jetzt auf die letzte Inhaltsseite (16mm Abstand zum letzten Block, `break-inside:avoid` hält ihn zusammen)

---

## [v0.5.9.34] — 2026-05-26

### Verbessert (NYX DESIGNAI)
- `css/variables.css`: 2 neue Hintergrundebenen `--bg-input:#232740` und `--bg-elevated:#2c3155` nach NYX-Spec (5-Layer-System)
- `css/components.css`: `thead{position:sticky;top:0;z-index:5}` — Tabellenkopf bleibt beim Scrollen sichtbar
- `css/components.css`: DIFF-Zeilen erhalten Farbbalken via `color-mix()` — rote Zeilen bei negativem DIFF, grüne bei positivem (`has-data`-Klasse als Guard)
- `css/components.css`: Gold-Border-Reveal auf Hover für `.tdname` und `.qty-table .tdname`; Grün-Border für `.tdtext` — NYX-Editier-Affordanz-Pattern

---

## [v0.5.9.33] — 2026-05-22

### Behoben
- `pdf.js`: BEZEICHNUNG-Spalte Text-Overflow — `overflow:hidden` auf `.ntd`; `overflow-wrap:break-word` allein wird von Chrome-Print bei `table-layout:fixed` ignoriert; `overflow:hidden` clipped zuverlässig an der Spaltengrenze

---

## [v0.5.9.32] — 2026-05-22

### Behoben
- `pdf.js`: Text-Overflow in BEZEICHNUNG-Spalte — `overflow-wrap:break-word` erzwingt Zeilenumbruch bei Spaltenende; mit `table-layout:fixed` floss langer Text sonst in Nachbarspalten über

---

## [v0.5.9.31] — 2026-05-22

### Behoben
- `pdf.js`: BEZEICHNUNG-Spalte wirklich breit — `table-layout:fixed` auf inner Content-Table + `<colgroup>` mit mm-Breiten; erster `<col>` (BEZEICHNUNG) ohne Breite füllt alles Übrige; v0.5.9.30 hatte `width:1%` auf `<td>` mit `table-layout:auto` verwendet, was Chrome ignoriert

---

## [v0.5.9.30] — 2026-05-22

### Behoben
- `pdf.js`: BEZEICHNUNG-Spalte jetzt maximal breit — CSS-Trick `width:1%;white-space:nowrap` auf alle Zahl-/Typ-/Kapitel-Zellen; `.ntd{width:100%}` füllt automatisch den gesamten verbleibenden Raum; `colgroup` mit fixen Prozenten entfernt (wurde von Chrome mit `table-layout:auto` ignoriert)

---

## [v0.5.9.29] — 2026-05-22

### Behoben
- `index.html`: PDF-Modal — "Hochkant" (portrait) als Standard vorausgewählt; `checked` war noch auf "Querformat" (landscape)

---

## [v0.5.9.28] — 2026-05-22

### Geändert
- `pdf.js`: Komplett-Redesign PDF-Layout (8 Korrekturen):
  1. **Portrait als Default** — `|| 'landscape'` → `|| 'portrait'`
  2. **Nur 2 Logos** — `lbPlaner` entfernt, nur `lbBand` + `lbBooking` im Header
  3. **BEZEICHNUNG-Spalte breit** — `<colgroup>` mit 40% Breite für Bezeichnung (war: gleichmäßig verteilt → Texte gequetscht)
  4. **Chapter-Header groß** — `.pos-hdr td` font-size 14pt → 22pt, bolder
  5. **Subsection-Hierarchie** — `.grp-hdr` erhält gelben linken Akzentbalken (`border-left:4px solid #f7c948`); `.sec-hdr` dezenter grauer Balken links
  6. **Keine erzwungenen Seitenumbrüche** — `page-break-before:always` pro Chapter entfernt; `page-break-inside:avoid` auf Chapter-tbody statt Forced-Break; Kapitel teilen Seiten wenn Platz vorhanden
  7. **Slim-Footer via `<tfoot>`** — `position:fixed;bottom:0` → `<tfoot>` der outer-table (wie `<thead>` für Band); erscheint zuverlässig auf Inhaltsseiten, NICHT auf Closing-Page
  8. **Closing-Page bereinigt** — "Export vollständig."-Block entfernt; `.closing-flex{height:281mm;justify-content:flex-end}` schiebt dunklen Footer-Block ans Seitenende; keine separate slim-footer-Leiste mehr auf der letzten Seite

---

## [v0.5.9.27] — 2026-05-22

### Behoben
- `pdf.js`: Abschluss-Seite auf Flex-Layout (NYX_CI-Pattern) umgestellt — `<table height:100%>` auf td-Ebene verteilte den Platz nicht korrekt (Chrome interpretierte `height:100%` als volle Tabellenhöhe für diese Zeile → Footer-Zeile overflow auf Extra-Seite); Fix: `<div class="closing-flex" style="height:272mm; display:flex; flex-direction:column; justify-content:space-between">` — explizite Höhe (nicht `min-height`) + `justify-content:space-between` nach NYX_CI-Colophon-Pattern

---

## [v0.5.9.26] — 2026-05-22

### Behoben
- `pdf.js`: Leere Extra-Seite nach Abschluss-Seite entfernt — `@page{margin:8mm 0 8mm 0}` gibt 281mm bedruckbare Höhe; `body{padding-bottom:9mm}` + `closing-table{height:281mm}` = 290mm → 9mm Overflow erzeugte Leerseite; Fix: `height:272mm` (281mm − 9mm body-padding = exakt eine Seite, kein Overflow)

---

## [v0.5.9.25] — 2026-05-22

### Behoben
- `pdf.js`: Abschluss-Seite komplett auf table-basiertes Layout umgestellt — `position:absolute` wird von Chrome im paginierten Print-Kontext ignoriert; `.closing-table{height:281mm}` mit zwei Rows: erste Row `height:100%` (füllt Seite), zweite Row `vertical-align:bottom;padding-bottom:9mm` pinnt den Abschluss-Block zuverlässig ans Seitenende

---

## [v0.5.9.24] — 2026-05-22

### Behoben
- `pdf.js`: Abschluss-Balken auf letzter PDF-Seite korrekt am Seitenende — `min-height:281mm + display:flex + margin-top:auto` durch `height:281mm + position:relative + position:absolute;bottom:9mm` ersetzt (NYX_CI-Pattern); Chrome kollabierte den Flex-Container auf Content-Höhe und ignorierte `min-height` im Print-Kontext

---

## [v0.5.9.23] — 2026-05-22

### Geändert
- `css/components.css`: Gruppen-Header (`.grp-section-hdr`) strukturell aufgewertet — `font-size` 1rem → 1.4rem, `letter-spacing` 3px → 5px, `padding` 7/14px → 13/16px, `border-left` 3px → 5px, `margin-top` 2px → 10px; Chevron jetzt in Accent2; App-Hierarchie entspricht jetzt der PDF-Darstellung (Gruppen-Header größer als Sektions-Header)

---

## [v0.5.9.22] — 2026-05-22

### Geändert
- `pdf.js`: Closing-Section aus outer `<table>` herausgelöst — `.closing-page` jetzt auf Body-Ebene statt innerhalb `<td>`; `min-height:281mm` + Flexbox funktioniert außerhalb von Table-Kontext zuverlässig in Chrome Print; eigenes Band-HTML in closing-page dupliziert

---

## [v0.5.9.21] — 2026-05-22

### Geändert
- `pdf.js`: Abschluss-Footer ans Seitenende fixiert — `closing-content` + `closing-footer` in `.closing-page` wrapper eingeschlossen; `page-break-before:always` erzwingt eigene Seite, `min-height:258mm` + Flexbox + `margin-top:auto` schiebt dunklen Abschluss-Block ans untere Seitenende

---

## [v0.5.9.20] — 2026-05-21

### Geändert
- `pdf.js`: NYX-Band von `position:fixed` auf `<thead>`-Architektur umgestellt — Band wiederholt sich auf jeder Seite via nativen CSS-Print-Mechanismus, kein Konflikt mit Chrome-Margin-Bereich; `@page{margin:8mm 0 8mm 0}` lässt Chromes Header/Footer in 8mm-Margin-Zonen (getrennt von Content-Bereich); Slim-Footer bleibt `position:fixed` aber korrekt unterhalb der Content-Area-Grenze

---

## [v0.5.9.19] — 2026-05-21

### Geändert
- `pdf.js`: `@page{margin:0mm}` + `body{padding-top:14mm;padding-bottom:9mm}` in `@media print` — Band/Footer landen jetzt am physischen Seitenrand statt im CSS-Content-Bereich; Chrome-Text-Dekorationen landen hinter unserem navy Band
- `pdf.js`: `.np` Hinweisbox auf Amber-Warning-Stil aktualisiert mit Chrome-spezifischer Anweisung zum Deaktivieren von "Kopf- und Fußzeilen"
- `index.html`: PDF-Modal erhält denselben Chrome-Tipp vor dem Öffnen des Druckfensters

---

## [v0.5.9.18] — 2026-05-21

### Geändert
- `pdf.js`: Browser-eigene Druck-Header/-Footer unterdrückt via CSS `@page` Margin Boxes (`@top-left{content:""}` etc.) — Chrome zeigte "about:blank" und Seitenzahlen unterhalb des Slim Footers auf jeder Seite; Versions-Bug behoben: `&#9670; v0.5.9.15` im Closing Footer war HTML-Entity statt Unicode-Zeichen und wurde nie aktualisiert

---

## [v0.5.9.17] — 2026-05-21

### Geändert
- `pdf.js`: `print-color-adjust:exact` hinzugefügt — ohne diese Property druckt Chrome keine Hintergrundfarben (navy Band, Tabellenheader, Closing Footer verschwanden im Druck); Font-Loading-Fix: `document.fonts.ready` Promise statt 500ms Hardcode-Timeout damit Geist/JetBrains Mono vor dem Drucken geladen sind

---

## [v0.5.9.16] — 2026-05-21

### Geändert
- `pdf.js`: 3 Print-Bugs behoben — (1) CSS `counter(page)`/`counter(pages)` entfernt (funktionierten nicht in Chrome Print, zeigten "0/0"), rechte Spalte Slim Footer zeigt jetzt Datum; (2) NYX Primary Logo: `width`/`height` Attribute aus SVG-Root entfernt damit `height:22mm` in CSS korrekt greift; (3) `.ph{padding-top:2mm}` in `@media print` gegen Band-Überlappung auf Seite 1

---

## [v0.5.9.15] — 2026-05-21

### Geändert
- `pdf.js`: PDF-Export nach NYX CI Reference-PDF pixelgenau umgebaut — NYX `horizontal-dark.svg` und `primary-dark.svg` als Inline-SVG eingebettet (kein Netzwerk nötig); Top Band zeigt NYX-Logo links statt User-Logo; Header: alle 3 User-Logos rechts ohne invert-Filter; Slim Footer: 3-spaltig (NYX | Projektname | SEITE X / Y); neue "Export vollständig."-Section (Geist 28pt, weiß, fließt nach Tabelle); Closing Footer: navy 3-spaltig (Stats+Version+Datum | NYX Primary-Logo | Projektname+Final), kein page-break-before

---

## [v0.5.9.14] — 2026-05-21

### Geändert
- `pdf.js`: Top Band jetzt `position:fixed` im Druck → erscheint auf jeder Seite; `@page{margin:14mm 0mm 9mm 0mm}` verhindert Content-Überlap; Closing Footer (36mm, navy, 3-spaltig: Metadaten | Logo | Signatur) auf eigener letzter Seite ergänzt

---

## [v0.5.9.13] — 2026-05-21

### Geändert
- `pdf.js`: PDF-Export komplett nach NYX Lightwork CI umgebaut — Fonts: Geist + JetBrains Mono; Farben: Void #0b0d14 / Paper #fff / Hairline #D6D9DE; kein Yellow im UI; Top Band (14mm navy), Header (Geist 26pt), Stat Strip (3 Werte: Positionen / Items / Fehlend), Data Table (CI-Typografie), Slim Footer (9mm navy)

---

## [v0.5.9.12] — 2026-05-21

### Geändert
- `plans.js`: State-Migration hinzugefügt — Sections deren Katalog-Typ jetzt `qty` ist, aber noch `length`-Werte in Items haben, werden beim Laden automatisch bereinigt (length auf '' gesetzt, unit_type korrigiert). Behebt "MARTIN MAC Viper XIP zeigt noch eine Länge".

---

## [v0.5.9.11] — 2026-05-21

### Geändert
- `catalog.js`: Vollständiger Katalog-Audit — Verbrauchsmaterial, System & Sonderzubehör und Farbfolien LEE korrekt auf qty-type gestellt (Spezifikationen wie "3m breit", "5l", "20kg", "Rolle/Geschnitten" in b-Feld verschoben)
- `catalog.js`: Lichtwelt-Migration auf smart umgestellt (respektiert Typen mit echten Längen); neue datengetriebene Migration als Sicherheitsnetz

---

## [v0.5.9.10] — 2026-05-21

### Geändert
- `catalog.js`: Zweite Migration — erzwingt `unit_type:'qty'` für ALLE Custom-Typen mit `cat:'Lichtwelt'` (behebt auch benutzerdefinierte Fixture-Typen wie "MARTIN MAC Viper XIP")
- `wizard.js`: Typname in Wizard Step 2 auf 16px fett gold vergrößert (gilt für qty- und lengths-Wizard)

---

## [v0.5.9.9] — 2026-05-21

### Geändert
- `catalog.js`: Migration erzwingt `unit_type:'qty'` für alle reinen Geräte-Typen (Moving Lights, Stative, DMX Steuerung etc.) in allen User-Katalogen — behebt falsch als "Kabel" gespeicherte Fixture-Einträge

---

## [v0.5.9.8] — 2026-05-21

### Geändert
- `css/components.css`: TOTAL + DIFF von 20px → 17px (fett bleibt); STK/SPARE/IM PROJ. Inputs font-weight 600/700 → 400 (normale Schriftdicke)
- `css/components.css`: Qty-Tabelle (Multicore etc.) an Längen-Tabelle angeglichen — Inputs 18px/bold → 15px/normal, DIFF 16px → 17px

---

## [v0.5.9.7] — 2026-05-21

### Geändert
- `render.js`: Spaltenreihenfolge in Längen-Tabelle umgestellt — Logik jetzt: Bezeichnung | Länge/Typ | # Stk. | Spare | **TOTAL** | Im Projekt | **DIFF** | Kapitel
- `css/components.css`: TOTAL und DIFF jetzt 20px fett (gleichwertig prominent); # Stk. / Spare / Im Projekt kleiner (15px)

---

## [v0.5.9.6] — 2026-05-21

### Geändert
- `wizard.js`: `_step2Lengths()` sortiert Längen jetzt defensiv vor dem Rendern — neu hinzugefügte Längen erscheinen immer numerisch sortiert, nicht mehr am Ende

---

## [v0.5.9.5] — 2026-05-21

### Geändert
- `render.js`: Spalte LÄNGE/TYP zeigt bei leerer Länge den Artikel-Namen als Placeholder statt "Länge…" — betrifft alle Stück-Artikel ohne Längenangabe (z.B. Omegaschäkel, Magic Arm, Schellen)

---

## [v0.5.9.4] — 2026-05-21

### Hinzugefügt
- `wizard.js`: Welt-Filter-Chips im Global-Such-Modus — klickbar, toggle-fähig, gold wenn aktiv
- `wizard.js`: `wizSetBrowseWorld()` — Browse-Modus zeigt alle Einträge der gewählten Welt ohne Tipp-Suche
- `wizard.js`: Kombinierbar: Welt-Chip aktiv + Suche tippen → filtert nur innerhalb dieser Welt
- `css/modals.css`: `.wiz-world-chips`, `.wiz-world-chip`, `.wiz-world-chip.active`

---

## [v0.5.9.3] — 2026-05-21

### Geändert
- `render.js`: Kein „+ MATERIAL HINZUFÜGEN"-Button mehr — nur noch „🔍 MATERIAL SUCHEN" (grün) am Panel-Ende
- `render.js`: Empty-State-Text aktualisiert auf neuen Workflow (suchen statt hinzufügen)

---

## [v0.5.9.2] — 2026-05-21

### Hinzugefügt
- `wizard.js`: Neue Funktion `openWizSearch()` — öffnet den Wizard im Global-Such-Modus (`ci = -1`), ohne Welt-Vorfilter
- `render.js`: Neuer Button „🔍 MATERIAL SUCHEN" neben allen „+ MATERIAL HINZUFÜGEN"-Buttons (Empty State + Welt-Panel-Footer)
- `css/components.css`: `.btn-outline` Stil für gedämpfte Sekundär-Buttons
- `css/modals.css`: `.wiz-search-hint` Platzhaltertext wenn Global-Suche noch leer ist

### Geändert
- `wizard.js`: `step1()` und `wizBuildGrid()` handhaben `ci = -1` korrekt (kein World-Filter, kein `currentCats()[-1]`-Crash)

---

## [v0.5.9.1] — 2026-05-21

### Hinzugefügt
- `catalog.js`: Neue Katalogeinträge „Pipe Alu" und „Pipe Stahl" in der Riggingwelt, Längen 0,5m / 1m / 1,5m / 2m / 2,5m
- `catalog.js`: Migration in `initCatalogs()` — neue Pipe-Typen werden automatisch in alle vorhandenen Kataloge eingetragen

---

## [v0.5.9] — 2026-05-20

### Geändert
- `wizard.js`: Wizard-Flow komplett vereinfacht — Karte anklicken öffnet sofort die Mengen-Eingabe, kein Multi-Queue mehr
- `wizard.js`: Nach "✓ HINZUFÜGEN" schließt der Wizard — für den nächsten Artikel erneut "Material hinzufügen" klicken
- `wizard.js`: Schrittanzeige reduziert auf 2 Schritte (TYP WÄHLEN → MENGEN EINGEBEN)
- `wizard.js`: Entfernt: Multi-Queue, Queue-Bar, "WEITER →"-Button, Mehrfachauswahl, Fortschrittsanzeige

---

## [v0.5.8] — 2026-05-20

### Behoben (Root Cause)
- `wizard.js`: Kabel-Items wurden im alten Format erstellt — Länge landete in BEZEICHNUNG statt LÄNGE/TYP
  - Ursache: `displayName = ci2.n || ci2.l` verwendete die Länge ("5m") als Namen wenn kein Artikel-Name im Katalog gesetzt war
  - Fix: `displayName = ci2.n || wiz.key` (Typname als Fallback), `displayLen = ci2.l` (Länge immer in length-Feld)
  - Betrifft alle Standard-Katalog-Kabel (DMX, Schuko, CEE, etc.) mit leerem `n`-Feld

---

## [v0.5.7] — 2026-05-20

### Behoben
- `plans.js`: Migration beim Laden bereinigt automatisch doppelte Einträge in bestehenden Plänen — gleiche Kabellängen und gleiche Gerätenamen werden zusammengeführt und Mengen addiert

---

## [v0.5.6] — 2026-05-20

### Behoben
- `wizard.js`: Merge-Logik auf alle Artikeltypen ausgeweitet — auch Geräte (qty) werden beim erneuten Hinzufügen addiert statt ersetzt; `_mergeItems()` matcht qty-Artikel per Name, Kabel per Länge

---

## [v0.5.5] — 2026-05-20

### Behoben
- `wizard.js`: Gleiche Kabellänge doppelt gebucht erzeugte zwei separate Zeilen — jetzt werden Mengen zusammengerechnet (`_mergeItems()`): beim erneuten Hinzufügen einer bereits vorhandenen Länge wird Anzahl und Spare addiert statt eine neue Zeile anzulegen

---

## [v0.5.4] — 2026-05-20

### Behoben (kritisch — Kernlogik)
- DIFF-Formel korrigiert: `Im Projekt − (Anzahl + Spare)` ist die richtige Berechnung
  - Negativ (rot) = du hast weniger geliefert bekommen als du brauchst → Fehlmenge
  - Positiv (grün) = du hast mehr als genug → Überschuss
- `xdiff()` in calc.js und inline-Berechnung in render.js angepasst
- CLAUDE.md-Spec entsprechend aktualisiert
- v0.5.3 hatte die Formel in die falsche Richtung "korrigiert" — dieser Fix revidiert das

---

## [v0.5.3] — 2026-05-20

### Behoben (kritisch)
- PDF-Export: DIFF-Formel war seit v0.5 invertiert (`Im Projekt − Anzahl − Spare` statt `Anzahl + Spare − Im Projekt`) — Farben im PDF waren dadurch vertauscht (grüne Positionen rot angezeigt und umgekehrt)
- PDF-Export: Filter „Nur fehlende Positionen" zeigte durch die invertierte Formel die falschen Items — jetzt korrekt via `xdiff()` aus calc.js
- Beide Fixes bringen PDF-Logik in Übereinstimmung mit Haupt-App und CLAUDE.md-Spec

---

## [v0.5.2] — 2026-05-20

### Verbessert
- PDF-Export: `Nur fehlende Positionen` aktiviert jetzt automatisch die DIFF-Spalte
- PDF-Export: Toast-Meldung wenn keine fehlenden Positionen gefunden wurden (statt leerem PDF)
- Katalog: 3 Fixtures in korrekte Lichtwelt-Gruppen verschoben (Martin Mac Aura XB → Wash, Clay Paky B-EYE K20 → Wash, Chauvet COLORado Solo Batten → LED Wash & Batten)
- Katalog: GrandMA3 Full/Light/Compact/Nodes ergänzt (Datenwelt)
- Katalog: Martin MAC Viper Performance ergänzt (Moving Light Spot)
- Katalog: Ayrton Perseo Beam ergänzt (Moving Light Beam)

---

## [v0.5.1] — 2026-05-20

### Neu
- PDF-Export: Checkbox „Nur fehlende Positionen (DIFF < 0)" — PDF enthält ausschließlich Positionen wo Im Projekt < Anzahl + Spare
- Katalog Lichtwelt: 6 neue Standardgruppen — Moving Light Spot, Moving Light Wash, Moving Light Beam, LED Wash & Batten, Konventionell, Spezialeffekte (56 Fixtures)

---

## [v0.5] — 2026-04-22

### Neu
- PDF-Export: Seitenausrichtung wählbar (Querformat / Hochkant) direkt im Export-Modal
- PDF-Export: Differenz-Spalte (DIFF) standardmäßig eingeblendet — negative Werte rot, positive grün
- PDF-Export: DIFF-Berechnung geändert auf `Im Projekt − (Anzahl + Spare)`

---

## [v0.4.10] — 2026-04-21

### Behoben
- `catalog.js` / `init.js`: Katalog-Zuweisung pro Plan wurde nach Reload nicht wiederhergestellt — Backup-Key `materialliste-active-catalog` sichert die aktive Katalog-ID zusätzlich zur Plan-Metadaten; Validierung beim Start prüft ob der Katalog noch existiert
- `catalog-mgr.js`: Neuer Katalog wurde nicht automatisch dem aktiven Plan zugewiesen — nach dem Erstellen wird `setActivePlanCatalog` direkt aufgerufen, kein manueller „VERWENDEN"-Klick mehr nötig
- `plans.js`: Kabel-Items im alten Format (`name="3m"`, `length=""`) wurden im Materialplaner falsch dargestellt (Länge in BEZEICHNUNG statt LÄNGE/TYP) — Migration in `migrateState()` normalisiert alle betroffenen Einträge beim nächsten Seitenload automatisch; fehlerhafte Gegenmigration (Commit 4df44e7) entfernt

---

## [v0.4.9] — 2026-04-21

### Behoben
- `render.js`: Löschen-Dialog zeigte bei qty-Artikeln ohne Namen „diese Zeile" — jetzt wird der Sektions-Typname als Fallback verwendet (z.B. „MAJOR DMX Booster…")

---

## [v0.4.8] — 2026-04-21

### Behoben
- `render.js`: qty-Artikel konnten nicht vollständig gelöscht werden — nach Löschung des Items blieb die Sektion mit Null-Zeile übrig, zweiter ✕-Klick crashte lautlos (TypeError). Fix: qty-Sektionen werden jetzt automatisch mitgelöscht wenn das letzte Item entfernt wird; Guard gegen undefined-Item ergänzt

---

## [v0.4.7] — 2026-04-21

### Behoben
- `plans.js`: Projektname blieb nach Plan-Wechsel leer — Fallback auf Plan-Index-Namen wenn `_project` im Datensatz fehlt
- `state.js`: Plan-Index-Name wurde mit leerem String überschrieben wenn `pName`-Input leer war — Schutz ergänzt

---

## [v0.4.6] — 2026-04-21

### Behoben
- `wizard.js`: "✓ FERTIG" zeigte fälschlich "Änderungen verwerfen?"-Dialog — `wizFinish()` nutzt jetzt `_doCloseWiz()` direkt statt `closeWiz()`

---

## [v0.4.5] — 2026-04-21

### Behoben
- `plans.js`: Projektname zeigte "undefined" beim Wechsel zwischen Plänen — `savePlanToLS` speicherte `project`/`date` statt `_project`/`_date`; Fallback für bereits gespeicherte Daten ergänzt

---

## [v0.4.4] — 2026-04-21

### Geändert
- `wizard.js`: Suche durchsucht jetzt Name, Länge und Bemerkung eines Artikels separat — kein Übersehen mehr wenn z.B. nur der Name "Bühnenlüfter" ohne Längeneintrag gesucht wird
- `wizard.js`: Menge bei qty-Artikeln startet auf 1 (statt 0), Vorschau aktualisiert sich sofort
- `wizard.js`: Beim Ankreuzen einer Länge springt die Menge automatisch auf 1

---

## [v0.4.3] — 2026-04-21

### Geändert
- `catalog-mgr.js`: Katalog-Export öffnet jetzt "Speichern unter"-Dialog statt sofort herunterzuladen
- `export.js`: Speichern-Button merkt sich das File-Handle — zweites Speichern überschreibt direkt ohne Dialog
- `export.js`: Nach Import wird Handle zurückgesetzt (neues Projekt → erneute Standortwahl)
- `state.js`, `index.html`: Status-Pill ("ALLES OK") ersetzt durch Autosave-Zeitstempel oben rechts
- `calc.js`: Globale Statusanzeige entfernt (Tab-Badges zeigen Warnungen weiterhin)

---

## [v0.4.2] — 2026-04-21

### Geändert
- `pdf.js`: Kein Seitenumbruch innerhalb einer Kategorie — Gruppe rutscht als Ganzes auf die nächste Seite (bei Gruppen die größer als eine Seite sind wird trotzdem umgebrochen)

---

## [v0.4.1] — 2026-04-21

### Geändert
- `pdf.js`: Neue „Gesamt"-Spalte (Stk. + Spare) in der Druckansicht zwischen Spare und Im Proj.

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
