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
    state._date    = document.getElementById('pDate').value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const el = document.getElementById('saveInd');
    el.textContent='✓ GESPEICHERT'; el.className='save-ind saved';
    setTimeout(()=>{ el.textContent='●'; el.className='save-ind'; }, 2000);
    recalcAll();
  }, 350);
}

function esc(s){
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
