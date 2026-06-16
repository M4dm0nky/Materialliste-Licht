# Design (Entwurf): Code-Qualität & Tests

**Datum:** 2026-06-16
**Status:** ⏸ ENTWURF — Brainstorming pausiert, Design noch nicht final abgenommen
**Aktuelle App-Version:** v0.7.6

## Kontext
Nach mehreren subtilen Merge-Bugs in dieser Session (`im_projekt`-Verlust, Rename-Propagierung) soll eine zero-dependency Test-Harness die Kern-Logik gegen Regressionen absichern. Projektzwang: **kein npm, kein Build-Schritt, Vanilla JS, globaler Scope** (siehe CLAUDE.md).

## Getroffene Entscheidungen
- **Fokus:** Code-Qualität & Tests (vor Workflow-Features / Datensicherheit).
- **Test-Runner:** Node built-in (`node --test` + `node:assert`) — kein npm install nötig, CI-fähig.
- **Scope bewusst klein:** nur pure Logik + Merge-Entdopplung. Modularisierung von `catalog-mgr.js` (1200 Z.) und DOM-gekoppelte Funktionen sind **draußen** (YAGNI, später eigenes Projekt).

## Architektur: `js/logic.js` (Dual-Target ohne Build)
Klassisches Script (kein import/export-Syntax), das im Browser Globals setzt und in Node via `module.exports` exportierbar ist:

```js
// js/logic.js
(function(root){
  function parseLen(s){ … }
  function xdiff(item){ … }
  function xtotal(item){ … }
  function mergeItems(target, source){ … }   // NEU: die EINE Merge-Wahrheit
  function dedupeItems(items){ … }            // NEU: für migrateState
  function detectUnitType(t){ … }
  const API = { parseLen, xdiff, xtotal, mergeItems, dedupeItems, detectUnitType };
  Object.assign(root, API);                                   // Browser
  if (typeof module !== 'undefined' && module.exports) module.exports = API; // Node
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

- Browser: `<script src="js/logic.js">` **als erstes** in index.html laden → Funktionen global wie bisher, Aufrufer unverändert.
- Node: `require('../js/logic.js')` im Test.

## Extraktion & Entdopplung
Reine Funktionen wandern nach `logic.js`, die Originale in `utils.js`/`calc.js`/`catalog.js` werden **entfernt** (Single Source):
- `parseLen` (aus utils.js)
- `xdiff`, `xtotal` (aus calc.js)
- `detectUnitType` (= bisher `_detectUnitType` aus catalog.js)
- **NEU `mergeItems(target, source)`** ersetzt die 3 duplizierten Merge-Blöcke:
  - `render.js` `editSectionName()` (Merge-Zweig)
  - `plans.js` `_migrateSectionWorlds()` Pass 3
  - `plans.js` `migrateState()` Dedup (sinngemäß via `dedupeItems`)
- **NEU `dedupeItems(items)`** für die migrateState-Variante.

⚠️ **Subtilität:** Die 3 Varianten matchen leicht unterschiedlich — 2× nur per `length`, 1× per `length`+`name`. Beim Vereinheitlichen Verhalten bewusst festlegen und per Test dokumentieren.

## Tests: `tests/logic.test.js`
`node:test` + `node:assert`, Fälle inkl. der Session-Regressionen:
- `parseLen`: `"1,5m"`, `"50m Trommel"`, `""`, `"Patchkabel 1m"`
- `xdiff`/`xtotal`: Vorzeichen, fehlende Felder
- `mergeItems`: **`im_projekt` wird summiert**, length- vs name-Match, kein-Match-Push, qty vs lengths
- `detectUnitType`: leere Items → qty, mit `l` → lengths

Ausführen: `node --test` im Projektordner. README + CLAUDE.md „Tests"-Abschnitt ergänzen.

## OFFENE PUNKTE (beim Weitermachen klären)
1. **Design-Abnahme** steht noch aus (Zuschnitt ok?).
2. **GitHub-Actions-Workflow** (`node --test` bei jedem Push) — dazunehmen oder erstmal nur lokal? (noch offen)
3. Danach: writing-plans Skill → Implementierungsplan.

## Nicht vergessen
- Brainstorming-Skill war aktiv; nächster Schritt laut Skill = `writing-plans` nach finaler Abnahme.
- Andere Verbesserungs-Ideen (für später): Fehlmengen-/Nachbestell-Dashboard, Datensicherheit/Auto-Backup, Pack-/Abhak-Modus, globale Suche.
