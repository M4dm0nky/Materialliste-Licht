// ══════════════════════════════════════════════════
// UTILS — Hilfsfunktionen
// ══════════════════════════════════════════════════

/** Parst eine Längenangabe wie "5m", "1,5m", "2.5" → Zahl (0 bei Fehler) */
function parseLen(s){
  if(!s) return 0;
  return parseFloat(String(s).replace(',','.').replace(/[^0-9.]/g,'')) || 0;
}

function showConfirm(msg, onYes, title){
  const d = document.getElementById('appConfirmDialog');
  document.getElementById('appConfirmMsg').textContent  = msg;
  document.getElementById('appConfirmTitle').textContent = title || 'Bestätigung';
  d.style.display = 'flex';
  const yes = document.getElementById('appConfirmYes');
  const no  = document.getElementById('appConfirmNo');
  function cleanup(){ d.style.display='none'; yes.onclick=null; no.onclick=null; }
  yes.onclick = () => { cleanup(); onYes(); };
  no.onclick  = () => { cleanup(); };
}

function showPrompt(msg, defaultVal, onOk, title){
  const d   = document.getElementById('appPromptDialog');
  const inp = document.getElementById('appPromptInput');
  document.getElementById('appPromptMsg').textContent   = msg;
  document.getElementById('appPromptTitle').textContent = title || 'Eingabe';
  inp.value = defaultVal || '';
  d.style.display = 'flex';
  const ok  = document.getElementById('appPromptOk');
  const can = document.getElementById('appPromptCancel');
  function cleanup(){ d.style.display='none'; ok.onclick=null; can.onclick=null; inp.onkeydown=null; }
  function doOk(){ const v=inp.value.trim(); if(!v) return; cleanup(); onOk(v); }
  ok.onclick      = doOk;
  can.onclick     = () => { cleanup(); };
  inp.onkeydown   = e => { if(e.key==='Enter') doOk(); if(e.key==='Escape') cleanup(); };
  setTimeout(()=>{ inp.focus(); inp.select(); }, 50);
}
