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
    activePlanId    = plans[0].id;
    activeCatalogId = plans[0].catalogId || 'cat-default';
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
})();
