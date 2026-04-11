// ══════════════════════════════════════════════════
// RENDER — UI aufbauen & aktualisieren
// ══════════════════════════════════════════════════
let dragSrc = null;

function render(){
  renderPosBar(); renderTabs(); renderContent();
  document.getElementById('pName').value = state._project||'';
  document.getElementById('pDate').value = state._date||'';
  renderActiveCatalogBadge();
  recalcAll();
}

function renderTabs(){
  const bar = document.getElementById('tabBar'); bar.innerHTML='';
  currentCats().forEach((cat,ci)=>{
    const t = document.createElement('div');
    t.className = 'tab'+(ci===0?' active':'');
    t.innerHTML = cat.name+`<span class="tbadge ok" id="badge-${ci}">✓</span>`;
    t.onclick = ()=>switchTab(ci); bar.appendChild(t);
  });
}

function renderContent(){
  const el = document.getElementById('content'); el.innerHTML='';
  currentCats().forEach((cat,ci)=>{
    const panel = document.createElement('div');
    panel.className = 'catpanel'+(ci===0?' active':''); panel.id=`cat-${ci}`;
    el.appendChild(panel);
    rerenderCatInto(ci,panel);
  });
}

function rerenderCat(ci){
  const panel = document.getElementById(`cat-${ci}`);
  if(!panel) return render();
  panel.innerHTML='';
  rerenderCatInto(ci,panel);
  recalcAll();
}

function rerenderCatInto(ci,panel){
  const cat = currentCats()[ci];
  cat.sections.forEach(sec=>sec.items.sort((a,b)=>
    parseFloat((a.length||'0').replace(',','.'))-parseFloat((b.length||'0').replace(',','.'))
  ));
  if(cat.sections.length===0){
    const es = document.createElement('div'); es.className='empty-state';
    es.innerHTML=`<div class="empty-icon">📦</div>
      <div class="empty-title">NOCH LEER</div>
      <div class="empty-sub">Klicke auf "Material hinzufügen" und wähle aus dem Katalog — oder füge einen eigenen Eintrag hinzu.</div>
      <button class="btn btn-green" onclick="openWiz(${ci})">+ MATERIAL HINZUFÜGEN</button>`;
    panel.appendChild(es);
  } else {
    cat.sections.forEach((_,si)=>panel.appendChild(buildSecEl(ci,si)));
  }
  const ar = document.createElement('div'); ar.className='add-row';
  ar.innerHTML=`<button class="btn btn-green" onclick="openWiz(${ci})">+ MATERIAL HINZUFÜGEN</button>`;
  panel.appendChild(ar);
}

function buildSecEl(ci,si){
  const sec   = currentCats()[ci].sections[si];
  const block = document.createElement('div');
  block.className='secblock'; block.id=`sec-${ci}-${si}`;
  block.innerHTML=`
    <div class="sechdr" id="sechdr-${ci}-${si}"
      ondragover="event.preventDefault();event.dataTransfer.dropEffect='move';this.classList.add('drop-target')"
      ondragleave="this.classList.remove('drop-target')"
      ondrop="dropOnSec(${ci},${si},event)">
      <div class="sechdr-title" onclick="toggleSec(${ci},${si})">
        <span class="chevron">▼</span>${esc(sec.type_name)}
      </div>
      <div class="sechdr-col">DIFF</div>
      <div class="sechdr-col">TOTAL</div>
      <div class="sechdr-col"># Stk.</div>
      <div class="sechdr-col">Spare</div>
      <div class="sechdr-col">Im Proj.</div>
      <div class="sechdr-col">Kapitel</div>
      <div class="sechdr-actions">
        <button class="btn btn-sm btn-green" title="Aus Katalog hinzufügen" onclick="openWizToSec(${ci},${si})">+</button>
        <button class="btn btn-sm btn-red" title="Sektion löschen" onclick="delSec(${ci},${si})">✕</button>
      </div>
    </div>
    <div class="secbody" id="body-${ci}-${si}">
      <table><thead><tr>
        <th>Bezeichnung</th><th>Länge/Typ</th>
        <th class="num">DIFF</th><th class="num">TOTAL</th>
        <th class="num"># Stk.</th><th class="num">Spare</th>
        <th class="num">Im Projekt</th>
        <th>Kapitel</th><th>Bemerkung</th><th></th>
      </tr></thead><tbody id="tbody-${ci}-${si}"></tbody></table>
      <div class="addlength-row">
        <button class="btn btn-sm" onclick="openWiz(${ci})">+ NEUE LÄNGE / MATERIAL</button>
      </div>
    </div>`;
  const tbody = block.querySelector(`#tbody-${ci}-${si}`);
  if(tbody){
    currentCats()[ci].sections[si].items.forEach((_,ii)=>tbody.appendChild(buildRow(ci,si,ii)));
  }
  return block;
}

function renderRows(ci,si){
  const tbody = document.getElementById(`tbody-${ci}-${si}`); if(!tbody) return;
  tbody.innerHTML='';
  currentCats()[ci].sections[si].items.forEach((_,ii)=>tbody.appendChild(buildRow(ci,si,ii)));
  recalcAll();
}

function buildRow(ci,si,ii){
  const item = currentCats()[ci].sections[si].items[ii];
  const tr   = document.createElement('tr');
  tr.id = `row-${ci}-${si}-${ii}`;
  if((item.anzahl||0)+(item.spare||0)+(item.im_projekt||0)>0) tr.className='has-data';
  const namePlaceholder = item.name==='' && item.length ? '↳ (Unterzeile)' : 'Bezeichnung…';
  const nameVal = esc(item.name||'');
  const lenVal  = esc(item.length||'');
  const anzVal  = item.anzahl||0;
  const sprVal  = item.spare||0;
  const impVal  = item.im_projekt||0;
  const kapVal  = esc(item.kapitel||'');
  const bemVal  = esc(item.bemerkung||'');
  tr.draggable = true;
  tr.addEventListener('dragstart',e=>{
    dragSrc = {ci,si,ii};
    tr.classList.add('row-dragging');
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',`${ci}-${si}-${ii}`);
  });
  tr.addEventListener('dragend',()=>{
    tr.classList.remove('row-dragging');
    document.querySelectorAll('.sechdr.drop-target').forEach(el=>el.classList.remove('drop-target'));
  });
  tr.innerHTML=`
    <td class="tdname"><input type="text" value="${nameVal}" placeholder="${namePlaceholder}"
      onchange="upf(${ci},${si},${ii},'name',this.value)" oninput="save()"></td>
    <td class="tdlen"><input type="text" value="${lenVal}" placeholder="Länge…"
      onchange="upf(${ci},${si},${ii},'length',this.value)" oninput="save()"></td>
    <td class="td-diff zero" id="diff-${ci}-${si}-${ii}">—</td>
    <td class="td-total" id="total-${ci}-${si}-${ii}">—</td>
    <td class="tdinput"><input type="number" min="0" value="${anzVal}"
      onchange="upn(${ci},${si},${ii},'anzahl',this)" oninput="lc(${ci},${si},${ii})"></td>
    <td class="tdinput"><input type="number" min="0" value="${sprVal}"
      onchange="upn(${ci},${si},${ii},'spare',this)" oninput="lc(${ci},${si},${ii})"></td>
    <td class="tdinput"><input type="number" min="0" value="${impVal}"
      onchange="upn(${ci},${si},${ii},'im_projekt',this)" oninput="lc(${ci},${si},${ii})"></td>
    <td class="tdtext"><input type="text" value="${kapVal}" placeholder="Kap…"
      onchange="upf(${ci},${si},${ii},'kapitel',this.value)" oninput="save()"></td>
    <td class="tdtext"><input type="text" value="${bemVal}" placeholder="Notiz…"
      onchange="upf(${ci},${si},${ii},'bemerkung',this.value)" oninput="save()"></td>
    <td class="td-actions"><button class="delbtn" onclick="delRow(${ci},${si},${ii})" title="Zeile löschen">✕</button></td>`;
  return tr;
}

function dropOnSec(tci,tsi,e){
  e.preventDefault();
  document.querySelectorAll('.sechdr.drop-target').forEach(el=>el.classList.remove('drop-target'));
  if(!dragSrc) return;
  const {ci:sci,si:ssi,ii:sii} = dragSrc;
  dragSrc = null;
  if(sci===tci && ssi===tsi) return;
  const cats = currentCats();
  const item = cats[sci].sections[ssi].items.splice(sii,1)[0];
  cats[tci].sections[tsi].items.push(item);
  save();
  renderRows(sci,ssi);
  renderRows(tci,tsi);
  toast(`→ verschoben nach „${cats[tci].sections[tsi].type_name}"`);
}

// ── UPDATE ─────────────────────────────────────────────────────────
function upn(ci,si,ii,field,input){
  const v = Math.max(0,parseInt(input.value)||0); input.value=v;
  currentCats()[ci].sections[si].items[ii][field]=v; lc(ci,si,ii); save();
}
function upf(ci,si,ii,field,val){ currentCats()[ci].sections[si].items[ii][field]=val; save(); }

// ── DELETE ─────────────────────────────────────────────────────────
function delRow(ci,si,ii){
  currentCats()[ci].sections[si].items.splice(ii,1); save(); renderRows(ci,si); recalcAll();
}
function delSec(ci,si){
  if(!confirm(`Sektion "${currentCats()[ci].sections[si].type_name}" wirklich löschen?`)) return;
  currentCats()[ci].sections.splice(si,1); save(); rerenderCat(ci);
}

// ── UI-STEUERUNG ───────────────────────────────────────────────────
function switchTab(ci){
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',i===ci));
  document.querySelectorAll('.catpanel').forEach((p,i)=>p.classList.toggle('active',i===ci));
}
function toggleSec(ci,si){
  document.getElementById(`body-${ci}-${si}`).classList.toggle('collapsed');
  document.getElementById(`sechdr-${ci}-${si}`).classList.toggle('collapsed');
}
function collapseAll(){
  document.querySelectorAll('.secbody').forEach(b=>b.classList.add('collapsed'));
  document.querySelectorAll('.sechdr').forEach(h=>h.classList.add('collapsed'));
}
function expandAll(){
  document.querySelectorAll('.secbody').forEach(b=>b.classList.remove('collapsed'));
  document.querySelectorAll('.sechdr').forEach(h=>h.classList.remove('collapsed'));
}
function resetAll(){
  if(!confirm('Alle Daten löschen?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = {_project:'',_date:'',_activePosIdx:0,positions:[{name:'Standard',categories:CAT_ORDER.map(n=>({name:n,sections:[]}))}]};
  activePosIdx=0; render();
}
