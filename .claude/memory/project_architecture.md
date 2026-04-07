---
name: Projektarchitektur Materialliste Licht
description: Technische Architektur, localStorage-Keys, Kernfunktionen und aktuelle Versionsinformationen
type: project
---

## Kernprinzipien
- **Single-File**: Alles in `index.html` (~1800+ Zeilen). Keine anderen Dateien anfassen.
- **Kein Build-System**: Vanilla JS, kein npm, kein webpack. Direkt im Browser öffnen.
- **localStorage**: Einzige Persistenz, kein Backend.
- **Sprache**: Gesamte UI auf Deutsch.

## localStorage-Keys
| Key | Inhalt |
|-----|--------|
| `materialliste-licht-v1` | Aktueller Plan-State (wird von Plans-System überschrieben) |
| `materialliste-licht-catalog-v1` | VERALTET — alte Custom-Additions, nur noch für Migration |
| `materialliste-licht-catalogs-v1` | Neues Multi-Katalog-System (seit v0.6.0) |
| `materialliste-plans` | Plans-Index: Array von `{id, name, created, modified, catalogId}` |
| `materialliste-plan-<id>` | Einzelner Plan-State |
| `materialliste-licht-logos-v1` | Logos (Planer, Band, Booking) |

## Globale Variablen
- `state` — aktueller Plan-State `{_project, _date, _activePosIdx, positions[]}`
- `activePlanId` — ID des aktiven Plans
- `activePosIdx` — aktiver Positions-Index innerhalb des Plans
- `catalogsStore` — alle Kataloge `{version:1, catalogs:[{id, name, isBuiltin, types:{}}]}`
- `activeCatalogId` — ID des aktiven Katalogs (aus plans-index.catalogId)
- `wiz` — Wizard-State während des Material-Hinzufügens
- `logos` — `{planer, band, booking}` (Base64 Data-URLs)

## Kern-Accessor-Funktionen
- `currentCats()` → aktive Kategorien (positions[activePosIdx].categories)
- `getActiveCatalog()` → aktives Katalog-Objekt aus catalogsStore
- `getActiveCatalogTypes()` → types-Map des aktiven Katalogs
- `getPlansIndex()` / `savePlansIndex()` → Plans-Index lesen/schreiben
- `save()` → debounced (350ms) State → localStorage
- `saveCatalogsStore()` → Katalog-Store → localStorage

## State-Struktur (Plan)
```
positions: [{
  name: string,
  categories: [{
    name: "Kabel Liste"|"Zubehör Liste"|"Hardware Liste"|"Lampen Liste",
    sections: [{
      type_name: string,  // Katalog-Key, z.B. "DMX 5-Pin"
      items: [{name, length, anzahl, spare, im_projekt, kapitel, bemerkung}]
    }]
  }]
}]
```

## Katalog-Struktur (catalogsStore)
```
{version:1, catalogs:[{
  id: "cat-default"|"cat-<timestamp>",
  name: string,
  isBuiltin: bool,       // Standard-Katalog: true, nicht löschbar
  created: string,
  types: {
    "DMX 5-Pin": {cat: "Kabel Liste", items: [{n, l, b?}]}
  }
}]}
```

## Init-Reihenfolge
1. `initCatalogs()` — katalogStore aufbauen / migrieren
2. `initState()` — Plan-State laden (kein CATALOG_KEY-Merge mehr)
3. `initPlans()` IIFE — Plans-Index laden, activePlanId/activeCatalogId setzen, render()

## Versions-Stellen
- Header: Z.244 `◆ v0.6.1`
- PDF-Template: Z.1765 `◆ v0.6.1`
- Aktuelle Version: **v0.6.1**

## Wichtige UI-Muster
- Modal-Overlay: `#overlay` mit `showWiz(title)` / `closeWiz()`
- Toast: `toast(msg, isErr=false)` — 2.8s Einblendung unten rechts
- Tabs: `.cat-mgr-tabs` im Katalog-Manager, `.tabs` für Hauptkategorien
- `esc(s)` — HTML-escaping für alle User-Strings in innerHTML
