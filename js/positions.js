// ══════════════════════════════════════════════════
// POSITIONEN — Bühne, FOH, etc.
// ══════════════════════════════════════════════════
function renderPosBar(){
  const el = document.getElementById('posbar'); if(!el) return;
  el.innerHTML =
    '<span class="posbar-label">Position //</span>'+
    state.positions.map((p,i)=>
      `<div class="pos-pill${i===activePosIdx?' active':''}" onclick="switchPos(${i})">
        ${esc(p.name)}
        <span class="pos-pill-actions">
          <button class="pos-pill-btn ren" onclick="event.stopPropagation();renamePos(${i})" title="Umbenennen">✏</button>
          ${state.positions.length>1?`<button class="pos-pill-btn del" onclick="event.stopPropagation();deletePos(${i})" title="Löschen">✕</button>`:''}
        </span>
      </div>`).join('')+
    '<button class="pos-add" onclick="addPosition()" title="Neue Position">+</button>';
}

function switchPos(idx){
  if(idx===activePosIdx) return;
  activePosIdx = idx; state._activePosIdx = idx;
  renderPosBar(); render();
}

function addPosition(){
  showPrompt('Name der neuen Position (z.B. Halle 25, FOH):', '', name=>{
    state.positions.push({name,categories:CAT_ORDER.map(n=>({name:n,sections:[]}))});
    activePosIdx = state.positions.length-1; state._activePosIdx=activePosIdx;
    save(); renderPosBar(); render();
    toast('Position „'+name+'" erstellt ✓');
  }, 'Neue Position');
}

function renamePos(idx){
  showPrompt('Neuer Name:', state.positions[idx].name, name=>{
    state.positions[idx].name = name;
    save(); renderPosBar();
  }, 'Position umbenennen');
}

function deletePos(idx){
  if(state.positions.length<=1){ toast('Mindestens eine Position erforderlich',true); return; }
  showConfirm('Position „'+state.positions[idx].name+'" löschen?', ()=>{
    state.positions.splice(idx,1);
    activePosIdx = Math.min(activePosIdx, state.positions.length-1);
    state._activePosIdx = activePosIdx;
    save(); renderPosBar(); render();
  }, 'Löschen', 'Ja, löschen');
}
