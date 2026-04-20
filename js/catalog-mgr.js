// ══════════════════════════════════════════════════
// KATALOG-MANAGER — Verwaltungs-UI (Tree-Editor)
// ══════════════════════════════════════════════════
let _catMgrTab          = 1;     // 1 = Übersicht, 2 = Bearbeiten
let _catEditorId        = null;  // aktiver Katalog im Editor
let _catEditorWelt      = null;  // aktive Welt im Tree-Tab
let _catTreeInlineState = null;  // {mode, catalogId, id?, parentId?, weltName?}

// ── ÖFFNEN & HAUPT-RENDER ──────────────────────────────────────────
function openCatalogMgr(tab){
  _catMgrTab = tab||1;
  if(!_catEditorId) _catEditorId = activeCatalogId||'cat-default';
  wiz = {};
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
  document.getElementById('mFooter').innerHTML=
    `<button class="btn btn-accent" onclick="closeWiz()">SCHLIESSEN</button>`;
}

function _catMgrSwitchTab(t){ _catMgrTab=t; _renderCatMgr(); }

// ── TAB 1: KATALOGE VERWALTEN ──────────────────────────────────────
function _renderCatMgrTab1(){
  const plans        = getPlansIndex();
  const activePlan   = plans.find(p=>p.id===activePlanId);
  const currentCatId = activePlan?.catalogId||'cat-default';
  const cats         = catalogsStore?.catalogs||[];
  const s            = v => JSON.stringify(v).replace(/"/g,'&quot;');
  document.getElementById('catMgrContent').innerHTML = `
    <div style="font-size:10px;letter-spacing:2px;color:var(--muted);margin-bottom:10px">AKTIVER KATALOG FÜR DIESEN PLAN</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">
      ${cats.map(c=>`
        <div class="catalog-row${c.id===currentCatId?' active-cat':''}">
          <div class="catalog-row-info">
            <span class="catalog-row-name">${esc(c.name)}</span>
            ${c.isBuiltin?'<span class="catalog-row-tag">Standard</span>':''}
            <span class="catalog-row-meta">${Object.keys(c.types||{}).length} Artikel · ${Object.values(c.types||{}).reduce((a,b)=>a+(b.items||[]).length,0)} Einträge</span>
          </div>
          <div class="catalog-row-actions">
            ${c.id===currentCatId
              ? '<span style="color:var(--green);font-family:\'Share Tech Mono\',monospace;font-size:11px;letter-spacing:1px">✓ AKTIV</span>'
              : `<button class="btn btn-sm btn-green" onclick="catMgrAssign(${s(c.id)})">VERWENDEN</button>`}
            <button class="btn btn-sm" onclick="catMgrEdit(${s(c.id)})">BEARBEITEN</button>
            <button class="btn btn-sm" onclick="catEditorExport(${s(c.id)})">↓ EXPORTIEREN</button>
            ${!c.isBuiltin?`<button class="btn btn-sm" onclick="catMgrRename(${s(c.id)})">UMBENENNEN</button>
            <button class="btn btn-sm btn-red" onclick="catMgrDelete(${s(c.id)})">LÖSCHEN</button>`:''}
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

// ── TAB 2: KATALOG BEARBEITEN (TREE) ──────────────────────────────
function _renderCatMgrTab2(){
  const cats = catalogsStore?.catalogs||[];
  const cat  = cats.find(c=>c.id===_catEditorId)||cats[0];
  if(!cat){
    document.getElementById('catMgrContent').innerHTML='<div style="color:var(--muted)">Kein Katalog gefunden.</div>';
    return;
  }
  if(!_catEditorWelt) _catEditorWelt = CAT_ORDER[0];
  const s = v => JSON.stringify(v).replace(/"/g,'&quot;');

  document.getElementById('catMgrContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="font-size:10px;letter-spacing:2px;color:var(--muted)">KATALOG:</div>
      <select class="selin" onchange="catEditorSwitch(this.value)" style="width:auto;min-width:180px;margin-bottom:0;font-size:14px;padding:6px 12px">
        ${cats.map(c=>`<option value="${c.id}"${c.id===cat.id?' selected':''}>${esc(c.name)}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-green" onclick="catEditorExport(${s(cat.id)})">↓ EXPORTIEREN</button>
    </div>
    <div class="cat-tree-welten">
      ${CAT_ORDER.map(w=>`<div class="cat-tree-welt-tab${w===_catEditorWelt?' active':''}"
        onclick="catTreeSwitchWelt(${s(w)})">${w}</div>`).join('')}
    </div>
    <div class="cat-tree-topbar">
      <button class="btn btn-sm cat-tree-add-gruppe"
        onclick="catTreeAddInline(${s(cat.id)},'add-gruppe',null,${s(_catEditorWelt)})">+ GRUPPE</button>
    </div>
    <div id="catTreeBody" style="max-height:440px;overflow-y:auto;">
      ${_renderCatTree(cat, _catEditorWelt)}
    </div>`;
}

function catTreeSwitchWelt(weltName){
  _catEditorWelt = weltName;
  _catTreeInlineState = null;
  _renderCatMgrTab2();
}

// ── TREE RENDERING ─────────────────────────────────────────────────
function _renderCatTree(cat, weltName){
  const types     = cat.types||{};
  const topGroups = catGetTopGroups(cat);
  const s         = v => JSON.stringify(v).replace(/"/g,'&quot;');

  // Typen dieser Welt nach Gruppe aufteilen
  const byGroup = {};
  (cat.groups||[]).forEach(g=>{ byGroup[g.id]=[]; });
  byGroup['__none']=[];
  Object.entries(types).forEach(([key,val])=>{
    if((val.cat||CAT_ORDER[0]) !== weltName) return;
    const gid = val.group||'__none';
    if(byGroup[gid]!==undefined) byGroup[gid].push({key,val});
    else byGroup['__none'].push({key,val});
  });

  // Sichtbare Top-Gruppen: hat Typen in dieser Welt, oder ein aktives Add-State
  const is = _catTreeInlineState;
  const weltsTopGroups = topGroups.filter(g=>{
    if((byGroup[g.id]||[]).length>0) return true;
    if(catGetSubGroups(cat,g.id).some(sg=>(byGroup[sg.id]||[]).length>0)) return true;
    if(is && (is.parentId===g.id || catGetSubGroups(cat,g.id).some(sg=>is.parentId===sg.id))) return true;
    return false;
  });

  let html = '';

  const renderInlineAddRow = (indent, saveCall) => {
    const cls = indent===2?'tree-indent-2':indent===1?'tree-indent-1':'';
    return `<div class="tree-row editing ${cls}">
      <div class="inline-edit-wrap">
        <input class="inline-input" id="tree-inline-input" placeholder="Name eingeben…"
          onkeydown="if(event.key==='Enter'){${saveCall}}else if(event.key==='Escape'){catTreeInlineCancel()}" autofocus>
        <button class="inline-btn ok" onclick="${saveCall}">✓</button>
        <button class="inline-btn cancel" onclick="catTreeInlineCancel()">✗</button>
      </div>
    </div>`;
  };

  const renderArtikelRow = (key, val, indent) => {
    const isKabel   = (val.unit_type||'qty') === 'lengths';
    const badgeCls  = isKabel ? 'badge-kabel' : 'badge-geraet';
    const badgeTxt  = isKabel ? 'Kabel' : 'Gerät';
    const isEditing = is?.mode==='edit-artikel' && is.id===key;
    const indCls    = indent===2?'tree-indent-2':indent===1?'tree-indent-1':'';
    const catId     = cat.id;

    let row = `<div class="tree-row tree-artikel ${indCls}">`;
    if(isEditing){
      row += `<div class="inline-edit-wrap" style="flex:1">
        <span style="font-size:11px;color:var(--muted);margin-right:4px">▶</span>
        <input class="inline-input" id="tree-inline-input" value="${esc(key)}"
          onkeydown="if(event.key==='Enter'){catTreeSaveRenameArtikel(${s(catId)},${s(key)})}else if(event.key==='Escape'){catTreeInlineCancel()}" autofocus>
        <button class="inline-btn ok" onclick="catTreeSaveRenameArtikel(${s(catId)},${s(key)})">✓</button>
        <button class="inline-btn cancel" onclick="catTreeInlineCancel()">✗</button>
      </div>`;
    } else {
      const weltOpts = CAT_ORDER.map(w=>`<option value="${w}"${w===(val.cat||CAT_ORDER[0])?' selected':''}>${w}</option>`).join('');
      row += `<span class="tree-toggle">▶</span>
        <span class="tree-label tree-artikel-link" onclick="openArticleEdit(${s(catId)},${s(key)})" title="Artikel bearbeiten">${esc(key)}</span>
        <span class="tree-badge ${badgeCls}">${badgeTxt}</span>
        <select class="cat-welt-sel" title="Welt wechseln"
          onchange="catEditorSetCat(${s(catId)},${s(key)},this.value)">${weltOpts}</select>
        <div class="tree-actions">
          <button onclick="catTreeToggleUnitType(${s(catId)},${s(key)})" title="${isKabel?'Zu Gerät wechseln':'Zu Kabel wechseln'}" style="font-size:10px;opacity:.65">
            ${isKabel?'→Gerät':'→Kabel'}
          </button>
          <button onclick="catTreeInlineEditArtikel(${s(catId)},${s(key)})" title="Umbenennen">✏</button>
          <button class="del-btn" onclick="catEditorDeleteType(${s(catId)},${s(key)})" title="Löschen">✕</button>
        </div>`;
    }
    row += '</div>';

    // Längen-Tags für Kabel-Artikel
    if(isKabel && !isEditing){
      const items      = val.items||[];
      const isAddLen   = is?.mode==='add-len' && is.id===key;
      const tagIndent  = indent===2?'padding-left:52px':indent===1?'padding-left:36px':'padding-left:20px';
      row += `<div class="len-tags" style="${tagIndent}">`;
      items.forEach((it,idx)=>{
        const label = it.l||it.n||'?';
        row += `<span class="len-tag">${esc(label)}<button class="len-del"
          onclick="catTreeDeleteLen(${s(catId)},${s(key)},${idx})" title="Löschen">✕</button></span>`;
      });
      if(isAddLen){
        row += `<span class="len-add-wrap">
          <input class="len-add-input" id="tree-inline-input" placeholder="z.B. 15m"
            onkeydown="if(event.key==='Enter'){catTreeSaveLen(${s(catId)},${s(key)})}else if(event.key==='Escape'){catTreeInlineCancel()}" autofocus>
          <button class="inline-btn ok" style="border-color:rgba(74,232,160,.4);color:var(--green)"
            onclick="catTreeSaveLen(${s(catId)},${s(key)})">✓</button>
        </span>`;
      } else {
        row += `<button class="len-add-btn" onclick="catTreeAddLenInline(${s(catId)},${s(key)})">+ Länge</button>`;
      }
      row += '</div>';
    }
    return row;
  };

  // ── Gruppen dieser Welt ─────────────────────────────────────────
  weltsTopGroups.forEach(g=>{
    const subGroups  = catGetSubGroups(cat,g.id);
    const directTypes= byGroup[g.id]||[];
    const isEditing  = is?.mode==='edit-gruppe' && is.id===g.id;
    const isAddUG    = is?.mode==='add-ug'      && is.parentId===g.id;
    const isAddArt   = is?.mode==='add-artikel' && is.parentId===g.id;

    html += `<div class="tree-row tree-gruppe">`;
    if(isEditing){
      html += `<div class="inline-edit-wrap" style="flex:1">
        <span style="font-size:11px;color:var(--muted);margin-right:4px">▼</span>
        <input class="inline-input" id="tree-inline-input" value="${esc(g.name)}"
          onkeydown="if(event.key==='Enter'){catTreeSaveRenameGruppe(${s(cat.id)},${s(g.id)})}else if(event.key==='Escape'){catTreeInlineCancel()}" autofocus>
        <button class="inline-btn ok" onclick="catTreeSaveRenameGruppe(${s(cat.id)},${s(g.id)})">✓</button>
        <button class="inline-btn cancel" onclick="catTreeInlineCancel()">✗</button>
      </div>`;
    } else {
      const grpWeltOpts = CAT_ORDER.map(w=>`<option value="${w}"${w===weltName?' selected':''}>${w}</option>`).join('');
      html += `<span class="tree-toggle">▼</span>
        <span class="tree-label">${esc(g.name)}</span>
        <select class="cat-welt-sel" title="Alle Artikel dieser Gruppe in andere Welt verschieben"
          onchange="catEditorSetGroupCat(${s(cat.id)},${s(g.id)},this.value)">${grpWeltOpts}</select>
        <div class="tree-actions">
          <button onclick="catTreeAddInline(${s(cat.id)},'add-ug',${s(g.id)},null)" title="+ Untergruppe" style="font-size:10px">+UG</button>
          <button onclick="catTreeAddInline(${s(cat.id)},'add-artikel',${s(g.id)},${s(weltName)})" title="+ Artikel" style="font-size:10px">+Art</button>
          <button onclick="catTreeInlineEditGruppe(${s(cat.id)},${s(g.id)})" title="Umbenennen">✏</button>
          <button class="del-btn" onclick="catEditorDeleteGroup(${s(cat.id)},${s(g.id)})" title="Gruppe löschen">✕</button>
        </div>`;
    }
    html += '</div>';

    // Direkte Typen (ohne Untergruppe)
    directTypes.forEach(({key,val})=>{ html += renderArtikelRow(key,val,1); });
    if(isAddArt) html += renderInlineAddRow(1,`catTreeSaveAddArtikel(${s(cat.id)})`);

    // Untergruppen
    subGroups.forEach(sg=>{
      const sgTypes  = byGroup[sg.id]||[];
      const isEditSG = is?.mode==='edit-gruppe'  && is.id===sg.id;
      const isAddSGA = is?.mode==='add-artikel'  && is.parentId===sg.id;

      html += `<div class="tree-row tree-untergruppe tree-indent-1">`;
      if(isEditSG){
        html += `<div class="inline-edit-wrap" style="flex:1">
          <span style="font-size:11px;color:var(--muted);margin-right:4px">▽</span>
          <input class="inline-input" id="tree-inline-input" value="${esc(sg.name)}"
            onkeydown="if(event.key==='Enter'){catTreeSaveRenameGruppe(${s(cat.id)},${s(sg.id)})}else if(event.key==='Escape'){catTreeInlineCancel()}" autofocus>
          <button class="inline-btn ok" onclick="catTreeSaveRenameGruppe(${s(cat.id)},${s(sg.id)})">✓</button>
          <button class="inline-btn cancel" onclick="catTreeInlineCancel()">✗</button>
        </div>`;
      } else {
        const ugWeltOpts = CAT_ORDER.map(w=>`<option value="${w}"${w===weltName?' selected':''}>${w}</option>`).join('');
        html += `<span class="tree-toggle" style="opacity:.55">▽</span>
          <span class="tree-label" style="font-weight:500;font-size:12px">${esc(sg.name)}</span>
          <select class="cat-welt-sel" title="Alle Artikel dieser Untergruppe in andere Welt verschieben"
            onchange="catEditorSetGroupCat(${s(cat.id)},${s(sg.id)},this.value)">${ugWeltOpts}</select>
          <div class="tree-actions">
            <button onclick="catTreeAddInline(${s(cat.id)},'add-artikel',${s(sg.id)},${s(weltName)})" title="+ Artikel" style="font-size:10px">+Art</button>
            <button onclick="catTreeInlineEditGruppe(${s(cat.id)},${s(sg.id)})" title="Umbenennen">✏</button>
            <button class="del-btn" onclick="catEditorDeleteGroup(${s(cat.id)},${s(sg.id)})" title="Untergruppe löschen">✕</button>
          </div>`;
      }
      html += '</div>';

      sgTypes.forEach(({key,val})=>{ html += renderArtikelRow(key,val,2); });
      if(isAddSGA) html += renderInlineAddRow(2,`catTreeSaveAddArtikel(${s(cat.id)})`);
    });

    if(isAddUG) html += renderInlineAddRow(1,`catTreeSaveAddUG(${s(cat.id)},${s(g.id)})`);
  });

  // Typen ohne Gruppe in dieser Welt
  const noneTypes = byGroup['__none']||[];
  if(noneTypes.length){
    html += `<div class="group-header" style="color:var(--muted);margin-top:8px">
      Ohne Gruppe <span style="font-weight:400">(${noneTypes.length})</span>
    </div>`;
    noneTypes.forEach(({key,val})=>{ html += renderArtikelRow(key,val,0); });
  }

  // Inline-Add für neue Gruppe dieser Welt (am Ende)
  if(is?.mode==='add-gruppe' && is.weltName===weltName){
    html += renderInlineAddRow(0,`catTreeSaveAddGruppe(${s(cat.id)},${s(weltName)})`);
  }

  if(!html) html = `<div class="tree-empty">Keine Artikel in ${weltName}. Klicke „+ GRUPPE" um zu beginnen.</div>`;
  return html;
}

// ── INLINE EDIT: START ──────────────────────────────────────────────
function catTreeInlineEditGruppe(catalogId, groupId){
  _catTreeInlineState = {mode:'edit-gruppe', catalogId, id:groupId};
  _renderCatMgrTab2();
  setTimeout(()=>document.getElementById('tree-inline-input')?.focus(),50);
}

function catTreeInlineEditArtikel(catalogId, typeKey){
  _catTreeInlineState = {mode:'edit-artikel', catalogId, id:typeKey};
  _renderCatMgrTab2();
  setTimeout(()=>document.getElementById('tree-inline-input')?.focus(),50);
}

function catTreeAddInline(catalogId, mode, parentId, weltName){
  _catTreeInlineState = {mode, catalogId, parentId, weltName};
  _renderCatMgrTab2();
  setTimeout(()=>document.getElementById('tree-inline-input')?.focus(),50);
}

function catTreeAddLenInline(catalogId, typeKey){
  _catTreeInlineState = {mode:'add-len', catalogId, id:typeKey};
  _renderCatMgrTab2();
  setTimeout(()=>document.getElementById('tree-inline-input')?.focus(),50);
}

function catTreeInlineCancel(){
  _catTreeInlineState = null;
  _renderCatMgrTab2();
}

// ── INLINE EDIT: SAVE ───────────────────────────────────────────────
function catTreeSaveRenameGruppe(catalogId, groupId){
  const val = document.getElementById('tree-inline-input')?.value.trim();
  if(!val){ catTreeInlineCancel(); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const g   = cat.groups.find(x=>x.id===groupId); if(!g) return;
  g.name = val;
  saveCatalogsStore();
  _catTreeInlineState = null;
  _renderCatMgrTab2();
  toast('✓ Umbenannt');
}

function catTreeSaveRenameArtikel(catalogId, typeKey){
  const val = document.getElementById('tree-inline-input')?.value.trim();
  if(!val){ catTreeInlineCancel(); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(val===typeKey){ _catTreeInlineState=null; _renderCatMgrTab2(); return; }
  if(cat.types[val]){ toast('Dieser Artikel-Name existiert bereits.',true); return; }
  const newTypes = {};
  Object.entries(cat.types).forEach(([k,v])=>{ newTypes[k===typeKey?val:k]=v; });
  cat.types = newTypes;
  saveCatalogsStore(); rerenderAllCats();
  _catTreeInlineState = null;
  _renderCatMgrTab2();
  toast('✓ Umbenannt');
}

function catTreeSaveAddGruppe(catalogId, weltName){
  const val = document.getElementById('tree-inline-input')?.value.trim();
  if(!val){ catTreeInlineCancel(); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(cat.groups.find(g=>!g.parentId && g.name===val)){
    toast('Eine Gruppe mit diesem Namen existiert bereits.',true); return;
  }
  cat.groups.push({id:_genGroupId(), name:val});
  saveCatalogsStore();
  _catTreeInlineState = null;
  _catEditorWelt = weltName;
  _renderCatMgrTab2();
  toast('✓ Gruppe „'+val+'" angelegt');
}

function catTreeSaveAddUG(catalogId, parentGroupId){
  const val = document.getElementById('tree-inline-input')?.value.trim();
  if(!val){ catTreeInlineCancel(); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  cat.groups.push({id:_genGroupId(), name:val, parentId:parentGroupId});
  saveCatalogsStore();
  _catTreeInlineState = null;
  _renderCatMgrTab2();
  toast('✓ Untergruppe „'+val+'" angelegt');
}

function catTreeSaveAddArtikel(catalogId){
  const val = document.getElementById('tree-inline-input')?.value.trim();
  if(!val){ catTreeInlineCancel(); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(cat.types[val]){ toast('Dieser Artikel-Name existiert bereits.',true); return; }
  const st    = _catTreeInlineState;
  const entry = {cat:_catEditorWelt||CAT_ORDER[0], items:[], unit_type:'qty'};
  if(st?.parentId) entry.group = st.parentId;
  cat.types[val] = entry;
  saveCatalogsStore();
  _catTreeInlineState = null;
  _renderCatMgrTab2();
  toast('✓ Artikel „'+val+'" angelegt');
}

function catTreeSaveLen(catalogId, typeKey){
  const val   = document.getElementById('tree-inline-input')?.value.trim();
  if(!val){ catTreeInlineCancel(); return; }
  const cat   = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const entry = cat.types[typeKey]; if(!entry) return;
  const lVal  = val.match(/^\d+([.,]\d+)?$/) ? val+'m' : val;
  if((entry.items||[]).some(i=>i.l===lVal)){
    toast('Diese Länge existiert bereits.',true); return;
  }
  if(!entry.items) entry.items = [];
  entry.items.push({n:typeKey, l:lVal});
  entry.items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
  saveCatalogsStore();
  _catTreeInlineState = null;
  _renderCatMgrTab2();
  toast('✓ Länge „'+lVal+'" hinzugefügt');
}

// ── LÄNGEN LÖSCHEN ──────────────────────────────────────────────────
function catTreeDeleteLen(catalogId, typeKey, idx){
  const cat   = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const entry = cat.types[typeKey]; if(!entry||!entry.items?.[idx]) return;
  const label = entry.items[idx].l||entry.items[idx].n||'?';
  showConfirm(`Länge „${label}" löschen?`, ()=>{
    entry.items.splice(idx,1);
    saveCatalogsStore();
    _renderCatMgrTab2();
  }, 'Löschen', 'Ja, löschen');
}

// ── UNIT TYPE TOGGLE ───────────────────────────────────────────────
function catTreeToggleUnitType(catalogId, typeKey){
  const cat   = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const entry = cat.types[typeKey]; if(!entry) return;
  entry.unit_type = entry.unit_type==='lengths' ? 'qty' : 'lengths';
  saveCatalogsStore(); rerenderAllCats();
  _renderCatMgrTab2();
  toast('✓ Artikel-Typ geändert');
}

// ── GRUPPEN CRUD ────────────────────────────────────────────────────
function _genGroupId(){ return 'grp-'+Date.now().toString(36); }

function catEditorAddGroup(catalogId){
  catTreeAddInline(catalogId,'add-gruppe',null,_catEditorWelt||CAT_ORDER[0]);
}

function catEditorAddSubGroup(catalogId, parentGroupId){
  catTreeAddInline(catalogId,'add-ug',parentGroupId,null);
}

function catEditorRenameGroup(catalogId, groupId){
  catTreeInlineEditGruppe(catalogId, groupId);
}

function catEditorDeleteGroup(catalogId, groupId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const g   = cat.groups.find(x=>x.id===groupId); if(!g) return;
  const childGroups = catGetSubGroups(cat,groupId);
  const msg = childGroups.length
    ? `Gruppe „${g.name}" und ${childGroups.length} Untergruppe(n) löschen?\nZugeordnete Artikel werden zu „Ohne Gruppe".`
    : `Gruppe „${g.name}" löschen? Zugeordnete Artikel werden zu „Ohne Gruppe".`;
  showConfirm(msg, ()=>{
    const allIds = [groupId,...childGroups.map(x=>x.id)];
    Object.values(cat.types).forEach(t=>{ if(allIds.includes(t.group)) delete t.group; });
    cat.groups = cat.groups.filter(x=>!allIds.includes(x.id));
    saveCatalogsStore();
    _catTreeInlineState = null;
    _renderCatMgrTab2();
    toast('✓ Gruppe gelöscht');
  }, 'Löschen', 'Ja, löschen');
}

function catEditorSetTypeGroup(catalogId, typeKey, groupId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  if(groupId) cat.types[typeKey].group=groupId;
  else delete cat.types[typeKey].group;
  saveCatalogsStore(); toast('✓ Gruppe zugewiesen');
}

// ── ARTIKEL CRUD ────────────────────────────────────────────────────
function catEditorAddType(catalogId){
  catTreeAddInline(catalogId,'add-artikel',null,_catEditorWelt||CAT_ORDER[0]);
}

function catEditorRenameType(catalogId, typeKey){
  catTreeInlineEditArtikel(catalogId, typeKey);
}

function catEditorDeleteType(catalogId, typeKey){
  showConfirm(`Artikel „${typeKey}" aus dem Katalog löschen?\nBereits hinzugefügte Projektpositionen bleiben erhalten.`, ()=>{
    const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
    delete cat.types[typeKey];
    saveCatalogsStore();
    _catTreeInlineState = null;
    _renderCatMgrTab2();
    toast('✓ Artikel gelöscht');
  }, 'Löschen', 'Ja, löschen');
}

function catEditorSetUnitType(catalogId, typeKey, unitType){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].unit_type = unitType;
  saveCatalogsStore(); rerenderAllCats();
  _renderCatMgrTab2();
}

function catEditorSetSubgroup(catalogId, typeKey, val){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  const trimmed = val.trim();
  if(trimmed) cat.types[typeKey].subgroup = trimmed;
  else delete cat.types[typeKey].subgroup;
  saveCatalogsStore(); rerenderAllCats();
}

function catEditorSetCat(catalogId, typeKey, catName){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].cat = catName;
  saveCatalogsStore(); rerenderAllCats(); _renderCatMgrTab2();
}

function catEditorSetGroupCat(catalogId, groupId, catName){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const subGroups  = catGetSubGroups(cat, groupId);
  const allIds     = [groupId, ...subGroups.map(g=>g.id)];
  let count = 0;
  Object.values(cat.types).forEach(t=>{
    if(allIds.includes(t.group) && (t.cat||CAT_ORDER[0])===_catEditorWelt){
      t.cat = catName; count++;
    }
  });
  if(!count){ toast('Keine Artikel in dieser Gruppe für die aktuelle Welt.',true); return; }
  saveCatalogsStore(); rerenderAllCats(); _renderCatMgrTab2();
  toast(`✓ ${count} Artikel nach „${catName}" verschoben`);
}

// ── LÄNGEN (Legacy-API für Wizard-Kompatibilität) ──────────────────
function catEditorDetailAddItem(catalogId, typeKey){
  catTreeAddLenInline(catalogId, typeKey);
}

function catEditorDetailEditItem(catalogId, typeKey, idx){
  const cat   = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const items = cat.types[typeKey]?.items; if(!items||!items[idx]) return;
  const current = items[idx].l||items[idx].n||'';
  showPrompt('Eintrag bearbeiten:', current, val=>{
    const lVal = val.match(/^\d+([.,]\d+)?$/) ? val+'m' : val;
    items[idx] = {n:typeKey,l:lVal};
    items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
    saveCatalogsStore();
    _renderCatMgrTab2();
    toast('✓ Eintrag aktualisiert');
  }, 'Eintrag bearbeiten');
}

function catEditorDetailDeleteItem(catalogId, typeKey, idx){
  catTreeDeleteLen(catalogId, typeKey, idx);
}

function catEditorOpenTypeDetail(catalogId, typeKey){
  catTreeInlineEditArtikel(catalogId, typeKey);
}

// ── KATALOG CRUD ────────────────────────────────────────────────────
function catMgrAssign(catalogId){
  setActivePlanCatalog(activePlanId, catalogId);
  _renderCatMgrTab1();
  toast('✓ Katalog „'+getActiveCatalog().name+'" diesem Plan zugewiesen');
}

function catMgrEdit(catalogId){ _catEditorId=catalogId; _catMgrSwitchTab(2); }

function catMgrRename(catalogId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  document.getElementById('catMgrContent').innerHTML = `
    <div style="max-width:440px">
      <div style="font-size:10px;letter-spacing:2px;color:var(--muted);margin-bottom:12px">KATALOG UMBENENNEN</div>
      <input class="pinput" id="renameCatInput" value="${esc(cat.name)}"
        placeholder="Katalog-Name" style="width:100%;margin-bottom:0"
        onkeydown="if(event.key==='Enter')_catMgrSaveRename(&quot;${catalogId}&quot;);else if(event.key==='Escape')_renderCatMgrTab1()">
    </div>`;
  document.getElementById('mFooter').innerHTML = `
    <button class="btn" onclick="_renderCatMgrTab1()">Abbrechen</button>
    <button class="btn btn-accent" onclick="_catMgrSaveRename(&quot;${catalogId}&quot;)">SPEICHERN</button>`;
  setTimeout(()=>{ const i=document.getElementById('renameCatInput'); if(i){i.focus();i.select();} },50);
}

function _catMgrSaveRename(catalogId){
  const val = document.getElementById('renameCatInput')?.value.trim();
  if(!val){ toast('Bitte einen Namen eingeben.',true); return; }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  cat.name = val; saveCatalogsStore(); _renderCatMgr();
  renderActiveCatalogBadge(); toast('✓ Umbenannt');
}

function catMgrDelete(catalogId){
  const plans = getPlansIndex();
  const using = plans.filter(p=>(p.catalogId||'cat-default')===catalogId);
  if(using.length){
    toast(`Katalog wird von ${using.length} Plan(en) verwendet — erst anderen Katalog zuweisen.`,true);
    return;
  }
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  showConfirm(`Katalog „${cat.name}" wirklich löschen? Alle Einträge gehen verloren.`, ()=>{
    catalogsStore.catalogs = catalogsStore.catalogs.filter(c=>c.id!==catalogId);
    saveCatalogsStore(); _renderCatMgrTab1(); toast('Katalog gelöscht');
  }, 'Löschen', 'Ja, löschen');
}

function catMgrCreateNew(){
  document.getElementById('catMgrContent').innerHTML = `
    <div style="max-width:520px">
      <div style="font-size:10px;letter-spacing:2px;color:var(--muted);margin-bottom:12px">NEUER KATALOG</div>
      <div style="margin-bottom:18px">
        <div style="font-size:10px;letter-spacing:1px;color:var(--muted);margin-bottom:6px">NAME</div>
        <input class="pinput" id="newCatName" placeholder="z.B. Firma ABC, Tour 2025 …"
          style="width:100%;margin:0"
          onkeydown="if(event.key==='Escape')_renderCatMgrTab1()">
      </div>
      <div style="font-size:10px;letter-spacing:1px;color:var(--muted);margin-bottom:8px">INHALT</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--border);cursor:pointer;background:var(--bg3);transition:border-color .15s"
          onclick="document.getElementById('newCatCopy').checked=true;this.closest('.catopt-group')?.querySelectorAll('label').forEach(l=>l.style.borderColor='');this.style.borderColor='var(--accent)'">
          <input type="radio" name="newCatMode" id="newCatCopy" value="copy" style="margin-top:2px;accent-color:var(--accent)">
          <div>
            <div style="font-weight:700;font-size:13px;color:var(--text);margin-bottom:3px">Kopie vom Standard-Katalog</div>
            <div style="font-size:11px;color:var(--muted)">Alle vordefinierten Typen und Gruppen werden übernommen. Ideal als Ausgangspunkt.</div>
          </div>
        </label>
        <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--border);cursor:pointer;background:var(--bg3);transition:border-color .15s"
          onclick="document.getElementById('newCatEmpty').checked=true;this.closest('.catopt-group')?.querySelectorAll('label').forEach(l=>l.style.borderColor='');this.style.borderColor='var(--accent)'">
          <input type="radio" name="newCatMode" id="newCatEmpty" value="empty" style="margin-top:2px;accent-color:var(--accent)">
          <div>
            <div style="font-weight:700;font-size:13px;color:var(--text);margin-bottom:3px">Leerer Katalog</div>
            <div style="font-size:11px;color:var(--muted)">Katalog ohne Einträge anlegen und selbst befüllen.</div>
          </div>
        </label>
      </div>
    </div>`;
  document.getElementById('mFooter').innerHTML = `
    <button class="btn" onclick="_renderCatMgrTab1()">Abbrechen</button>
    <button class="btn btn-accent" onclick="_catMgrSaveNew()">KATALOG ERSTELLEN</button>`;
  setTimeout(()=>document.getElementById('newCatName')?.focus(), 50);
}

function _catMgrSaveNew(){
  const name = document.getElementById('newCatName')?.value.trim();
  if(!name){ toast('Bitte einen Katalog-Namen eingeben.',true); document.getElementById('newCatName')?.focus(); return; }
  const copy    = document.getElementById('newCatCopy')?.checked;
  const stdCat  = catalogsStore.catalogs.find(c=>c.id==='cat-default');
  const types   = copy&&stdCat ? JSON.parse(JSON.stringify(stdCat.types)) : {};
  const groups  = copy&&stdCat ? JSON.parse(JSON.stringify(stdCat.groups||[])) : [];
  const id      = genCatalogId();
  catalogsStore.catalogs.push({id,name,isBuiltin:false,
    created:new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}),
    groups,types});
  saveCatalogsStore(); _catEditorId=id; _renderCatMgr();
  toast('✓ Katalog „'+name+'" erstellt');
}

function catMgrImportJSON(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const data     = JSON.parse(e.target.result);
      const rawTypes = data.types||data;
      const catName  = (data.name&&typeof data.name==='string')
        ? data.name : (file.name.replace(/\.json$/i,'')||'Importierter Katalog');
      // Migration: alte Cat-Namen → Welt-Namen
      const _OLD_CAT_MAP = {'Kabel Liste':'Datenwelt','Zubehör Liste':'Riggingwelt','Hardware Liste':'Datenwelt','Lampen Liste':'Lichtwelt'};
      const _builtinWelt = {};
      if(typeof CATALOG!=='undefined') Object.entries(CATALOG).forEach(([k,v])=>{ _builtinWelt[k]=v.cat; });
      const types = {};
      Object.entries(rawTypes).forEach(([key,val])=>{
        if(typeof val==='object'&&val.items!==undefined){
          let catWelt = val.cat||'Datenwelt';
          if(_OLD_CAT_MAP.hasOwnProperty(catWelt)) catWelt = _builtinWelt[key]||_OLD_CAT_MAP[catWelt];
          const entry={cat:catWelt,items:val.items,unit_type:val.unit_type||_detectUnitType(val)};
          if(val.group)    entry.group    = val.group;
          if(val.subgroup) entry.subgroup = val.subgroup;
          types[key]=entry;
        }
      });
      if(!Object.keys(types).length){ toast('Keine gültigen Katalog-Typen gefunden.',true); return; }
      const groups = (Array.isArray(data.groups)?data.groups:[]).filter(g=>g.id&&g.name);
      const id     = genCatalogId();
      catalogsStore.catalogs.push({id,name:catName,isBuiltin:false,
        created:new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}),
        groups,types});
      saveCatalogsStore(); _renderCatMgrTab1();
      toast('✓ Katalog „'+catName+'" importiert');
    }catch(err){ toast('Import fehlgeschlagen: '+err.message,true); }
  };
  reader.readAsText(file); input.value='';
}

function catEditorSwitch(catalogId){
  _catEditorId=catalogId; _catTreeInlineState=null; _renderCatMgrTab2();
}

function catEditorExport(catalogId){
  const cat = catalogsStore.catalogs.find(c=>c.id===catalogId); if(!cat) return;
  const out = {name:cat.name,groups:cat.groups||[],types:cat.types};
  downloadJSON(out,(cat.name||'katalog').replace(/[^a-zA-Z0-9äöüÄÖÜß]/g,'_').toLowerCase()+'.json');
  toast('✓ Katalog exportiert');
}

// ── UTILS ───────────────────────────────────────────────────────────
function downloadJSON(data, filename){
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ══════════════════════════════════════════════════════════════════════
// ARTIKEL-EDIT-MODAL
// ══════════════════════════════════════════════════════════════════════
let _artEditState = null; // {catalogId, typeKey, locPickerOpen}

function openArticleEdit(catalogId, typeKey){
  _artEditState = {catalogId, typeKey, locPickerOpen: false};
  let el = document.getElementById('artEditOverlay');
  if(!el){
    el = document.createElement('div');
    el.id = 'artEditOverlay';
    el.className = 'art-edit-overlay';
    el.addEventListener('click', e=>{ if(e.target===el) _artEditClose(); });
    document.body.appendChild(el);
  }
  _renderArticleEditModal();
}

function _artEditClose(){
  const el = document.getElementById('artEditOverlay');
  if(el) el.remove();
  _artEditState = null;
}

function _renderArticleEditModal(){
  const el = document.getElementById('artEditOverlay');
  if(!el || !_artEditState) return;
  const {catalogId, typeKey, locPickerOpen} = _artEditState;
  const cat   = catalogsStore?.catalogs?.find(c=>c.id===catalogId);
  if(!cat){ _artEditClose(); return; }
  const type  = cat.types[typeKey];
  if(!type){ _artEditClose(); return; }
  const s       = v => JSON.stringify(v).replace(/"/g,'&quot;');
  const isKabel = (type.unit_type||'qty') === 'lengths';

  // Aktuellen Standort-Text ermitteln
  const weltName = type.cat || CAT_ORDER[0];
  let locPath = weltName;
  if(type.group){
    const grp = (cat.groups||[]).find(g=>g.id===type.group);
    if(grp){
      if(grp.parentId){
        const parent = (cat.groups||[]).find(g=>g.id===grp.parentId);
        locPath = weltName + (parent ? ' → '+esc(parent.name) : '') + ' → '+esc(grp.name);
      } else {
        locPath = weltName + ' → '+esc(grp.name);
      }
    }
  }

  // Längen-Bereich
  let lenHtml = '';
  if(isKabel){
    const items = type.items||[];
    lenHtml = `
      <div class="art-edit-section">
        <div class="art-edit-section-label">LÄNGEN</div>
        <div class="art-edit-len-list">
          ${!items.length ? '<div class="art-edit-empty">Noch keine Längen angelegt</div>' : ''}
          ${items.map((it,idx)=>{
            const lbl = it.l||it.n||'?';
            return `<div class="art-edit-len-item">
              <span class="art-edit-len-val">${esc(lbl)}</span>
              <button class="art-len-del" onclick="_artEditDeleteLen(${s(catalogId)},${s(typeKey)},${idx})" title="Löschen">✕</button>
            </div>`;
          }).join('')}
        </div>
        <div class="art-edit-len-add">
          <input class="art-edit-len-input" id="artEditLenInput" placeholder="z.B. 15m"
            onkeydown="if(event.key==='Enter')_artEditAddLen(${s(catalogId)},${s(typeKey)})">
          <button class="btn btn-sm btn-green" onclick="_artEditAddLen(${s(catalogId)},${s(typeKey)})">+ HINZUFÜGEN</button>
        </div>
      </div>`;
  }

  el.innerHTML = `
    <div class="art-edit-modal">
      <div class="art-edit-header">
        <span class="art-edit-title">ARTIKEL BEARBEITEN</span>
        <button class="art-edit-close" onclick="_artEditClose()">✕</button>
      </div>
      <div class="art-edit-body">
        <div class="art-edit-section">
          <div class="art-edit-section-label">BEZEICHNUNG</div>
          <div class="art-edit-name-row">
            <input class="art-edit-name-input" id="artEditNameInput" value="${esc(typeKey)}"
              onkeydown="if(event.key==='Enter')_artEditSaveName(${s(catalogId)},${s(typeKey)});else if(event.key==='Escape')_artEditClose()">
            <button class="btn btn-sm" onclick="_artEditSaveName(${s(catalogId)},${s(typeKey)})">UMBENENNEN</button>
          </div>
        </div>
        <div class="art-edit-section">
          <div class="art-edit-section-label">TYP</div>
          <div class="art-edit-type-toggle">
            <button class="art-type-btn${isKabel?' active':''}"
              onclick="_artEditSetType(${s(catalogId)},${s(typeKey)},'lengths')">KABEL (LÄNGEN)</button>
            <button class="art-type-btn${!isKabel?' active':''}"
              onclick="_artEditSetType(${s(catalogId)},${s(typeKey)},'qty')">GERÄT (STÜCK)</button>
          </div>
        </div>
        ${lenHtml}
        <div class="art-edit-section">
          <div class="art-edit-section-label">STANDORT</div>
          <div class="art-edit-location">
            <span class="art-edit-loc-path">${locPath}</span>
            <button class="btn btn-sm" onclick="_artEditToggleLocPicker(${s(catalogId)},${s(typeKey)})">
              ${locPickerOpen?'SCHLIESSEN ▲':'VERSCHIEBEN ▼'}
            </button>
          </div>
          ${locPickerOpen ? _renderLocPicker(cat, typeKey) : ''}
        </div>
      </div>
    </div>`;
}

// ── STANDORT-PICKER ────────────────────────────────────────────────
function _renderLocPicker(cat, typeKey){
  const type       = cat.types[typeKey];
  const s          = v => JSON.stringify(v).replace(/"/g,'&quot;');
  const currentWelt= type.cat || CAT_ORDER[0];
  const currentGrp = type.group || null;
  const topGroups  = catGetTopGroups(cat);

  let html = '<div class="loc-picker">';
  CAT_ORDER.forEach(weltName=>{
    html += `<div class="loc-welt">
      <div class="loc-welt-header">${weltName}</div>`;

    const noGrpActive = currentWelt===weltName && !currentGrp;
    html += `<div class="loc-item${noGrpActive?' loc-item-current':''}"
      onclick="_artEditSelectLocation(${s(cat.id)},${s(typeKey)},${s(weltName)},null)">
      <span class="loc-item-icon">▸</span> Ohne Gruppe (Sonstiges)
      ${noGrpActive?'<span class="loc-current-badge">aktuell</span>':''}
    </div>`;

    topGroups.forEach(grp=>{
      const subGroups = catGetSubGroups(cat, grp.id);
      const grpActive = currentWelt===weltName && currentGrp===grp.id;
      html += `<div class="loc-item loc-group-item${grpActive?' loc-item-current':''}"
        onclick="_artEditSelectLocation(${s(cat.id)},${s(typeKey)},${s(weltName)},${s(grp.id)})">
        <span class="loc-item-icon">▸</span> <strong>${esc(grp.name)}</strong>
        ${grpActive?'<span class="loc-current-badge">aktuell</span>':''}
      </div>`;
      subGroups.forEach(sg=>{
        const sgActive = currentWelt===weltName && currentGrp===sg.id;
        html += `<div class="loc-item loc-subgroup-item${sgActive?' loc-item-current':''}"
          onclick="_artEditSelectLocation(${s(cat.id)},${s(typeKey)},${s(weltName)},${s(sg.id)})">
          <span class="loc-item-icon">▸</span> ${esc(sg.name)}
          ${sgActive?'<span class="loc-current-badge">aktuell</span>':''}
        </div>`;
      });
    });

    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _artEditToggleLocPicker(catalogId, typeKey){
  if(_artEditState) _artEditState.locPickerOpen = !_artEditState.locPickerOpen;
  _renderArticleEditModal();
}

// ── SPEICHER-FUNKTIONEN ────────────────────────────────────────────
function _artEditSaveName(catalogId, oldKey){
  const val = document.getElementById('artEditNameInput')?.value.trim();
  if(!val){ toast('Bitte einen Namen eingeben.',true); return; }
  if(val === oldKey) return;
  const cat = catalogsStore?.catalogs?.find(c=>c.id===catalogId); if(!cat) return;
  if(cat.types[val]){ toast('Dieser Artikel-Name existiert bereits.',true); return; }
  const newTypes = {};
  Object.entries(cat.types).forEach(([k,v])=>{ newTypes[k===oldKey?val:k]=v; });
  cat.types = newTypes;
  saveCatalogsStore(); rerenderAllCats();
  _artEditState.typeKey = val;
  _renderCatMgrTab2();
  _renderArticleEditModal();
  toast('✓ Umbenannt');
}

function _artEditSetType(catalogId, typeKey, unitType){
  const cat = catalogsStore?.catalogs?.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].unit_type = unitType;
  saveCatalogsStore(); rerenderAllCats();
  _renderCatMgrTab2();
  _renderArticleEditModal();
  toast('✓ Typ geändert');
}

function _artEditAddLen(catalogId, typeKey){
  const val = document.getElementById('artEditLenInput')?.value.trim();
  if(!val) return;
  const cat = catalogsStore?.catalogs?.find(c=>c.id===catalogId); if(!cat) return;
  const entry = cat.types[typeKey]; if(!entry) return;
  const lVal = val.match(/^\d+([.,]\d+)?$/) ? val+'m' : val;
  if((entry.items||[]).some(i=>i.l===lVal)){ toast('Diese Länge existiert bereits.',true); return; }
  if(!entry.items) entry.items = [];
  entry.items.push({n:typeKey, l:lVal});
  entry.items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
  saveCatalogsStore();
  _renderCatMgrTab2();
  _renderArticleEditModal();
  toast('✓ Länge „'+lVal+'" hinzugefügt');
}

function _artEditDeleteLen(catalogId, typeKey, idx){
  const cat = catalogsStore?.catalogs?.find(c=>c.id===catalogId); if(!cat) return;
  const entry = cat.types[typeKey]; if(!entry||!entry.items?.[idx]) return;
  const label = entry.items[idx].l||entry.items[idx].n||'?';
  showConfirm(`Länge „${label}" löschen?`, ()=>{
    entry.items.splice(idx,1);
    saveCatalogsStore();
    _renderCatMgrTab2();
    _renderArticleEditModal();
  }, 'Löschen', 'Ja, löschen');
}

function _artEditSelectLocation(catalogId, typeKey, weltName, groupId){
  const cat = catalogsStore?.catalogs?.find(c=>c.id===catalogId); if(!cat) return;
  if(!cat.types[typeKey]) return;
  cat.types[typeKey].cat = weltName;
  if(groupId) cat.types[typeKey].group = groupId;
  else delete cat.types[typeKey].group;
  saveCatalogsStore(); rerenderAllCats();
  _artEditState.locPickerOpen = false;
  _catEditorWelt = weltName;
  _renderCatMgrTab2();
  _renderArticleEditModal();
  toast('✓ Verschoben nach „'+weltName+'"');
}
