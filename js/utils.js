// ══════════════════════════════════════════════════
// UTILS — Hilfsfunktionen
// ══════════════════════════════════════════════════

/** Parst eine Längenangabe wie "5m", "1,5m", "2.5" → Zahl (0 bei Fehler) */
function parseLen(s){
  if(!s) return 0;
  return parseFloat(String(s).replace(',','.').replace(/[^0-9.]/g,'')) || 0;
}
