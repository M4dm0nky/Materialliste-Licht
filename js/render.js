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

const _weltIcons = {
  "Datenwelt":"🔌","Stromwelt":"⚡","Lichtwelt":"💡","Riggingwelt":"🔩","Verbrauchswelt":"📦"
};

function renderTabs(){
  const bar = document.getElementById('tabBar'); bar.innerHTML='';
  currentCats().forEach((cat,ci)=>{
    const t = document.createElement('div');
    t.className = 'tab'+(ci===0?' active':'');
    const icon = _weltIcons[cat.name]||'';
    t.innerHTML = (icon?icon+' ':'')+cat.name+`<span class="tbadge ok" id="badge-${ci}">✓</span>`;
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

function buildGroupHeader(groupName, ci){
  const el = document.createElement('div');
  el.className = 'grp-section-hdr';
  el.innerHTML = `<span class="grp-chevron">▼</span><span>${esc(groupName)}</span>`;
  return el;
}

function buildQtyRow(ci, si){
  const sec  = currentCats()[ci].sections[si];
  const item = sec.items[0] || {};
  const d    = (item.anzahl||0)+(item.spare||0)-(item.im_projekt||0);
  const tr   = document.createElement('tr');
  tr.id = `qrow-${ci}-${si}`;
  if((item.anzahl||0)+(item.spare||0)+(item.im_projekt||0)>0) tr.className='has-data';
  const diffCls = d<0?'neg':d>0?'pos':'zero';
  const diffTxt = (item.anzahl||0)+(item.spare||0)+(item.im_projekt||0)>0 ? (d>=0?'+'+d:d) : '—';
  tr.innerHTML=`
    <td class="tdname"><input type="text" value="${esc(item.name||sec.type_name||'')}"
      onchange="upf(${ci},${si},0,'name',this.value)" oninput="save()"></td>
    <td class="tdinput"><input type="number" min="0" value="${item.anzahl||0}"
      onchange="upn(${ci},${si},0,'anzahl',this)" oninput="lc(${ci},${si},0)"></td>
    <td class="tdinput"><input type="number" min="0" value="${item.spare||0}"
      onchange="upn(${ci},${si},0,'spare',this)" oninput="lc(${ci},${si},0)"></td>
    <td class="tdinput"><input type="number" min="0" value="${item.im_projekt||0}"
      onchange="upn(${ci},${si},0,'im_projekt',this)" oninput="lc(${ci},${si},0)"></td>
    <td class="td-diff ${diffCls}" id="diff-${ci}-${si}-0">${diffTxt}</td>
    <td class="tdtext"><input type="text" value="${esc(item.kapitel||'')}" placeholder="Kap…"
      onchange="upf(${ci},${si},0,'kapitel',this.value)" oninput="save()"></td>
    <td class="td-actions"><button class="delbtn" onclick="delRow(${ci},${si},0)" title="Zeile löschen">✕</button></td>`;
  return tr;
}

function rerenderCatInto(ci,panel){
  const cat       = currentCats()[ci];
  const weltName  = cat.name;
  const weltDepth = _getWeltDepth(weltName);
  const types     = getActiveCatalogTypes();
  const allGroups = getActiveCatalog().groups || [];

  // Längen-sortierung
  cat.sections.forEach(sec=>sec.items.sort((a,b)=>parseLen(a.length)-parseLen(b.length)));

  // Sektionen in lengths vs qty aufteilen
  const lengthsSecs = [], qtySecs = [];
  cat.sections.forEach((sec, si) => {
    const t = types[sec.type_name];
    if(!t || t.unit_type !== 'qty') lengthsSecs.push({sec, si, t});
    else qtySecs.push({sec, si, t});
  });

  if(lengthsSecs.length === 0 && qtySecs.length === 0){
    const es = document.createElement('div'); es.className='empty-state';
    es.innerHTML=`<div class="empty-icon">${_weltIcons[weltName]||'📦'}</div>
      <div class="empty-title">NOCH LEER</div>
      <div class="empty-sub">Klicke auf "Material hinzufügen" und wähle aus dem Katalog — oder füge einen eigenen Eintrag hinzu.</div>
      <button class="btn btn-green" onclick="openWiz(${ci})">+ MATERIAL HINZUFÜGEN</button>`;
    panel.appendChild(es);
    const ar = document.createElement('div'); ar.className='add-row';
    ar.innerHTML=`<button class="btn btn-green" onclick="openWiz(${ci})">+ MATERIAL HINZUFÜGEN</button>`;
    panel.appendChild(ar);
    return;
  }

  // A) lengths-Sektionen: wie bisher (buildSecEl), mit optionalen Gruppen-Headern
  if(lengthsSecs.length){
    const grouped = {};
    allGroups.forEach(g=>{ grouped[g.id]=[]; });
    grouped['__none']=[];
    lengthsSecs.forEach(({si, t})=>{
      const gid = t?.group||'__none';
      (grouped[gid]||grouped['__none']).push(si);
    });
    allGroups.filter(g=>!g.parentId).forEach(g=>{
      const secs = grouped[g.id]||[];
      if(secs.length){ panel.appendChild(buildGroupHeader(g.name, ci)); secs.forEach(si=>panel.appendChild(buildSecEl(ci,si))); }
    });
    (grouped['__none']||[]).forEach(si=>panel.appendChild(buildSecEl(ci,si)));
  }

  // B) qty-Sektionen: gruppiert darstellen
  if(qtySecs.length){
    const topGroups = allGroups.filter(g=>!g.parentId);
    const qGrouped  = {};
    qtySecs.forEach(s=>{
      const gid = s.t?.group||'__none';
      (qGrouped[gid]=qGrouped[gid]||[]).push(s);
    });

    const groupOrder = [...topGroups.map(g=>g.id), '__none'];
    groupOrder.forEach(gid=>{
      const secs = qGrouped[gid]||[];
      if(!secs.length) return;
      const gName = topGroups.find(g=>g.id===gid)?.name||'Sonstiges';

      const block = document.createElement('div');
      block.className = 'qty-group-block';
      block.appendChild(buildGroupHeader(gName, ci));

      const table = document.createElement('table');
      table.className = 'qty-table';

      // Tabellenkopf
      table.innerHTML = `<thead><tr>
        <th>Bezeichnung</th><th class="num">Stk.</th><th class="num">Spare</th>
        <th class="num">Im&nbsp;Proj.</th><th class="num">Diff</th><th>Kapitel</th><th></th>
      </tr></thead>`;
      const tbody = document.createElement('tbody');

      if(weltDepth === 3){
        // Untergruppen aus subgroup-Feld der Typen
        const subgroups = [...new Set(secs.map(s=>s.t?.subgroup||'').filter(Boolean))];
        const noSub = secs.filter(s=>!s.t?.subgroup);
        subgroups.forEach(sg=>{
          const sgTr = document.createElement('tr');
          sgTr.className = 'subgrp-row';
          sgTr.innerHTML = `<td colspan="7">${esc(sg)}</td>`;
          tbody.appendChild(sgTr);
          secs.filter(s=>s.t?.subgroup===sg).forEach(s=>tbody.appendChild(buildQtyRow(ci,s.si)));
        });
        noSub.forEach(s=>tbody.appendChild(buildQtyRow(ci,s.si)));
      } else {
        secs.forEach(s=>tbody.appendChild(buildQtyRow(ci,s.si)));
      }

      table.appendChild(tbody);
      block.appendChild(table);
      panel.appendChild(block);
    });
  }

  const ar = document.createElement('div'); ar.className='add-row';
  ar.innerHTML=`<button class="btn btn-green" onclick="openWiz(${ci})">+ MATERIAL HINZUFÜGEN</button>`;
  panel.appendChild(ar);
}

function _secHasLengths(ci,si){
  const sec = currentCats()[ci].sections[si];
  const t   = getActiveCatalogTypes()[sec.type_name];
  return t ? t.unit_type !== 'qty' : true;
}

function buildSecEl(ci,si){
  const sec   = currentCats()[ci].sections[si];
  const noLen = !_secHasLengths(ci,si);
  const block = document.createElement('div');
  block.className='secblock'+(noLen?' no-length':''); block.id=`sec-${ci}-${si}`;
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
        <th>Bezeichnung</th><th class="sec-hdr-len">Länge/Typ</th>
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
  const item = currentCats()[ci].sections[si].items[ii];
  const label = item.name || item.length || 'diese Zeile';
  if(!confirm(`„${label}" wirklich löschen?`)) return;
  currentCats()[ci].sections[si].items.splice(ii,1);
  save(); renderRows(ci,si); recalcAll();
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
