// ══════════════════════════════════════════════════
// EXPORT / IMPORT — JSON & CSV
// ══════════════════════════════════════════════════
let _fileHandle = null;
let _pendingImport = null;
function exportCSV(){
  const posName = state.positions[activePosIdx].name;
  let csv = 'Projekt;'+(state._project||'')+';Datum;'+(state._date||'')+'\nPosition;'+posName+'\n\n';
  csv += 'Kategorie;Sektion;Bezeichnung;Länge;# Stk.;Spare;Im Projekt;Differenz;Total;Kapitel;Bemerkung\n';
  currentCats().forEach(cat=>cat.sections.forEach(sec=>sec.items.forEach(item=>{
    const d=xdiff(item), t=xtotal(item);
    csv += [cat.name,sec.type_name,item.name||'',item.length||'',item.anzahl||0,item.spare||0,
      item.im_projekt||0,d,t,item.kapitel||'',item.bemerkung||'']
      .map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')+'\n';
  })));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
  a.download = 'material-planer-'+(state._project||'export').replace(/\s/g,'_')+'.csv';
  a.click();
}

async function saveProjectJSON(){
  savePlanToLS(activePlanId);
  renderPlanList();
  const activeCat = getActiveCatalog();
  const data     = { version:2, project:state._project, date:state._date, catalogId:activeCatalogId, ...(!activeCat.isBuiltin?{catalog:activeCat}:{}), positions:state.positions, logos };
  const safeName = (state._project||'materialliste').replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g,'_');
  const json     = JSON.stringify(data, null, 2);
  if(window.showSaveFilePicker){
    try{
      if(!_fileHandle){
        _fileHandle = await window.showSaveFilePicker({suggestedName:safeName+'.json', types:[{description:'JSON',accept:{'application/json':['.json']}}]});
      }
      const w = await _fileHandle.createWritable(); await w.write(json); await w.close();
      toast('✓ Gespeichert'); return;
    }catch(e){
      if(e.name==='AbortError'){ _fileHandle=null; return; }
      _fileHandle=null; // Handle ungültig → beim nächsten Mal neu fragen
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json],{type:'application/json;charset=utf-8'}));
  a.download = safeName+'.json'; a.click();
  toast('✓ JSON exportiert');
}

function importProjectJSON(input){
  const file = input.files[0]; if(!file) return;
  _fileHandle = null;
  const r = new FileReader();
  r.onload = e=>{
    try{
      const data = JSON.parse(e.target.result);
      if(!data.categories && !data.positions) throw new Error('Kein gültiges Materialliste-Format');
      _pendingImport = {data, file};
      _openCatalogPickModal(data, file);
    }catch(err){ toast('Import fehlgeschlagen: '+err.message, true); }
  };
  r.readAsText(file); input.value='';
}

function _openCatalogPickModal(data, file){
  // Eingebetteten Katalog vorab in den Store aufnehmen falls noch nicht vorhanden
  let preselect = 'cat-default';
  if(data.catalogId && catalogsStore?.catalogs?.find(c=>c.id===data.catalogId)){
    preselect = data.catalogId;
  } else if(data.catalogId && data.catalog){
    const importedCat = {...data.catalog, id:data.catalogId, isBuiltin:false};
    if(!importedCat.groups) importedCat.groups=[];
    catalogsStore.catalogs.push(importedCat);
    saveCatalogsStore();
    preselect = data.catalogId;
  }
  document.getElementById('catPickPlanName').textContent = data.project || file.name.replace(/\.json$/i,'');
  document.getElementById('catPickList').innerHTML = catalogsStore.catalogs.map(c=>
    `<label class="pdf-cb-row"><input type="radio" name="catPick" value="${c.id}"${c.id===preselect?' checked':''}> ${esc(c.name)}</label>`
  ).join('');
  document.getElementById('catalogPickModal').classList.add('open');
}

function _confirmCatalogPick(){
  const checked = document.querySelector('input[name="catPick"]:checked');
  if(!checked){ toast('Bitte einen Katalog wählen.', true); return; }
  closeModal('catalogPickModal');
  const {data, file} = _pendingImport;
  _pendingImport = null;
  _finishImport(data, file, checked.value);
}

function _importCatalogIntoPickModal(input){
  const file = input.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = e=>{
    try{
      const cat = JSON.parse(e.target.result);
      if(!cat.types) throw new Error('Kein gültiges Katalog-Format');
      const newId  = 'cat-' + Date.now();
      const newCat = {id:newId, name:cat.name||file.name.replace(/\.json$/i,''), isBuiltin:false, created:todayStr(), groups:cat.groups||[], types:cat.types};
      catalogsStore.catalogs.push(newCat);
      saveCatalogsStore();
      document.querySelectorAll('input[name="catPick"]').forEach(rb=>rb.checked=false);
      const label = document.createElement('label');
      label.className = 'pdf-cb-row';
      label.innerHTML = `<input type="radio" name="catPick" value="${newId}" checked> ${esc(newCat.name)} <span style="color:var(--accent);font-size:11px;margin-left:4px;">neu importiert</span>`;
      document.getElementById('catPickList').appendChild(label);
      toast('✓ Katalog "'+newCat.name+'" importiert');
    }catch(err){ toast('Katalog-Import fehlgeschlagen: '+err.message, true); }
  };
  r.readAsText(file); input.value='';
}

function _finishImport(data, file, selectedCatalogId){
  savePlanToLS(activePlanId);
  const id = genPlanId(); activePlanId=id;
  saveLastActivePlan(id);
  activeCatalogId = selectedCatalogId;
  state = migrateState({...data, _project:data.project||file.name.replace(/\.json$/i,''), _date:data.date||''});
  activePosIdx=0; state._activePosIdx=0;
  // Auto-Registrierung: Sektionstypen, die nicht im Katalog vorhanden sind, eintragen
  const activeCat = getActiveCatalog();
  let needsCatSave = false;
  state.positions.forEach(pos=>{
    pos.categories.forEach(cat=>{
      cat.sections.forEach(sec=>{
        if(!activeCat.types[sec.type_name] ||
           (sec.unit_type === 'lengths' && activeCat.types[sec.type_name]?.unit_type === 'qty')){
          const hasLengths = sec.items.some(i=>i.length);
          const ut = hasLengths ? 'lengths' : 'qty';
          const items = hasLengths
            ? [...new Map(sec.items.map(i=>[i.length,{n:i.name||sec.type_name,l:i.length}])).values()].filter(i=>i.l)
            : [];
          activeCat.types[sec.type_name] = {cat:cat.name, items, unit_type:ut};
          needsCatSave = true;
        }
      });
    });
  });
  if(needsCatSave) saveCatalogsStore();
  if(data.logos){ logos.planer=data.logos.planer||''; logos.band=data.logos.band||''; logos.booking=data.logos.booking||''; applyAllLogos(); saveLogosGlobal(); }
  document.getElementById('pName').value = state._project;
  const plans = getPlansIndex();
  plans.push({id,name:state._project,created:todayStr(),modified:todayStr(),catalogId:selectedCatalogId});
  savePlansIndex(plans); savePlanToLS(id);
  render(); renderPlanList();
  toast('✓ „'+state._project+'" importiert');
}
