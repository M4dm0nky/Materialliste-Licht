---
name: Versionsnummer immer erhöhen
description: Bei jeder Änderung an index.html die Versionsnummer in Header und PDF-Export aktualisieren
type: feedback
---

Nach jeder Änderung die Versionsnummer erhöhen — beide Stellen in `index.html`:
- Header `<h1>` — suche nach `◆ v` (aktuell Z.244)
- PDF-Export String — zweite Fundstelle von `◆ v` (aktuell Z.1765)

Aktuelle Version: **v0.7.5**

Versionsschema:
- Patches / kleine Fixes: x.x.Y (0.6.0 → 0.6.1)
- Neue Features: x.Y.0 (0.5.x → 0.6.0)
- Major Refactor: X.0.0

**Why:** User hat explizit darauf hingewiesen, dass ich es vergessen hatte. Er erwartet, dass jede Session mit einer Versionserhöhung endet.

**How to apply:** Am Ende jeder Coding-Session `grep '◆ v'` ausführen und beide Stellen prüfen. Bei mehreren Änderungs-Runden in einer Session nur am Ende einmal erhöhen.
