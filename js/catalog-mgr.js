// ══════════════════════════════════════════════════
// KATALOG-MANAGER — Verwaltungs-UI
// ══════════════════════════════════════════════════
let _catMgrTab  = 1;      // 1 = Übersicht, 2 = Bearbeiten
let _catEditorId = null;  // welcher Katalog wird gerade bearbeitet

function openCatalogMgr(tab){
  _catMgrTab = tab||1;
  if(!_catEditorId) _catEditorId = activeCatalogId||'cat-default';
  document.getElementById('mTitle').textContent = 'Katalog-Verwaltung';
  document.getElementById('overlay').classList.add('open');
  _renderCatMgr();
}

function _renderCatMgr(){
  document.getElementById('mBody').innerHTML =
    `<div class="cat-mgr-tabs">
       <div class="cat-mgr-tab${_catMgrTab===1?' active':''}" onclick="_catMgrSwitchTab(1)">KATALOGE VERWALTEN</div>
       <div class="cat-mgr-tab${_catMgrTab===2?' active':''}" onclick="_catMgrSwitchTab(2)">KATALOG BEARBEITEN</div>
     </div>
     <div id="catMgrContent" style="margin-top:16px"></div>`;
  if(_catMgrTab===1) _renderCatMgrTab1();
  else _renderCatMgrTab2();
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-accent" onclick="closeWiz()">SCHLIESSEN</button>`;
}

function _catMgrSwitchTab(t){ _catMgrTab=t; _renderCatMgr(); }

function _renderCatMgrTab1(){
  const plans        = getPlansIndex();
  const activePlan   = plans.find(p=>p.id===activePlanId);
  const currentCatId = activePlan?.catalogId||'cat-default';
  const cats         = catalogsStore?.catalogs||[];
  const el           = document.getElementById('catMgrContent');
  el.innerHTML = `
    <div style="font-size:10px;letter-spacing:2px;color:var(--muted);margin-bottom:10px">AKTIVER KATALOG FÜR DIESEN PLAN</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">
      ${cats.map(c=>`
        <div class="catalog-row${c.id===currentCatId?' active-cat':''}">
          <div class="catalog-row-info">
            <span class="catalog-row-name">${esc(c.name)}</span>
            ${c.isBuiltin?'<span class="catalog-row-tag">Standard</span>':''}
            <span class="catalog-row-meta">${Object.keys(c.types||{}).length} Typen · ${Object.values(c.types||{}).reduce((a,b)=>a+b.items.length,0)} Einträge</span>
          </div>
          <div class="catalog-row-actions">
            ${c.id===currentCatId
              ? '<span style="color:var(--green);font-family:\'Share Tech Mono\',monospace;font-size:11px;letter-spacing:1px">✓ AKTIV</span>'
              : `<button class="btn btn-sm btn-green" onclick="catMgrAssign('${c.id}')">VERWENDEN</button>`}
            <button class="btn btn-sm" onclick="catMgrEdit('${c.id}')">BEARBEITEN</button>
            <button class="btn btn-sm" onclick="catEditorExport('${c.id}')">↓ EXPORTIEREN</button>
            ${!c.isBuiltin?`<button class="btn btn-sm" onclick="catMgrRename('${c.id}')">UMBENENNEN</button>
            <button class="btn btn-sm btn-red" onclick="catMgrDelete('${c.id}')">LÖSCHEN</button>`:''}
          </div>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:14px;">
      <button class="btn btn-green" onclick="catMgrCreateNew()">+ NEUER KATALOG</button>
      <label style="cursor:pointer">
        <input type="file" accept=".json" style="display:none" onchange="catMgrImportJSON(this)">
        <span class="btn" style="display:inline-block">↑ KATALOG IMPORTIEREN (JSON)</span>
      </label>
    </div>`;
}

function _renderCatMgrTab2(){
  const cats      = catalogsStore?.catalogs||[];
  const cat       = cats.find(c=>c.id===_catEditorId)||cats[0];
  if(!cat){ document.getElementById('catMgrContent').innerHTML='<div style="color:var(--muted)">Kein Katalog gefunden.</div>'; return; }
  const types     = cat.types||{};
  const topGroups = catGetTopGroups(cat);
  const safeId    = s => s.replace(/'/g,"&#39;");

  const byGroup = {};
  (cat.groups||[]).forEach(g=>{ byGroup[g.id]=[]; });
  byGroup['__none']=[];
  Object.entries(types).forEach(([key,val])=>{
    const gid = val.group||'__none';
    if(byGroup[gid]!==undefined) byGroup[gid].push({key,val});
    else byGroup['__none'].push({key,val});
  });

  const renderTypeRow = (key,val) => `
    <div class="type-block">
      <div class="type-block-header">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          <span class="type-block-name">${esc(key)}</span>
          <span style="font-size:10px;color:var(--muted);letter-spacing:1px">${esc(val.cat||'')}</span>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-sm btn-green" onclick="catEditorOpenTypeDetail('${cat.id}','${safeId(esc(key))}')">BEARBEITEN</button>
          <button class="btn btn-sm" style="color:var(--accent2);border-color:var(--accent2);" onclick="catEditorRenameType('${cat.id}','${safeId(esc(key))}')">✏ UMBENENNEN</button>
          ${!cat.isBuiltin?`<button class="btn btn-sm btn-red" onclick="catEditorDeleteType('${cat.id}','${safeId(esc(key))}')">LÖSCHEN</button>`:''}
        </div>
      </div>
    </div>`;

  const renderHierarchy = () => {
    let html='';
    topGroups.forEach(g=>{
      const subGroups   = catGetSubGroups(cat,g.id);
      const directTypes = byGroup[g.id]||[];
      const totalTypes  = directTypes.length+subGroups.reduce((s,sg)=>s+(byGroup[sg.id]||[]).length,0);
      html+=`<div style="margin-bottom:14px">
        <div class="group-header" style="display:flex;justify-content:space-between;align-items:center;">
          <span>▸ ${esc(g.name)} <span style="color:var(--muted);font-weight:400">(${totalTypes})</span></span>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="btn btn-sm" onclick="catEditorAddSubGroup('${cat.id}','${g.id}')">＋ UNTERGRUPPE</button>
            <button class="btn btn-sm" style="padding:2px 7px" onclick="catEditorRenameGroup('${cat.id}','${g.id}')" title="Umbenennen">✏</button>
            <button class="btn btn-sm btn-red" style="padding:2px 7px" onclick="catEditorDeleteGroup('${cat.id}','${g.id}')" title="Löschen">✕</button>
          </div>
        </div>
        ${directTypes.map(({key,val})=>renderTypeRow(key,val)).join('')}
        ${subGroups.map(sg=>{
          const sgTypes = byGroup[sg.id]||[];
          return `<div style="margin-left:18px;margin-top:4px">
            <div class="group-header" style="background:var(--bg2);border-left:3px solid var(--accent2);color:var(--accent2);display:flex;justify-content:space-between;align-items:center;">
              <span>· ${esc(sg.name)} <span style="color:var(--muted);font-weight:400">(${sgTypes.length})</span></span>
              <div style="display:flex;gap:4px;flex-shrink:0">
                <button class="btn btn-sm" style="padding:2px 7px" onclick="catEditorRenameGroup('${cat.id}','${sg.id}')" title="Umbenennen">✏</button>
                <button class="btn btn-sm btn-red" style="padding:2px 7px" onclick="catEditorDeleteGroup('${cat.id}','${sg.id}')" title="Löschen">✕</button>
              </div>
            </div>
            ${sgTypes.map(({key,val})=>renderTypeRow(key,val)).join('')}
          </div>`;
        }).join('')}
      </div>`;
    });
    const noneTypes = byGroup['__none']||[];
    if(noneTypes.length){
      html+=`<div style="margin-bottom:10px">
        <div class="group-header" style="color:var(--muted)">Ohne Gruppe <span style="font-weight:400">(${noneTypes.length})</span></div>
        ${noneTypes.map(({key,val})=>renderTypeRow(key,val)).join('')}
      </div>`;
    }
    if(!html) html=`<div style="color:var(--muted);font-size:13px;padding:12px">Noch keine Typen im Katalog.</div>`;
    return html;
  };

  document.getElementById('catMgrContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="font-size:10px;letter-spacing:2px;color:var(--muted)">KATALOG:</div>
      <select class="pinput" onchange="catEditorSwitch(this.value)" style="width:auto;min-width:180px">
        ${cats.map(c=>`<option value="${c.id}"${c.id===cat.id?' selected':''}>${esc(c.name)}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-green" onclick="catEditorExport('${cat.id}')">↓ EXPORTIEREN</button>
    </div>
    <div class="group-mgr-bar">
      <span style="font-size:10px;letter-spacing:2px;color:var(--muted);white-space:nowrap">OBERGRUPPEN:</span>
      ${topGroups.map(g=>`<span class="group-pill">
        <span>${esc(g.name)}</span>
        <button onclick="catEditorRenameGroup('${cat.id}','${g.id}')" title="Umbenennen">✏</button>
        <button onclick="catEditorDeleteGroup('${cat.id}','${g.id}')" title="Löschen">✕</button>
      </span>`).join('')}
      <button class="btn btn-sm" onclick="catEditorAddGroup('${cat.id}')">+ NEUE OBERGRUPPE</button>
    </div>
    <div style="background:var(--bg3);border:1px solid var(--border);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:10px;letter-spacing:2px;color:var(--muted)">+ NEUER TYP:</span>
      <input class="pinput" id="newTypeName" placeholder="z.B. DMX 7-Pin" style="width:180px">
      <select class="pinput" id="newTypeCat" style="width:auto">${CAT_ORDER.map(cn=>`<option>${cn}</option>`).join('')}</select>
      <select class="pinput" id="newTypeGroup" style="width:auto">${catBuildGroupOptions(cat,'')}</select>
      <button class="btn btn-sm btn-green" onclick="catEditorAddType('${cat.id}')">HINZUFÜGEN</button>
    </div>
    <div style="max-height:420px;overflow-y:auto;">
      ${renderHierarchy()}
    </div>`;
}

// ── TYP DETAILANSICHT ──────────────────────────────────────────────
function catEditorOpenTypeDetail(catalogId, typeKey){
  const cat     = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const typeVal = cat.types[typeKey]; if(!typeVal) return;
  const safeId  = s => s.replace(/'/g,"&#39;");
  const renderRows = ()=> (typeVal.items||[]).map((it,idx)=>`
    <div class="entry-row" id="erow-${idx}">
      <span class="entry-row-val" id="eval-${idx}">${esc(it.l||it.n||'—')}</span>
      <div class="entry-row-actions">
        <button class="btn btn-sm" style="color:var(--accent2);border-color:var(--accent2);"
          onclick="catEditorDetailEditItem('${safeId(catalogId)}','${safeId(esc(typeKey))}',${idx})">✏ BEARBEITEN</button>
        <button class="btn btn-sm btn-red"
          onclick="catEditorDetailDeleteItem('${safeId(catalogId)}','${safeId(esc(typeKey))}',${idx})">✕ LÖSCHEN</button>
      </div>
    </div>`).join('');
  document.getElementById('catMgrContent').innerHTML = `
    <div class="type-detail-header">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-sm" onclick="_renderCatMgrTab2()">← ZURÜCK</button>
        <span style="font-weight:700;font-size:15px;color:var(--text)">${esc(typeKey)}</span>
        <span style="font-size:11px;color:var(--muted)">${esc(typeVal.cat||'')}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap;">
        <span style="font-size:10px;letter-spacing:2px;color:var(--muted)">GRUPPE:</span>
        <select class="pinput" style="width:auto" onchange="catEditorSetTypeGroup('${safeId(catalogId)}','${safeId(esc(typeKey))}',this.value)">
          ${catBuildGroupOptions(cat,typeVal.group||'')}
        </select>
        <button class="btn btn-sm" style="color:var(--accent2);border-color:var(--accent2);"
          onclick="catEditorRenameType('${safeId(catalogId)}','${safeId(esc(typeKey))}');catEditorOpenTypeDetail('${safeId(catalogId)}','${safeId(esc(typeKey))}')">✏ TYP UMBENENNEN</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px;background:var(--bg2);border-radius:4px;">
        <span style="font-size:10px;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Artikel-Typ:</span>
        <button class="btn btn-sm${(typeVal.unit_type||'lengths')==='qty'?' btn-accent':''}"
          onclick="catEditorSetUnitType('${safeId(catalogId)}','${safeId(esc(typeKey))}','qty')">Stückzahl</button>
        <button class="btn btn-sm${(typeVal.unit_type||'lengths')==='lengths'?' btn-accent':''}"
          onclick="catEditorSetUnitType('${safeId(catalogId)}','${safeId(esc(typeKey))}','lengths')">Mit Längen</button>
      </div>
    </div>
    <div class="type-detail-addform"${(typeVal.unit_type||'lengths')==='qty'?' style="display:none"':''}>
      <span style="font-size:10px;letter-spacing:2px;color:var(--muted)">NEUER EINTRAG:</span>
      <input class="pinput" id="detailNewItem" placeholder="z.B. 15m oder 0.5m"
        style="width:160px" onkeydown="if(event.key==='Enter')catEditorDetailAddItem('${safeId(catalogId)}','${safeId(esc(typeKey))}')">
      <button class="btn btn-sm btn-green"
        onclick="catEditorDetailAddItem('${safeId(catalogId)}','${safeId(esc(typeKey))}')">+ HINZUFÜGEN</button>
      <span style="font-size:11px;color:var(--muted)">${(typeVal.items||[]).length} Einträge</span>
    </div>
    ${(typeVal.unit_type||'lengths')==='qty'?`<p style="font-size:11px;color:var(--muted);padding:8px 0">Stückzahl-Artikel haben keine Längen-Einträge.</p>`:''}
    <div id="detailEntryList" style="max-height:340px;overflow-y:auto;border:1px solid var(--border);">
      ${renderRows()}
    </div>`;
}

function catEditorSetUnitType(catalogId, typeKey, unitType){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].unit_type = unitType;
  saveCatalogsStore();
  rerenderAllCats();
  catEditorOpenTypeDetail(catalogId, typeKey);
}

function catEditorDetailAddItem(catalogId, typeKey){
  const cat   = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const input = document.getElementById('detailNewItem'); if(!input) return;
  const val   = input.value.trim(); if(!val){ input.focus(); return; }
  const lVal  = val.match(/^\d+([.,]\d+)?$/) ? val+'m' : val;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].items.push({n:typeKey,l:lVal});
  cat.types[typeKey].items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
  saveCatalogsStore();
  input.value=''; input.focus();
  const safeId = s => s.replace(/'/g,"&#39;");
  const list = document.getElementById('detailEntryList');
  if(list) list.innerHTML = (cat.types[typeKey].items||[]).map((it,idx)=>`
    <div class="entry-row">
      <span class="entry-row-val">${esc(it.l||it.n||'—')}</span>
      <div class="entry-row-actions">
        <button class="btn btn-sm" style="color:var(--accent2);border-color:var(--accent2);"
          onclick="catEditorDetailEditItem('${safeId(catalogId)}','${safeId(esc(typeKey))}',${idx})">✏ BEARBEITEN</button>
        <button class="btn btn-sm btn-red"
          onclick="catEditorDetailDeleteItem('${safeId(catalogId)}','${safeId(esc(typeKey))}',${idx})">✕ LÖSCHEN</button>
      </div>
    </div>`).join('');
  const countEl = document.querySelector('.type-detail-addform span:last-child');
  if(countEl) countEl.textContent = cat.types[typeKey].items.length+' Einträge';
  toast('✓ „'+lVal+'" hinzugefügt');
}

function catEditorDetailEditItem(catalogId, typeKey, idx){
  const cat   = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const items = cat.types[typeKey]?.items; if(!items||!items[idx]) return;
  const current = items[idx].l||items[idx].n||'';
  const val = prompt('Eintrag bearbeiten:',current); if(val===null||!val.trim()) return;
  const lVal = val.trim().match(/^\d+([.,]\d+)?$/) ? val.trim()+'m' : val.trim();
  items[idx] = {n:typeKey,l:lVal};
  items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
  saveCatalogsStore();
  catEditorOpenTypeDetail(catalogId, typeKey);
  toast('✓ Eintrag aktualisiert');
}

function catEditorDetailDeleteItem(catalogId, typeKey, idx){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].items.splice(idx,1);
  saveCatalogsStore();
  catEditorOpenTypeDetail(catalogId, typeKey);
}

// ── GRUPPEN CRUD ────────────────────────────────────────────────────
function _genGroupId(){ return 'grp-'+Date.now().toString(36); }

function catEditorAddGroup(catalogId){
  const cat  = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const name = prompt('Name der neuen Obergruppe (z.B. Datenkabel, Stromkabel):');
  if(!name||!name.trim()) return;
  cat.groups.push({id:_genGroupId(),name:name.trim()});
  saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Obergruppe „'+name.trim()+'" angelegt');
}

function catEditorAddSubGroup(catalogId, parentGroupId){
  const cat    = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const parent = cat.groups.find(g=>g.id===parentGroupId); if(!parent) return;
  const name   = prompt('Name der Untergruppe (z.B. DMX Kabel, Netzwerk):');
  if(!name||!name.trim()) return;
  cat.groups.push({id:_genGroupId(),name:name.trim(),parentId:parentGroupId});
  saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Untergruppe „'+name.trim()+'" angelegt');
}

function catEditorRenameGroup(catalogId, groupId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const g   = cat.groups.find(x=>x.id===groupId); if(!g) return;
  const name = prompt('Neuer Gruppenname:',g.name); if(!name||!name.trim()) return;
  g.name = name.trim(); saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Umbenannt');
}

function catEditorDeleteGroup(catalogId, groupId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const g   = cat.groups.find(x=>x.id===groupId); if(!g) return;
  const childGroups = catGetSubGroups(cat,groupId);
  const msg = childGroups.length
    ? `Gruppe „${g.name}" und ${childGroups.length} Untergruppe(n) löschen?\nZugeordnete Typen werden zu „Ohne Gruppe".`
    : `Gruppe „${g.name}" löschen? Zugeordnete Typen werden zu „Ohne Gruppe".`;
  if(!confirm(msg)) return;
  const allIds = [groupId,...childGroups.map(x=>x.id)];
  Object.values(cat.types).forEach(t=>{ if(allIds.includes(t.group)) delete t.group; });
  cat.groups = cat.groups.filter(x=>!allIds.includes(x.id));
  saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Gruppe gelöscht');
}

function catEditorSetTypeGroup(catalogId, typeKey, groupId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  if(groupId) cat.types[typeKey].group=groupId;
  else delete cat.types[typeKey].group;
  saveCatalogsStore(); toast('✓ Gruppe zugewiesen');
}

function catMgrAssign(catalogId){
  setActivePlanCatalog(activePlanId, catalogId);
  _renderCatMgrTab1();
  toast('✓ Katalog „'+getActiveCatalog().name+'" diesem Plan zugewiesen');
}

function catMgrEdit(catalogId){ _catEditorId=catalogId; _catMgrSwitchTab(2); }

function catMgrRename(catalogId){
  const cat  = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const name = prompt('Neuer Katalog-Name:',cat.name); if(!name||!name.trim()) return;
  cat.name = name.trim(); saveCatalogsStore(); _renderCatMgrTab1();
  renderActiveCatalogBadge(); toast('✓ Umbenannt');
}

function catMgrDelete(catalogId){
  const plans = getPlansIndex();
  const using = plans.filter(p=>(p.catalogId||'cat-default')===catalogId);
  if(using.length){ toast(`Katalog wird von ${using.length} Plan(en) verwendet — erst einen anderen Katalog zuweisen.`,true); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!confirm(`Katalog „${cat.name}" wirklich löschen? Alle Einträge gehen verloren.`)) return;
  catalogsStore.catalogs = catalogsStore.catalogs.filter(c=>c.id!==catalogId);
  saveCatalogsStore(); _renderCatMgrTab1(); toast('Katalog gelöscht');
}

function catMgrCreateNew(){
  const name = prompt('Name des neuen Katalogs (z.B. Firma ABC):'); if(!name||!name.trim()) return;
  const copy = confirm('Kopie vom Standard-Katalog erstellen?\n(Nein = leerer Katalog)');
  const stdCat = catalogsStore.catalogs.find(c=>c.id==='cat-default');
  const types  = copy&&stdCat ? JSON.parse(JSON.stringify(stdCat.types)) : {};
  const id = genCatalogId();
  catalogsStore.catalogs.push({id,name:name.trim(),isBuiltin:false,
    created:new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}),groups:[],types});
  saveCatalogsStore(); _catEditorId=id; _renderCatMgrTab1();
  toast('✓ Katalog „'+name.trim()+'" erstellt');
}

function catMgrImportJSON(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const data     = JSON.parse(e.target.result);
      const rawTypes = data.types||data;
      const catName  = (data.name&&typeof data.name==='string') ? data.name : (file.name.replace(/\.json$/i,'')||'Importierter Katalog');
      const types    = {};
      Object.entries(rawTypes).forEach(([key,val])=>{
        if(typeof val==='object'&&val.items) types[key]={cat:val.cat||'Kabel Liste',items:val.items,...(val.group?{group:val.group}:{})};
      });
      if(!Object.keys(types).length){ toast('Keine gültigen Katalog-Typen gefunden.',true); return; }
      const groups = (Array.isArray(data.groups)?data.groups:[]).filter(g=>g.id&&g.name);
      const id = genCatalogId();
      catalogsStore.catalogs.push({id,name:catName,isBuiltin:false,
        created:new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}),groups,types});
      saveCatalogsStore(); _renderCatMgrTab1();
      toast('✓ Katalog „'+catName+'" importiert');
    }catch(err){ toast('Import fehlgeschlagen: '+err.message,true); }
  };
  reader.readAsText(file); input.value='';
}

function catEditorSwitch(catalogId){ _catEditorId=catalogId; _renderCatMgrTab2(); }

function catEditorExport(catalogId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const out = {name:cat.name,groups:cat.groups||[],types:cat.types};
  downloadJSON(out,(cat.name||'katalog').replace(/[^a-zA-Z0-9äöüÄÖÜß]/g,'_').toLowerCase()+'.json');
  toast('✓ Katalog exportiert');
}

function catEditorAddType(catalogId){
  const name    = document.getElementById('newTypeName').value.trim();
  const catName = document.getElementById('newTypeCat').value;
  const groupId = document.getElementById('newTypeGroup')?.value||'';
  if(!name){ toast('Bitte einen Typ-Namen eingeben.',true); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(cat.types[name]){ toast('Dieser Typ existiert bereits.',true); return; }
  const entry = {cat:catName,items:[],unit_type:'qty'};
  if(groupId) entry.group=groupId;
  cat.types[name] = entry;
  saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Typ „'+name+'" hinzugefügt');
}

function catEditorRenameType(catalogId,typeKey){
  const cat     = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const newName = prompt('Neuer Typ-Name:',typeKey); if(!newName||!newName.trim()||newName.trim()===typeKey) return;
  const n = newName.trim();
  if(cat.types[n]){ toast('Dieser Typ-Name existiert bereits.',true); return; }
  const newTypes = {};
  Object.entries(cat.types).forEach(([k,v])=>{ newTypes[k===typeKey?n:k]=v; });
  cat.types = newTypes;
  saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Typ umbenannt in „'+n+'"');
}

function catEditorDeleteType(catalogId,typeKey){
  if(!confirm(`Typ „${typeKey}" aus dem Katalog löschen?\nBereits hinzugefügte Projektpositionen bleiben erhalten.`)) return;
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  delete cat.types[typeKey]; saveCatalogsStore(); _renderCatMgrTab2(); toast('✓ Typ gelöscht');
}

function downloadJSON(data, filename){
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
