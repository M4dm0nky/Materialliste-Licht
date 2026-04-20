// ══════════════════════════════════════════════════
// UTILS — Hilfsfunktionen
// ══════════════════════════════════════════════════

/** Parst eine Längenangabe wie "5m", "1,5m", "2.5" → Zahl (0 bei Fehler) */
function parseLen(s){
  if(!s) return 0;
  return parseFloat(String(s).replace(',','.').replace(/[^0-9.]/g,'')) || 0;
}

function showConfirm(msg, onYes, title, yesLabel){
  const d   = document.getElementById('appConfirmDialog');
  const yes = document.getElementById('appConfirmYes');
  const no  = document.getElementById('appConfirmNo');
  document.getElementById('appConfirmMsg').textContent   = msg;
  document.getElementById('appConfirmTitle').textContent = title || 'Bestätigung';
  yes.textContent = yesLabel || 'Ja';
  d.classList.add('open');
  function cleanup(){
    d.classList.remove('open');
    yes.onclick = null; no.onclick = null;
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key==='Escape'){ e.stopPropagation(); cleanup(); } }
  yes.onclick = () => { cleanup(); onYes(); };
  no.onclick  = () => { cleanup(); };
  document.addEventListener('keydown', onKey);
  // Backdrop click cancels
  d.onclick = e => { if(e.target===d) cleanup(); };
}

function showPrompt(msg, defaultVal, onOk, title){
  const d   = document.getElementById('appPromptDialog');
  const inp = document.getElementById('appPromptInput');
  const ok  = document.getElementById('appPromptOk');
  const can = document.getElementById('appPromptCancel');
  document.getElementById('appPromptMsg').textContent   = msg;
  document.getElementById('appPromptTitle').textContent = title || 'Eingabe';
  inp.value = defaultVal || '';
  d.classList.add('open');
  function cleanup(){ d.classList.remove('open'); ok.onclick=null; can.onclick=null; inp.onkeydown=null; d.onclick=null; document.removeEventListener('keydown',onKey); }
  function doOk(){ const v=inp.value.trim(); if(!v) return; cleanup(); onOk(v); }
  function onKey(e){ if(e.key==='Escape'){ e.stopPropagation(); cleanup(); } }
  ok.onclick    = doOk;
  can.onclick   = () => { cleanup(); };
  inp.onkeydown = e => { if(e.key==='Enter') doOk(); };
  d.onclick     = e => { if(e.target===d) cleanup(); };
  document.addEventListener('keydown', onKey);
  setTimeout(()=>{ inp.focus(); inp.select(); }, 50);
}

// options: [{value, label}, ...]
function showSelect(msg, options, onOk, title){
  const d   = document.getElementById('appSelectDialog');
  const sel = document.getElementById('appSelectInput');
  const ok  = document.getElementById('appSelectOk');
  const can = document.getElementById('appSelectCancel');
  document.getElementById('appSelectMsg').textContent   = msg;
  document.getElementById('appSelectTitle').textContent = title || 'Auswahl';
  sel.innerHTML = options.map(o=>`<option value="${o.value}">${o.label}</option>`).join('');
  d.classList.add('open');
  function cleanup(){ d.classList.remove('open'); ok.onclick=null; can.onclick=null; d.onclick=null; document.removeEventListener('keydown',onKey); }
  function onKey(e){ if(e.key==='Escape'){ e.stopPropagation(); cleanup(); } }
  ok.onclick  = () => { cleanup(); onOk(sel.value); };
  can.onclick = () => { cleanup(); };
  d.onclick   = e => { if(e.target===d) cleanup(); };
  document.addEventListener('keydown', onKey);
}
