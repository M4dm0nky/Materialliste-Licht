---
name: Entwicklungs-Feedback und Arbeitsregeln
description: Gelernte Regeln für dieses Projekt: was zu tun und zu lassen ist
type: feedback
---

**Vor jeder Implementierung lesen:**

1. **Nur `index.html` bearbeiten** — `materialliste-licht.html` und `LichtMaterialliste.html` sind alte Versionen, nicht anfassen.

2. **Version immer erhöhen** — nach jeder Session beide Stellen (`◆ v`) aktualisieren. Patches: x.x.Y, Features: x.Y.0.

3. **Keine externen Abhängigkeiten** — kein CDN, keine npm-Pakete, die App soll offline funktionieren.

4. **Alle UI-Texte auf Deutsch** — Buttons, Labels, Toast-Meldungen, Prompt-Dialoge.

5. **`esc()` für alle User-Strings in innerHTML** — sicherheitskritisch, nie vergessen.

6. **Plan-Modus nutzen** — bei größeren Features erst planen, vom User bestätigen lassen, dann implementieren.

**Why:** Aus direktem Feedback und Korrekturen des Users während der Entwicklungssessions.

**How to apply:** Vor dem Schreiben von Code kurz checklisten.
