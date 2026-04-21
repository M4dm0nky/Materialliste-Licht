// ══════════════════════════════════════════════════
// STATE — Datenhaltung & Persistenz
// ══════════════════════════════════════════════════
let state = null;
let saveTimer = null;

function initState(){
  try{
    const s = localStorage.getItem(STORAGE_KEY);
    if(s){
      state = migrateState(JSON.parse(s));
      activePosIdx = Math.min(state._activePosIdx||0, state.positions.length-1);
      return;
    }
  }catch(e){}
  state = {_project:'',_date:'',_activePosIdx:0,positions:[{name:'Standard',categories:CAT_ORDER.map(n=>({name:n,sections:[]}))}]};
  activePosIdx = 0;
}

function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{
    state._project = document.getElementById('pName').value;
    const el = document.getElementById('saveInd');
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      el.textContent='✓ GESPEICHERT'; el.className='save-ind saved';
      setTimeout(()=>{ el.textContent='●'; el.className='save-ind'; }, 2000);
      const tsEl = document.getElementById('gStatus');
      if(tsEl){ const t=new Date(); tsEl.textContent='Autosave '+t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
    }catch(e){
      el.textContent='⚠ SPEICHERN FEHLGESCHLAGEN'; el.className='save-ind error';
      setTimeout(()=>{ el.textContent='●'; el.className='save-ind'; }, 5000);
      console.error('save() localStorage error:', e);
    }
    if(activePlanId){
      const _plans = getPlansIndex();
      const _ap = _plans.find(x=>x.id===activePlanId);
      if(_ap && state._project){ _ap.name = state._project; savePlansIndex(_plans); }
      savePlanToLS(activePlanId);
      renderPlanList();
    }
    recalcAll();
  }, 350);
}

function esc(s){
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
