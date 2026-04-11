// ══════════════════════════════════════════════════
// WIZARD — Material hinzufügen
// ══════════════════════════════════════════════════
let wiz = {};

function openWiz(ci){ wiz={ci,targetSi:null,step:1,key:null,sel:{},selLengths:{}}; showWiz('Material hinzufügen'); step1(); }
function openWizToSec(ci,si){ wiz={ci,targetSi:si,step:1,key:null,sel:{},selLengths:{}}; showWiz('Material hinzufügen'); step1(); }
function closeWiz(){ document.getElementById('overlay').classList.remove('open'); wiz={}; }
function showWiz(title){ document.getElementById('mTitle').textContent=title; document.getElementById('overlay').classList.add('open'); }

function step1(){
  wiz.step = 1;
  const ci = wiz.ci, catName = currentCats()[ci].name;
  wiz._allEntries = Object.entries(getActiveCatalogTypes());
  wiz._entries    = wiz._allEntries.filter(([_,v])=>v.cat===catName);
  wiz._gridEntries = [];
  document.getElementById('mBody').innerHTML=`
    <div class="steps">
      <div class="step active">1 · TYP WÄHLEN</div>
      <div class="step">2 · MENGEN EINGEBEN</div>
      <div class="step">3 · FERTIG</div>
    </div>
    <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">
      <input class="pinput" id="wizSearch" placeholder="🔍 Suchen (z.B. DMX, Han16, GrandMA...)"
        style="flex:1;min-width:0" oninput="wizUpdateSearch(this.value)" autocomplete="off">
      <span id="wizSearchInfo" style="font-size:10px;color:var(--muted);white-space:nowrap">
        ${esc(getActiveCatalog().name)} · ${esc(catName)}
      </span>
    </div>
    <div id="wizGrid" class="catgrid">${wizBuildGrid('')}</div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn" onclick="closeWiz()">Abbrechen</button>`;
  const si = document.getElementById('wizSearch'); if(si) setTimeout(()=>si.focus(),50);
}

function wizUpdateSearch(val){
  const grid = document.getElementById('wizGrid'); if(!grid) return;
  wiz._gridEntries = [];
  grid.innerHTML = wizBuildGrid(val.trim());
  const info = document.getElementById('wizSearchInfo');
  if(info) info.textContent = val.trim()
    ? (wiz._gridEntries.length+' Treffer')
    : (esc(getActiveCatalog().name)+' · '+currentCats()[wiz.ci].name);
}

function wizBuildGrid(query){
  const ci = wiz.ci, catName = currentCats()[ci].name;
  const activeCat  = getActiveCatalog();
  const allEntries = wiz._allEntries||[];
  if(!wiz._gridEntries) wiz._gridEntries=[];

  const makeCard = (k,v,targetCi)=>{
    const idx = wiz._gridEntries.length;
    wiz._gridEntries.push({key:k,ci:targetCi});
    return `<div class="catcard" onclick="wizPickGridIdx(${idx})">
      <div class="catcard-t">${esc(k)}</div>
      <div class="catcard-s">${v.items.length} Eintr.</div>
    </div>`;
  };

  const buildHierarchy = (entries,targetCi)=>{
    const topGroups = catGetTopGroups(activeCat);
    if(!topGroups.length) return entries.map(([k,v])=>makeCard(k,v,targetCi)).join('');
    const byGrp = {};
    (activeCat.groups||[]).forEach(g=>{ byGrp[g.id]=[]; });
    byGrp['__none']=[];
    entries.forEach(([k,v])=>{ const gid=v.group||'__none'; if(byGrp[gid]!==undefined) byGrp[gid].push([k,v]); else byGrp['__none'].push([k,v]); });
    let h='';
    topGroups.forEach(g=>{
      const subGroups = catGetSubGroups(activeCat,g.id);
      const direct    = byGrp[g.id]||[];
      const hasContent = direct.length||subGroups.some(sg=>(byGrp[sg.id]||[]).length);
      if(!hasContent) return;
      h+=`<div style="grid-column:1/-1;font-size:10px;letter-spacing:2px;color:var(--accent);margin:10px 0 4px;padding-bottom:3px;border-bottom:1px solid var(--border)">▸ ${esc(g.name)}</div>`;
      h+=direct.map(([k,v])=>makeCard(k,v,targetCi)).join('');
      subGroups.forEach(sg=>{
        const sgItems = byGrp[sg.id]||[];
        if(!sgItems.length) return;
        h+=`<div style="grid-column:1/-1;font-size:10px;letter-spacing:1px;color:var(--accent2);margin:6px 0 3px;padding-left:12px">· ${esc(sg.name)}</div>`;
        h+=sgItems.map(([k,v])=>makeCard(k,v,targetCi)).join('');
      });
    });
    const noneItems = byGrp['__none']||[];
    if(noneItems.length){
      h+=`<div style="grid-column:1/-1;font-size:10px;letter-spacing:2px;color:var(--muted);margin:10px 0 4px">WEITERE</div>`;
      h+=noneItems.map(([k,v])=>makeCard(k,v,targetCi)).join('');
    }
    return h;
  };

  if(!query){
    const entries = allEntries.filter(([_,v])=>v.cat===catName);
    if(!entries.length) return `<div style="color:var(--muted);font-size:13px;padding:24px;grid-column:1/-1;">
      Dieser Katalog enthält noch keine Einträge für „${esc(catName)}".
      <br><button class="btn btn-sm" style="margin-top:12px" onclick="closeWiz();openCatalogMgr()">→ Katalog bearbeiten</button>
    </div>`;
    return buildHierarchy(entries, ci);
  }

  // Suche: alle Kategorien, case-insensitive
  const q = query.toLowerCase();
  const matches = allEntries.filter(([k,v])=>
    k.toLowerCase().includes(q)||
    (v.cat||'').toLowerCase().includes(q)||
    (activeCat.groups||[]).some(g=>g.id===v.group&&g.name.toLowerCase().includes(q))
  );
  if(!matches.length) return `<div style="color:var(--muted);font-size:13px;padding:20px;grid-column:1/-1;">Keine Treffer für „${esc(query)}".</div>`;

  const cats = currentCats();
  let html='';
  CAT_ORDER.forEach(catN=>{
    const catEntries = matches.filter(([_,v])=>v.cat===catN);
    if(!catEntries.length) return;
    const targetCi = cats.findIndex(c=>c.name===catN);
    const useCi    = targetCi>=0?targetCi:ci;
    const label    = catN.replace(' Liste','').toUpperCase();
    html+=`<div style="grid-column:1/-1;font-size:10px;letter-spacing:2px;color:var(--accent);margin:10px 0 4px;padding:3px 8px;background:rgba(232,200,74,.1);border-left:3px solid var(--accent)">◆ ${label}</div>`;
    html+=buildHierarchy(catEntries, useCi);
  });
  return html||`<div style="color:var(--muted);grid-column:1/-1;padding:20px">Keine Treffer.</div>`;
}

function wizPickGridIdx(idx){
  const e = wiz._gridEntries&&wiz._gridEntries[idx]; if(!e) return;
  if(e.ci!==wiz.ci) wiz.targetSi=null;
  wiz.ci=e.ci; wiz.key=e.key; wiz.sel={}; step2();
}

function wizPickIdx(idx){
  const e = wiz._entries&&wiz._entries[idx]; if(!e) return;
  wiz.key=e[0]; wiz.sel={}; step2();
}

function step2(){
  wiz.step = 2;
  wiz.sel = {}; wiz.selLengths = {};
  const t = getActiveCatalogTypes()[wiz.key];
  if(!t) return;
  if(t.unit_type === 'qty') _step2Qty(t);
  else _step2Lengths(t);
}

function _wizStepsHeader(){
  return `<div class="steps">
    <div class="step done" onclick="step1()" style="cursor:pointer">1 · TYP ✓</div>
    <div class="step active">2 · MENGEN EINGEBEN</div>
    <div class="step">3 · FERTIG</div>
  </div>`;
}

function _wizFooter(){
  document.getElementById('mFooter').innerHTML=`
    <button class="btn" onclick="step1()">← ZURÜCK</button>
    <button class="btn" onclick="closeWiz()">Abbrechen</button>
    <button class="btn btn-accent" onclick="wizDone()">+ HINZUFÜGEN</button>
    <button class="btn btn-green" onclick="wizFinish()">✓ FERTIG</button>`;
}

function _step2Qty(t){
  document.getElementById('mBody').innerHTML=`
    ${_wizStepsHeader()}
    <div style="font-size:11px;color:var(--muted);margin-bottom:14px;letter-spacing:1px">
      <b style="color:var(--accent)">${esc(wiz.key)}</b> — Anzahl eingeben:
    </div>
    <div class="cablelist">
      <div class="cablerow" id="cr-0">
        <span class="qlbl" style="flex:1;font-weight:600">${esc(wiz.key)}</span>
        <span class="qlbl">#&nbsp;Stk.:</span>
        <input class="qin" type="number" id="qa-0" min="0" value="0" oninput="wizQ(0)">
        <span class="qlbl">Spare:</span>
        <input class="qin" type="number" id="qs-0" min="0" value="0" oninput="wizQ(0)">
      </div>
    </div>
    <div id="wizSum" style="display:none" class="selsum">
      <div class="selsum-t">AUSGEWÄHLT:</div>
      <div id="wizSumItems"></div>
    </div>`;
  _wizFooter();
}

function _step2Lengths(t){
  const rows = t.items.map((item,i)=>{
    const label = item.l || item.n || '—';
    return `<div class="cablerow" id="cr-${i}">
      <label style="display:flex;align-items:center;gap:8px;flex:1;cursor:pointer">
        <input type="checkbox" id="lc-${i}" onchange="wizToggleLen(${i})" style="width:16px;height:16px;cursor:pointer">
        <span class="cable-s" style="min-width:60px">${esc(label)}</span>
      </label>
      <span class="qlbl">#&nbsp;Stk.:</span>
      <input class="qin" type="number" id="qa-${i}" min="0" value="0"
        oninput="wizQ(${i})" disabled style="opacity:0.4">
      <span class="qlbl">Spare:</span>
      <input class="qin" type="number" id="qs-${i}" min="0" value="0"
        oninput="wizQ(${i})" disabled style="opacity:0.4">
    </div>`;
  }).join('');
  document.getElementById('mBody').innerHTML=`
    ${_wizStepsHeader()}
    <div style="font-size:11px;color:var(--muted);margin-bottom:14px;letter-spacing:1px">
      <b style="color:var(--accent)">${esc(wiz.key)}</b> — Längen ankreuzen und Anzahl eingeben:
    </div>
    <div class="cablelist">
      ${rows}
      <div class="addlength-row">
        <span class="addlength-label">+ NEUE LÄNGE:</span>
        <input type="number" id="customLenVal" placeholder="z.B. 35" min="0.1" step="0.5"
          onkeydown="if(event.key==='Enter')wizAddCustomLen()" style="width:90px">
        <button class="addlength-btn" onclick="wizAddCustomLen()">HINZUFÜGEN</button>
      </div>
    </div>
    <div id="wizSum" style="display:none" class="selsum">
      <div class="selsum-t">AUSGEWÄHLT:</div>
      <div id="wizSumItems"></div>
    </div>`;
  _wizFooter();
}

function wizToggleLen(i){
  const checked = document.getElementById(`lc-${i}`).checked;
  const qa = document.getElementById(`qa-${i}`);
  const qs = document.getElementById(`qs-${i}`);
  qa.disabled = !checked;
  qs.disabled = !checked;
  qa.style.opacity = checked ? '1' : '0.4';
  qs.style.opacity = checked ? '1' : '0.4';
  if(!checked){ qa.value='0'; qs.value='0'; }
  wiz.selLengths[i] = checked;
  wizQ(i);
}

function wizQ(i){
  const a = Math.max(0,parseInt(document.getElementById(`qa-${i}`).value)||0);
  const s = Math.max(0,parseInt(document.getElementById(`qs-${i}`).value)||0);
  if(!wiz.sel[i]) wiz.sel[i]={a:0,s:0};
  wiz.sel[i]={a,s};
  document.getElementById(`cr-${i}`).classList.toggle('sel',a+s>0);
  const active   = Object.entries(wiz.sel).filter(([_,v])=>v.a+v.s>0);
  const sumEl    = document.getElementById('wizSum');
  const sumItems = document.getElementById('wizSumItems');
  if(!sumEl||!sumItems) return;
  if(!active.length){ sumEl.style.display='none'; return; }
  sumEl.style.display='block';
  const cat = getActiveCatalogTypes()[wiz.key];
  const isQty = cat && cat.unit_type === 'qty';
  sumItems.innerHTML = active.map(([idx,v])=>{
    let lbl;
    if(isQty){ lbl = wiz.key; }
    else { const item = cat.items[+idx]; lbl = ((item.n||'↳')+' '+(item.l||'')).trim(); }
    return `<div class="selrow"><span class="selrow-n">${esc(lbl)}</span>
      <span class="selrow-q">${v.a} Stk. + ${v.s} Spare</span></div>`;
  }).join('');
}

function wizAddCustomLen(){
  const lenInput = document.getElementById('customLenVal');
  const numVal   = parseFloat(lenInput.value);
  if(!numVal || numVal <= 0){ lenInput.focus(); return; }
  const lenVal   = numVal + 'm';
  const catalog  = getActiveCatalogTypes()[wiz.key];
  const newEntry = { n: wiz.key, l: lenVal };
  catalog.items.push(newEntry);
  catalog.items.sort((a,b)=>{
    const na = parseFloat(((a.l||a.n||'0')).replace(',','.'));
    const nb = parseFloat(((b.l||b.n||'0')).replace(',','.'));
    return na-nb;
  });
  const newIdx = catalog.items.findIndex(it=>it===newEntry);
  saveCatalogsStore();
  wiz.sel[newIdx] = {a:0,s:0};
  step2();
  toast('✓ "' + lenVal + '" zum Katalog hinzugefügt');
}

function toast(msg, isErr=false){
  const el = document.createElement('div');
  el.style.cssText=`position:fixed;bottom:24px;right:24px;background:var(--bg3);border:1px solid ${isErr?'var(--red)':'var(--green)'};color:${isErr?'var(--red)':'var(--green)'};padding:10px 18px;font-family:'Share Tech Mono',monospace;font-size:12px;letter-spacing:1px;z-index:2000;animation:mIn .2s ease;max-width:360px;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2800);
}

function wizDone(){
  const catalog  = getActiveCatalogTypes()[wiz.key];
  const isQty    = catalog && catalog.unit_type === 'qty';
  const selected = Object.entries(wiz.sel)
    .filter(([_,v])=>v.a+v.s>0)
    .map(([i,v])=>{
      if(isQty){
        return {name:wiz.key,length:'',anzahl:v.a,spare:v.s,im_projekt:0,kapitel:'',bemerkung:''};
      }
      const ci2         = catalog.items[+i];
      const displayName = ci2.n || ci2.l || '';
      const displayLen  = ci2.n ? (ci2.l||'') : '';
      return {name:displayName,length:displayLen,anzahl:v.a,spare:v.s,im_projekt:0,kapitel:'',bemerkung:ci2.b||''};
    });
  if(!selected.length){ alert('Bitte mindestens eine Menge > 0 eingeben.'); return; }
  const ci = wiz.ci; const cat = currentCats()[ci];
  const sortByLen = items=>{ items.sort((a,b)=>parseFloat((a.length||'0').replace(',','.'))-parseFloat((b.length||'0').replace(',','.'))); return items; };
  if(wiz.targetSi!==null){
    cat.sections[wiz.targetSi].items.push(...selected);
    sortByLen(cat.sections[wiz.targetSi].items);
  } else {
    const ex = cat.sections.findIndex(s=>s.type_name===wiz.key);
    if(ex>=0){ cat.sections[ex].items.push(...selected); sortByLen(cat.sections[ex].items); }
    else cat.sections.push({type_name:wiz.key,items:sortByLen(selected)});
  }
  save(); rerenderCat(ci); recalcAll();
  wiz.sel={};
  step2();
  toast('✓ ' + selected.length + ' Position(en) hinzugefügt');
}

function wizFinish(){ closeWiz(); }

// ── EIGENER EINTRAG ────────────────────────────────────────────────
function openCustom(ci,si){
  const hasSec  = si!==undefined;
  const secName = hasSec?currentCats()[ci].sections[si].type_name:'';
  wiz={ci,si};
  showWiz('Eigener Eintrag');
  document.getElementById('mBody').innerHTML=`
    <div class="formrow">
      <div class="formlbl">SEKTIONSNAME (Typ / Kabeltyp)</div>
      <input class="sec-name-input" id="cSec" placeholder="z.B. MEIN KABELTYP"
        value="${esc(secName)}"${hasSec?' readonly style="opacity:0.5;cursor:not-allowed"':''}>
    </div>
    <div class="formrow">
      <div class="formlbl">BEZEICHNUNG *</div>
      <input class="selin" id="cName" placeholder="Bezeichnung des Eintrags"
        value="${esc(secName)}" style="margin:0">
    </div>
    <div class="formrow">
      <div class="formlbl">LÄNGE / TYP</div>
      <input class="selin" id="cLen" placeholder="z.B. 10m, Schuko, …" style="margin:0">
    </div>
    <div class="grid2">
      <div class="formrow">
        <div class="formlbl"># ANZAHL</div>
        <input class="qin" type="number" id="cAnz" value="0" min="0" style="width:100%">
      </div>
      <div class="formrow">
        <div class="formlbl">SPARE</div>
        <input class="qin" type="number" id="cSpr" value="0" min="0" style="width:100%">
      </div>
    </div>
    <div class="formrow">
      <div class="formlbl">BEMERKUNG (optional)</div>
      <input class="selin" id="cBem" placeholder="Notiz…" style="margin:0">
    </div>`;
  document.getElementById('mFooter').innerHTML=`
    <button class="btn" onclick="closeWiz()">Abbrechen</button>
    <button class="btn btn-accent" onclick="saveCustom()">HINZUFÜGEN</button>`;
  if(hasSec) document.getElementById('cLen').focus();
}

function saveCustom(){
  const sec  = document.getElementById('cSec').value.trim();
  const name = document.getElementById('cName').value.trim();
  const len  = document.getElementById('cLen').value.trim();
  const anz  = Math.max(0,parseInt(document.getElementById('cAnz').value)||0);
  const spr  = Math.max(0,parseInt(document.getElementById('cSpr').value)||0);
  const bem  = document.getElementById('cBem').value.trim();
  if(!sec||!name){ alert('Sektionsname und Bezeichnung sind Pflichtfelder.'); return; }
  const ci = wiz.ci; const cat = currentCats()[ci];
  const newItem = {name,length:len,anzahl:anz,spare:spr,im_projekt:0,kapitel:'',bemerkung:bem};
  const ex = cat.sections.findIndex(s=>s.type_name===sec);
  if(ex>=0) cat.sections[ex].items.push(newItem);
  else cat.sections.push({type_name:sec,items:[newItem]});
  save(); closeWiz(); rerenderCat(ci); recalcAll();
}

function addLen(ci,si,input){
  const len = input.value.trim();
  if(!len){ input.focus(); return; }
  const sec = currentCats()[ci].sections[si];
  sec.items.push({name:sec.type_name,length:len,anzahl:0,spare:0,im_projekt:0,kapitel:'',bemerkung:''});
  save(); renderRows(ci,si); recalcAll();
  input.value=''; input.focus();
}
