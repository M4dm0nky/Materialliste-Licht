// ══════════════════════════════════════════════════
// INIT — App-Start
// ══════════════════════════════════════════════════

// save() um Plan-Autosave erweitern
const _origSave = save;
save = function(){
  _origSave();
  setTimeout(() => savePlanToLS(activePlanId), 500);
};

// Katalog und State laden
initCatalogs();
initState();

// Multi-Plan-System initialisieren
(function initPlans(){
  loadLogosGlobal();
  const plans = getPlansIndex();

  // Migration: fehlende catalogId bei bestehenden Plänen ergänzen
  let migrated = false;
  plans.forEach(p=>{ if(!p.catalogId){ p.catalogId='cat-default'; migrated=true; } });
  if(migrated) savePlansIndex(plans);

  if(plans.length > 0){
    const lastId    = loadLastActivePlan();
    const startPlan = (lastId && plans.find(p=>p.id===lastId)) || plans[0];
    activePlanId    = startPlan.id;
    activeCatalogId = startPlan.catalogId || 'cat-default';
    if(!catalogsStore?.catalogs?.find(c=>c.id===activeCatalogId)){
      const backup = localStorage.getItem(ACTIVE_CAT_KEY);
      activeCatalogId = (backup && catalogsStore?.catalogs?.find(c=>c.id===backup))
        ? backup : 'cat-default';
    }
    if(loadPlanFromLS(activePlanId)){
      renderPlanList();
    } else {
      render(); renderPlanList();
    }
  } else {
    // Ersten Plan aus ggf. bestehendem State anlegen
    state        = migrateState(state);
    activePosIdx = 0;
    const id     = genPlanId();
    activePlanId    = id;
    activeCatalogId = 'cat-default';
    const planName  = state._project || 'Neues Projekt';
    const plans2    = [{id, name:planName, created:todayStr(), modified:todayStr(), catalogId:'cat-default'}];
    savePlansIndex(plans2);
    savePlanToLS(id);
    render();
    renderPlanList();
  }
  renderActiveCatalogBadge();

  // ESC schließt Modal
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && document.getElementById('overlay').classList.contains('open')){
      if(!document.querySelector('.app-dialog.open')) closeWiz();
    }
  });

  // Backdrop-Klick schließt Modal (Klick auf Overlay-Fläche, nicht auf das Modal selbst)
  document.getElementById('overlay').addEventListener('click', e=>{
    if(e.target === document.getElementById('overlay')) closeWiz();
  });
})();
