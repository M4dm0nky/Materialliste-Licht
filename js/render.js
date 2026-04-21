// ══════════════════════════════════════════════════
// RENDER — UI aufbauen & aktualisieren
// ══════════════════════════════════════════════════
let dragSrc = null;
let dragSrcSec = null;
let dragSrcGrp = null;
let dragType = null;

function render(){
  renderPosBar(); renderTabs(); renderContent();
  document.getElementById('pName').value = state._project||'';
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

function buildGroupHeader(groupName, ci, groupId){
  const el = document.createElement('div');
  el.className = 'grp-section-hdr';
  const gidJson = groupId ? JSON.stringify(groupId) : 'null';
  el.innerHTML = `<span class="drag-handle" title="Gruppe verschieben">⠿</span><span class="grp-chevron">▼</span><span class="grp-title-text" title="Klicken zum Umbenennen">${esc(groupName)}</span>`;
  if(groupId){
    el.querySelector('.grp-title-text').addEventListener('click',()=>editGroupName(groupId));
    const grpHandle = el.querySelector('.drag-handle');
    grpHandle.draggable = true;
    grpHandle.addEventListener('dragstart',e=>{
      dragSrcGrp = {groupId};
      dragType = 'group';
      el.classList.add('grp-dragging');
      e.dataTransfer.effectAllowed='move';
      e.dataTransfer.setData('text/plain','grp-'+groupId);
    });
    grpHandle.addEventListener('dragend',()=>{
      el.classList.remove('grp-dragging');
      document.querySelectorAll('.grp-section-hdr.grp-drop-target').forEach(x=>x.classList.remove('grp-drop-target'));
    });
    el.addEventListener('dragover',e=>{
      if(dragType!=='group') return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect='move';
      el.classList.add('grp-drop-target');
    });
    el.addEventListener('dragleave',()=>el.classList.remove('grp-drop-target'));
    el.addEventListener('drop',e=>{
      e.preventDefault(); e.stopPropagation();
      el.classList.remove('grp-drop-target');
      dropOnGroupHeader(groupId);
    });
  }
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
    <td class="td-handle"><span class="drag-handle" title="Verschieben">⠿</span></td>
    <td class="tdname"><input type="text" value="${esc(item.name||sec.type_name||'')}"
      onchange="upf(${ci},${si},0,'name',this.value)" oninput="save()"></td>
    <td class="tdinput"><input type="number" min="0" value="${item.anzahl||0}"
      onchange="upn(${ci},${si},0,'anzahl',this)" oninput="lc(${ci},${si},0)"></td>
    <td class="tdinput"><input type="number" min="0" value="${item.spare||0}"
      onchange="upn(${ci},${si},0,'spare',this)" oninput="lc(${ci},${si},0)"></td>
    <td class="td-total" id="total-${ci}-${si}-0">${(item.anzahl||0)+(item.spare||0)>0?(item.anzahl||0)+(item.spare||0):'—'}</td>
    <td class="tdinput"><input type="number" min="0" value="${item.im_projekt||0}"
      onchange="upn(${ci},${si},0,'im_projekt',this)" oninput="lc(${ci},${si},0)"></td>
    <td class="td-diff ${diffCls}" id="diff-${ci}-${si}-0">${diffTxt}</td>
    <td class="tdtext"><input type="text" value="${esc(item.kapitel||'')}" placeholder="Kap…"
      onchange="upf(${ci},${si},0,'kapitel',this.value)" oninput="save()"></td>
    <td class="td-actions"><button class="delbtn" onclick="delRow(${ci},${si},0)" title="Zeile löschen">✕</button></td>`;
  const handle = tr.querySelector('.drag-handle');
  handle.draggable = true;
  handle.addEventListener('dragstart',e=>{
    dragSrcSec = {ci,si};
    dragType = 'qty-row';
    tr.classList.add('row-dragging');
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',`qty-${ci}-${si}`);
  });
  tr.addEventListener('dragend',()=>{
    dragType = null;
    tr.classList.remove('row-dragging');
    document.querySelectorAll('tr.row-drop-before,tr.row-drop-after').forEach(el=>el.classList.remove('row-drop-before','row-drop-after'));
  });
  tr.addEventListener('dragover',e=>{
    if(dragType!=='qty-row') return;
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect='move';
    document.querySelectorAll('tr.row-drop-before,tr.row-drop-after').forEach(el=>el.classList.remove('row-drop-before','row-drop-after'));
    const rect = tr.getBoundingClientRect();
    tr.classList.add(e.clientY < rect.top+rect.height/2 ? 'row-drop-before' : 'row-drop-after');
  });
  tr.addEventListener('dragleave',()=>{
    tr.classList.remove('row-drop-before','row-drop-after');
  });
  tr.addEventListener('drop',e=>{
    e.preventDefault(); e.stopPropagation();
    tr.classList.remove('row-drop-before','row-drop-after');
    if(dragType!=='qty-row'||!dragSrcSec) return;
    const rect = tr.getBoundingClientRect();
    dropQtyRow(ci,si,e.clientY>=rect.top+rect.height/2);
  });
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
    const isQty = (t?.unit_type === 'qty')
               || (sec.unit_type === 'qty')
               || (!t && !sec.unit_type && sec.items.length > 0 && sec.items.every(it => !it.length));
    if(!isQty) lengthsSecs.push({sec, si, t});
    else qtySecs.push({sec, si, t});
  });

  // Ghost-Items bereinigen: qty-Sektionen dürfen nur 1 Item haben
  let _ghostFixed = false;
  qtySecs.forEach(({sec}) => {
    if(sec.items.length > 1){ sec.items.splice(1); _ghostFixed = true; }
  });
  if(_ghostFixed) save();

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
      if(secs.length){ panel.appendChild(buildGroupHeader(g.name, ci, g.id)); secs.forEach(si=>panel.appendChild(buildSecEl(ci,si))); }
    });
    (grouped['__none']||[]).forEach(si=>panel.appendChild(buildSecEl(ci,si)));
  }

  // B) qty-Sektionen: gruppiert darstellen
  if(qtySecs.length){
    const topGroups = allGroups.filter(g=>!g.parentId);
    const qGrouped  = {};
    qtySecs.forEach(s=>{
      let gid = s.t?.group||'__none';
      const grpDef = allGroups.find(g=>g.id===gid);
      if(grpDef?.parentId) gid = grpDef.parentId;
      (qGrouped[gid]=qGrouped[gid]||[]).push(s);
    });

    const groupOrder = [...topGroups.map(g=>g.id), '__none'];
    groupOrder.forEach(gid=>{
      const secs = qGrouped[gid]||[];
      if(!secs.length) return;
      const gName = topGroups.find(g=>g.id===gid)?.name||'Sonstiges';

      const block = document.createElement('div');
      block.className = 'qty-group-block';
      block.appendChild(buildGroupHeader(gName, ci, gid==='__none'?null:gid));

      const table = document.createElement('table');
      table.className = 'qty-table';

      // Tabellenkopf
      table.innerHTML = `<thead><tr>
        <th style="width:22px"></th><th>Bezeichnung</th><th class="num">Stk.</th><th class="num">Spare</th>
        <th class="num">Gesamt</th><th class="num">Im&nbsp;Proj.</th><th class="num">Diff</th><th>Kapitel</th><th></th>
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
  if(t) return t.unit_type !== 'qty';
  if(sec.unit_type) return sec.unit_type !== 'qty';
  return !(sec.items.length > 0 && sec.items.every(it => !it.length));
}

function buildSecEl(ci,si){
  const sec   = currentCats()[ci].sections[si];
  const noLen = !_secHasLengths(ci,si);
  const block = document.createElement('div');
  block.className='secblock'+(noLen?' no-length':''); block.id=`sec-${ci}-${si}`;
  block.innerHTML=`
    <div class="sechdr" id="sechdr-${ci}-${si}"
      ondragover="event.preventDefault();event.dataTransfer.dropEffect='move';if(dragType==='section')this.classList.add('sec-drop-target');else this.classList.add('drop-target');"
      ondragleave="this.classList.remove('drop-target','sec-drop-target')"
      ondrop="dropOnSec(${ci},${si},event)">
      <div class="sechdr-title">
        <span class="drag-handle" title="Sektion verschieben">⠿</span>
        <span class="chevron" onclick="toggleSec(${ci},${si})">▼</span><span class="sec-title-text" onclick="editSectionName(${ci},${si})" title="Klicken zum Umbenennen">${esc(sec.type_name)}</span>
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
  const dragHandle = block.querySelector('.drag-handle');
  if(dragHandle){
    dragHandle.draggable = true;
    dragHandle.addEventListener('dragstart',e=>{
      dragSrcSec = {ci,si};
      dragType = 'section';
      block.classList.add('sec-dragging');
      e.dataTransfer.effectAllowed='move';
      e.dataTransfer.setData('text/plain',`sec-${ci}-${si}`);
    });
    dragHandle.addEventListener('dragend',()=>{
      block.classList.remove('sec-dragging');
      dragType = null; dragSrcSec = null;
      document.querySelectorAll('.sechdr.sec-drop-target').forEach(el=>el.classList.remove('sec-drop-target'));
    });
  }
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
    dragType = 'row';
    tr.classList.add('row-dragging');
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',`${ci}-${si}-${ii}`);
  });
  tr.addEventListener('dragend',()=>{
    dragType = null;
    tr.classList.remove('row-dragging');
    document.querySelectorAll('.sechdr.drop-target,.sechdr.sec-drop-target').forEach(el=>el.classList.remove('drop-target','sec-drop-target'));
    document.querySelectorAll('tr.row-drop-before,tr.row-drop-after').forEach(el=>el.classList.remove('row-drop-before','row-drop-after'));
  });
  tr.addEventListener('dragover',e=>{
    if(dragType!=='row') return;
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect='move';
    document.querySelectorAll('tr.row-drop-before,tr.row-drop-after').forEach(el=>el.classList.remove('row-drop-before','row-drop-after'));
    const rect = tr.getBoundingClientRect();
    const half = rect.top + rect.height/2;
    tr.classList.add(e.clientY < half ? 'row-drop-before' : 'row-drop-after');
  });
  tr.addEventListener('dragleave',()=>{
    tr.classList.remove('row-drop-before','row-drop-after');
  });
  tr.addEventListener('drop',e=>{
    e.preventDefault(); e.stopPropagation();
    tr.classList.remove('row-drop-before','row-drop-after');
    if(dragType!=='row'||!dragSrc) return;
    const rect = tr.getBoundingClientRect();
    const insertAfter = e.clientY >= rect.top + rect.height/2;
    dropOnRow(ci,si,ii,insertAfter);
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

function dropOnRow(tci,tsi,tii,insertAfter){
  if(!dragSrc) return;
  const {ci:sci,si:ssi,ii:sii} = dragSrc;
  dragSrc = null; dragType = null;
  const cats = currentCats();
  const item = cats[sci].sections[ssi].items.splice(sii,1)[0];
  if(sci===tci && ssi===tsi){
    let idx = tii;
    if(insertAfter) idx++;
    if(sii < tii) idx--;
    idx = Math.max(0, Math.min(idx, cats[tci].sections[tsi].items.length));
    cats[tci].sections[tsi].items.splice(idx,0,item);
    save(); renderRows(tci,tsi);
  } else {
    let idx = insertAfter ? tii+1 : tii;
    idx = Math.max(0, Math.min(idx, cats[tci].sections[tsi].items.length));
    cats[tci].sections[tsi].items.splice(idx,0,item);
    save(); renderRows(sci,ssi); renderRows(tci,tsi);
    toast(`→ verschoben nach „${cats[tci].sections[tsi].type_name}"`);
  }
}

function dropSecOnSec(tci,tsi){
  if(!dragSrcSec) return;
  const {ci:sci,si:ssi} = dragSrcSec;
  dragSrcSec = null; dragType = null;
  document.querySelectorAll('.secblock.sec-dragging').forEach(el=>el.classList.remove('sec-dragging'));
  if(sci===tci && ssi===tsi) return;
  const cats = currentCats();
  const sec = cats[sci].sections.splice(ssi,1)[0];
  if(sci===tci){
    const insertIdx = ssi < tsi ? tsi-1 : tsi;
    cats[tci].sections.splice(Math.max(0,insertIdx),0,sec);
    save(); rerenderCat(tci);
  } else {
    cats[tci].sections.splice(tsi,0,sec);
    save(); rerenderCat(sci); rerenderCat(tci);
  }
  toast('↕ Sektion verschoben');
}

function dropQtyRow(tci,tsi,insertAfter){
  if(!dragSrcSec) return;
  const {ci:sci,si:ssi} = dragSrcSec;
  dragSrcSec = null; dragType = null;
  if(sci===tci && ssi===tsi) return;
  const cats = currentCats();
  const sec = cats[sci].sections.splice(ssi,1)[0];
  let adj = (sci===tci && ssi<tsi) ? tsi-1 : tsi;
  let idx = insertAfter ? adj+1 : adj;
  idx = Math.max(0, Math.min(idx, cats[tci].sections.length));
  cats[tci].sections.splice(idx,0,sec);
  save(); rerenderCat(tci);
  if(sci!==tci) rerenderCat(sci);
}

function dropOnGroupHeader(targetGroupId){
  if(!dragSrcGrp) return;
  const {groupId:srcId} = dragSrcGrp;
  dragSrcGrp = null; dragType = null;
  document.querySelectorAll('.grp-section-hdr.grp-dragging').forEach(el=>el.classList.remove('grp-dragging'));
  if(srcId===targetGroupId) return;
  const cat = getActiveCatalog();
  if(!cat || !cat.groups) return;
  const srcIdx = cat.groups.findIndex(g=>g.id===srcId);
  const tgtIdx = cat.groups.findIndex(g=>g.id===targetGroupId);
  if(srcIdx<0||tgtIdx<0) return;
  const grp = cat.groups.splice(srcIdx,1)[0];
  cat.groups.splice(tgtIdx,0,grp);
  saveCatalogsStore();
  currentCats().forEach((_,ci)=>rerenderCat(ci));
  toast('↕ Gruppe verschoben');
}

function editSectionName(ci,si){
  const sec = currentCats()[ci].sections[si];
  showPrompt('Sektionsname ändern:', sec.type_name, newName=>{
    if(!newName.trim()) return;
    newName = newName.trim();
    const cat = getActiveCatalog();
    if(cat && cat.types[newName] && newName!==sec.type_name){
      toast('Name existiert bereits!', true); return;
    }
    if(cat && cat.types[sec.type_name]){
      cat.types[newName] = cat.types[sec.type_name];
      delete cat.types[sec.type_name];
      saveCatalogsStore();
    }
    sec.type_name = newName;
    save(); rerenderCat(ci);
    toast(`✓ Umbenannt in „${newName}"`);
  }, 'Sektion umbenennen');
}

function editGroupName(groupId){
  const cat = getActiveCatalog();
  const grp = (cat?.groups||[]).find(g=>g.id===groupId);
  if(!grp) return;
  showPrompt('Gruppenname ändern:', grp.name, newName=>{
    if(!newName.trim()) return;
    grp.name = newName.trim();
    saveCatalogsStore();
    currentCats().forEach((_,ci)=>rerenderCat(ci));
    toast(`✓ Umbenannt in „${grp.name}"`);
  }, 'Gruppe umbenennen');
}

function dropOnSec(tci,tsi,e){
  e.preventDefault();
  document.querySelectorAll('.sechdr.drop-target,.sechdr.sec-drop-target').forEach(el=>el.classList.remove('drop-target','sec-drop-target'));
  if(dragType==='section'){ dropSecOnSec(tci,tsi); return; }
  if(!dragSrc) return;
  const {ci:sci,si:ssi,ii:sii} = dragSrc;
  dragSrc = null; dragType = null;
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
  if(!item) return;
  const sec = currentCats()[ci].sections[si];
  const label = item.name || item.length || sec.type_name || 'diese Zeile';
  showConfirm(`„${label}" wirklich löschen?`, ()=>{
    const sec = currentCats()[ci].sections[si];
    sec.items.splice(ii,1);
    if(sec.items.length === 0 && !_secHasLengths(ci,si)){
      currentCats()[ci].sections.splice(si,1);
    }
    save();
    rerenderCat(ci);
    recalcAll();
  }, 'Löschen', 'Ja, löschen');
}
function delSec(ci,si){
  const typeName = currentCats()[ci].sections[si].type_name;
  showConfirm(`Sektion „${typeName}" wirklich löschen?`, ()=>{
    currentCats()[ci].sections.splice(si,1); save(); rerenderCat(ci);
  }, 'Löschen', 'Ja, löschen');
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
  showConfirm('Alle Daten löschen? Dies kann nicht rückgängig gemacht werden.', ()=>{
    localStorage.removeItem(STORAGE_KEY);
    state = {_project:'',_date:'',_activePosIdx:0,positions:[{name:'Standard',categories:CAT_ORDER.map(n=>({name:n,sections:[]}))}]};
    activePosIdx=0; render();
  }, 'Reset', 'Ja, alles löschen');
}
