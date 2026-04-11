// ══════════════════════════════════════════════════
// EXPORT / IMPORT — JSON & CSV
// ══════════════════════════════════════════════════
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
  const data     = { version:2, project:state._project, date:state._date, positions:state.positions, logos };
  const safeName = (state._project||'materialliste').replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g,'_');
  const json     = JSON.stringify(data, null, 2);
  if(window.showSaveFilePicker){
    try{
      const h = await window.showSaveFilePicker({suggestedName:safeName+'.json',types:[{description:'JSON',accept:{'application/json':['.json']}}]});
      const w = await h.createWritable(); await w.write(json); await w.close();
      toast('✓ Gespeichert als '+safeName+'.json'); return;
    }catch(e){ if(e.name==='AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json],{type:'application/json;charset=utf-8'}));
  a.download = safeName+'.json'; a.click();
  toast('✓ JSON exportiert');
}

function importProjectJSON(input){
  const file = input.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = e=>{
    try{
      const data = JSON.parse(e.target.result);
      if(!data.categories && !data.positions) throw new Error('Kein gültiges Materialliste-Format');
      savePlanToLS(activePlanId);
      const id = genPlanId(); activePlanId=id;
      activeCatalogId = 'cat-default';
      state = migrateState({...data, _project:data.project||file.name.replace(/\.json$/i,''), _date:data.date||''});
      activePosIdx=0; state._activePosIdx=0;
      // Auto-Registrierung: Sektionstypen, die nicht im Katalog vorhanden sind, eintragen
      const activeCat = getActiveCatalog();
      let needsCatSave = false;
      state.positions.forEach(pos=>{
        pos.categories.forEach(cat=>{
          cat.sections.forEach(sec=>{
            if(!activeCat.types[sec.type_name]){
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
      document.getElementById('pDate').value = state._date;
      const plans = getPlansIndex();
      plans.push({id,name:state._project,created:todayStr(),modified:todayStr(),catalogId:'cat-default'});
      savePlansIndex(plans); savePlanToLS(id);
      render(); renderPlanList();
      toast('✓ „'+state._project+'" importiert');
    }catch(err){ toast('Import fehlgeschlagen: '+err.message, true); }
  };
  r.readAsText(file); input.value='';
}
