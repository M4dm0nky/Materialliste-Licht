// ══════════════════════════════════════════════════
// MULTI-PLAN SYSTEM — Pläne verwalten
// ══════════════════════════════════════════════════
const PLANS_KEY = 'materialliste-plans';
const PLAN_PFX  = 'materialliste-plan-';
let activePlanId = null;
let activePosIdx = 0;

function migrateState(s){
  if(!s) return {_project:'',_date:'',_activePosIdx:0,positions:[{name:'Standard',categories:CAT_ORDER.map(n=>({name:n,sections:[]}))}]};
  const st = s.positions
    ? s
    : {_project:s._project||'',_date:s._date||'',_activePosIdx:0,positions:[{name:'Standard',categories:s.categories||CAT_ORDER.map(n=>({name:n,sections:[]}))}]};
  // Migration: Bezeichnung/Länge-Tausch rückgängig machen (Fehler commit 4df44e7)
  st.positions.forEach(pos=>{
    pos.categories.forEach(cat=>{
      cat.sections.forEach(sec=>{
        sec.items.forEach(item=>{
          if(item.name===sec.type_name){
            item.name   = item.length||'';
            item.length = '';
          }
        });
      });
    });
  });
  return st;
}

function currentCats(){
  return state.positions[activePosIdx].categories;
}

function getPlansIndex(){ try{ const r=localStorage.getItem(PLANS_KEY); return r?JSON.parse(r):[]; }catch(e){return[];} }
function savePlansIndex(list){ try{ localStorage.setItem(PLANS_KEY,JSON.stringify(list)); }catch(e){} }
function genPlanId(){ return 'p'+Date.now().toString(36); }
function todayStr(){ return new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}); }

function renderPlanList(){
  const plans = getPlansIndex();
  const el    = document.getElementById('planList'); if(!el) return;
  if(!plans.length){ el.innerHTML='<div style="font-size:12px;color:var(--muted);padding:4px;">Noch kein Plan gespeichert.</div>'; return; }
  el.innerHTML = plans.map(p => `
    <div class="sb-plan-item${p.id===activePlanId?' active':''}">
      <span class="sb-plan-name" onclick="switchPlan('${p.id}')">${p.name}</span>
      <span class="sb-plan-date">${p.modified||''}</span>
      <button style="background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:12px;padding:1px 4px;" onclick="renamePlan('${p.id}')" title="Umbenennen">✏</button>
      ${plans.length>1?`<button style="background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:12px;padding:1px 4px;" onclick="deletePlan('${p.id}')" title="Löschen">✕</button>`:''}
    </div>`).join('');
  const nameEl = document.getElementById('activePlanName');
  if(nameEl){ const active=plans.find(p=>p.id===activePlanId); nameEl.textContent=active?active.name:''; }
}

function savePlanToLS(id){
  if(!id) return;
  try{
    const data = { version:2, project:state._project, date:state._date, _activePosIdx:activePosIdx, positions:state.positions };
    localStorage.setItem(PLAN_PFX+id, JSON.stringify(data));
    const plans=getPlansIndex(); const p=plans.find(x=>x.id===id);
    if(p){ p.modified=todayStr(); savePlansIndex(plans); }
  }catch(e){}
}

function loadPlanFromLS(id){
  if(!id) return false;
  try{
    const raw  = localStorage.getItem(PLAN_PFX+id); if(!raw) return false;
    const data = JSON.parse(raw);
    state       = migrateState(data);
    activePosIdx = Math.min(state._activePosIdx||0, state.positions.length-1);
    document.getElementById('pName').value = state._project;
    document.getElementById('pDate').value = state._date;
    recalcAll(); rerenderAllCats();
    return true;
  }catch(e){ return false; }
}

function rerenderAllCats(){
  currentCats().forEach((_,ci) => rerenderCat(ci));
  renderTabs();
  renderPosBar();
}

function switchPlan(id){
  if(id===activePlanId) return;
  savePlanToLS(activePlanId);
  activePlanId = id;
  loadPlanFromLS(id);
  const plans = getPlansIndex();
  const plan  = plans.find(p=>p.id===id);
  activeCatalogId = (plan&&plan.catalogId)||'cat-default';
  renderActiveCatalogBadge();
  renderPlanList();
  toast('Plan geladen ✓');
}

function deletePlan(id){
  const plans = getPlansIndex(); const plan=plans.find(p=>p.id===id); if(!plan) return;
  if(!confirm(`Plan „${plan.name}" wirklich löschen?`)) return;
  localStorage.removeItem(PLAN_PFX+id);
  const newList = plans.filter(p=>p.id!==id);
  savePlansIndex(newList);
  if(id===activePlanId){
    if(newList.length>0){ activePlanId=newList[0].id; loadPlanFromLS(activePlanId); }
    else{ activePlanId=null; }
  }
  renderPlanList();
  toast('Plan gelöscht');
}

function renamePlan(id){
  const plans = getPlansIndex(); const plan=plans.find(p=>p.id===id); if(!plan) return;
  const name  = prompt('Neuer Name:', plan.name); if(!name||!name.trim()) return;
  plan.name   = name.trim(); savePlansIndex(plans); renderPlanList(); toast('Umbenannt ✓');
}

function openNewPlan(){
  const name    = prompt('Plan-Name (z.B. Tour 2027 – DE):'); if(!name||!name.trim()) return;
  const posName = prompt('Erste Position (z.B. Bühne, FOH, Halle 25):'); if(!posName||!posName.trim()) return;
  savePlanToLS(activePlanId);
  const id = genPlanId();
  activePlanId = id;
  activePosIdx = 0;
  state = {_project:name.trim(),_date:'',_activePosIdx:0,positions:[{name:posName.trim(),categories:CAT_ORDER.map(n=>({name:n,sections:[]}))}]};
  document.getElementById('pName').value = state._project;
  document.getElementById('pDate').value = '';
  const plans = getPlansIndex();
  plans.push({id,name:name.trim(),created:todayStr(),modified:todayStr(),catalogId:activeCatalogId||'cat-default'});
  savePlansIndex(plans);
  savePlanToLS(id);
  render();
  renderPlanList();
  toast('Plan „'+name.trim()+'" erstellt ✓');
}
