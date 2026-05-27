// ══════════════════════════════════════════════════
// WIZARD — Material hinzufügen
// ══════════════════════════════════════════════════
let wiz = {};
const WIZ_RECENT_KEY = 'materialliste-licht-recent-v1';

function _loadRecent(){
  try{ return JSON.parse(localStorage.getItem(WIZ_RECENT_KEY)||'[]'); }catch(e){ return []; }
}
function _saveRecent(typeKey){
  const r = _loadRecent().filter(k=>k!==typeKey);
  r.unshift(typeKey);
  try{ localStorage.setItem(WIZ_RECENT_KEY, JSON.stringify(r.slice(0,8))); }catch(e){}
}

function openWiz(ci){ wiz={ci,targetSi:null,key:null,sel:{},selLengths:{}}; showWiz('Material hinzufügen'); step1(); }
function openWizToSec(ci,si){ wiz={ci,targetSi:si,key:null,sel:{},selLengths:{}}; showWiz('Material hinzufügen'); step1(); }
function openWizSearch(){ wiz={ci:-1,targetSi:null,key:null,sel:{},selLengths:{},_browseWorld:null}; showWiz('Material suchen'); step1(); }

function _wizHasDirtyData(){
  return Object.values(wiz.sel||{}).some(v=>(v.a||0)+(v.s||0)>0);
}
function _doCloseWiz(){
  document.getElementById('overlay').classList.remove('open','catmgr-mode');
  wiz={};
}
function closeWiz(){
  if(_wizHasDirtyData()){
    showConfirm('Eingaben verwerfen und schließen?', _doCloseWiz, 'Schließen', 'Ja, verwerfen');
    return;
  }
  _doCloseWiz();
}
function showWiz(title){ document.getElementById('mTitle').textContent=title; document.getElementById('overlay').classList.add('open'); }

function step1(){
  wiz.step = 1;
  const ci = wiz.ci;
  const catName = ci >= 0 ? currentCats()[ci].name : null;
  wiz._allEntries  = Object.entries(getActiveCatalogTypes());
  wiz._entries     = ci >= 0 ? wiz._allEntries.filter(([_,v])=>v.cat===catName) : wiz._allEntries;
  wiz._gridEntries = [];

  const recent      = _loadRecent();
  const types       = getActiveCatalogTypes();
  const recentInCat = recent.filter(k=>types[k]);
  const recentHtml  = recentInCat.length ? `
    <div class="wiz-section-hdr">ZULETZT VERWENDET</div>
    <div class="catgrid" style="margin-bottom:16px" id="wizRecentGrid">
      ${recentInCat.slice(0,6).map(key=>{
        const v = types[key]; if(!v) return '';
        const idx   = wiz._gridEntries.length;
        const rCatCi = currentCats().findIndex(c=>c.name===v.cat);
        wiz._gridEntries.push({key, ci: rCatCi>=0 ? rCatCi : ci});
        return `<div class="catcard" onclick="wizPickCard(${idx})">
          <div class="catcard-t">${esc(key)}</div>
          <div class="catcard-s">${esc(v.cat||'')}</div>
        </div>`;
      }).join('')}
    </div>` : '';

  const chipHtml = ci < 0 ? `
    <div class="wiz-world-chips" id="wizWorldChips">
      ${CAT_ORDER.map(w=>`<button class="wiz-world-chip" onclick="wizSetBrowseWorld('${w}')">${w}</button>`).join('')}
    </div>` : '';

  document.getElementById('mBody').innerHTML=`
    <div class="steps">
      <div class="step active">1 · TYP WÄHLEN</div>
      <div class="step">2 · MENGEN EINGEBEN</div>
    </div>
    <div class="wiz-search-wrap">
      <span class="wiz-search-icon">🔍</span>
      <input class="wiz-search" id="wizSearch" placeholder="Suchen — z.B. DMX, Han16, GrandMA, 1,5m …"
        oninput="wizUpdateSearch(this.value)" autocomplete="off">
    </div>
    ${chipHtml}
    ${recentHtml}
    <div id="wizSearchInfoBar" style="font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:8px">
      ${ci >= 0 ? esc(getActiveCatalog().name)+' · '+esc(catName) : esc(getActiveCatalog().name)+' · ALLE WELTEN'}
    </div>
    <div id="wizGrid" class="catgrid">${wizBuildGrid('')}</div>`;

  _renderStep1Footer();
  const si = document.getElementById('wizSearch'); if(si) setTimeout(()=>si.focus(),50);
}

function _renderStep1Footer(){
  document.getElementById('mFooter').innerHTML=
    `<button class="btn" onclick="closeWiz()">Abbrechen</button>`;
}

function wizUpdateSearch(val){
  const grid = document.getElementById('wizGrid'); if(!grid) return;
  wiz._gridEntries = [];
  const recentGrid = document.getElementById('wizRecentGrid');
  if(recentGrid){
    const recent = _loadRecent();
    const types  = getActiveCatalogTypes();
    recentGrid.innerHTML = recent.filter(k=>types[k]).slice(0,6).map(key=>{
      const v = types[key]; if(!v) return '';
      const idx    = wiz._gridEntries.length;
      const rCatCi = currentCats().findIndex(c=>c.name===v.cat);
      wiz._gridEntries.push({key, ci: rCatCi>=0 ? rCatCi : wiz.ci});
      return `<div class="catcard" onclick="wizPickCard(${idx})">
        <div class="catcard-t">${esc(key)}</div>
        <div class="catcard-s">${esc(v.cat||'')}</div>
      </div>`;
    }).join('');
  }
  grid.innerHTML = wizBuildGrid(val.trim());
  const info = document.getElementById('wizSearchInfoBar');
  if(info) info.textContent = val.trim()
    ? (wiz._gridEntries.length+' Treffer')
    : (wiz.ci >= 0 ? esc(getActiveCatalog().name)+' · '+currentCats()[wiz.ci].name : wiz._browseWorld ? esc(getActiveCatalog().name)+' · '+wiz._browseWorld : esc(getActiveCatalog().name)+' · ALLE WELTEN');
}

function wizSetBrowseWorld(weltName){
  wiz._browseWorld = (wiz._browseWorld === weltName) ? null : weltName;
  wiz._gridEntries = [];
  document.querySelectorAll('.wiz-world-chip').forEach(btn=>{
    btn.classList.toggle('active', btn.textContent === wiz._browseWorld);
  });
  const searchVal = (document.getElementById('wizSearch')||{}).value||'';
  document.getElementById('wizGrid').innerHTML = wizBuildGrid(searchVal.trim());
  const info = document.getElementById('wizSearchInfoBar');
  if(info) info.textContent = searchVal.trim()
    ? (wiz._gridEntries.length+' Treffer')
    : (wiz._browseWorld ? esc(getActiveCatalog().name)+' · '+wiz._browseWorld : esc(getActiveCatalog().name)+' · ALLE WELTEN');
}

function wizBuildGrid(query){
  const ci        = wiz.ci;
  const catName   = ci >= 0 ? currentCats()[ci].name : null;
  const activeCat = getActiveCatalog();
  const allEntries = wiz._allEntries||[];
  if(!wiz._gridEntries) wiz._gridEntries=[];

  const makeCard = (k,v,targetCi)=>{
    const idx = wiz._gridEntries.length;
    wiz._gridEntries.push({key:k, ci:targetCi});
    return `<div class="catcard" onclick="wizPickCard(${idx})">
      <div class="catcard-t">${esc(k)}</div>
      <div class="catcard-s">${(v.items||[]).length} Eintr.</div>
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
      const subGroups  = catGetSubGroups(activeCat,g.id);
      const direct     = byGrp[g.id]||[];
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
    if(ci < 0){
      if(!wiz._browseWorld) return '<div class="wiz-search-hint">Suchbegriff eingeben oder eine Welt auswählen&nbsp;…</div>';
      const browseCi  = currentCats().findIndex(c=>c.name===wiz._browseWorld);
      const browseEntries = allEntries.filter(([_,v])=>v.cat===wiz._browseWorld);
      if(!browseEntries.length) return `<div style="color:var(--muted);padding:24px;grid-column:1/-1;">Keine Einträge für „${esc(wiz._browseWorld)}".</div>`;
      return buildHierarchy(browseEntries, browseCi >= 0 ? browseCi : 0);
    }
    const entries = allEntries.filter(([_,v])=>v.cat===catName);
    if(!entries.length) return `<div style="color:var(--muted);font-size:13px;padding:24px;grid-column:1/-1;">
      Dieser Katalog enthält noch keine Einträge für „${esc(catName)}".
      <br><button class="btn btn-sm" style="margin-top:12px" onclick="openCatalogMgr()">→ Katalog bearbeiten</button>
    </div>`;
    return buildHierarchy(entries, ci);
  }

  const q = query.toLowerCase();
  const matches = allEntries.filter(([k,v])=>
    k.toLowerCase().includes(q)||
    (v.cat||'').toLowerCase().includes(q)||
    (activeCat.groups||[]).some(g=>g.id===v.group&&g.name.toLowerCase().includes(q))||
    (v.items||[]).some(it=>(it.n||'').toLowerCase().includes(q)||(it.l||'').toLowerCase().includes(q)||(it.b||'').toLowerCase().includes(q))
  );
  const filteredMatches = wiz._browseWorld ? matches.filter(([_,v])=>v.cat===wiz._browseWorld) : matches;
  if(!filteredMatches.length) return `<div style="color:var(--muted);font-size:13px;padding:20px;grid-column:1/-1;">Keine Treffer für „${esc(query)}"${wiz._browseWorld?' in '+wiz._browseWorld:''}.</div>`;

  const cats = currentCats();
  let html='';
  CAT_ORDER.forEach(catN=>{
    const catEntries = filteredMatches.filter(([_,v])=>v.cat===catN);
    if(!catEntries.length) return;
    const targetCi = cats.findIndex(c=>c.name===catN);
    const useCi    = targetCi>=0?targetCi:ci;
    html+=`<div style="grid-column:1/-1;font-size:10px;letter-spacing:2px;color:var(--accent);margin:10px 0 4px;padding:3px 8px;background:rgba(232,200,74,.1);border-left:3px solid var(--accent)">◆ ${catN.toUpperCase()}</div>`;
    html+=buildHierarchy(catEntries, useCi);
  });
  return html||`<div style="color:var(--muted);grid-column:1/-1;padding:20px">Keine Treffer.</div>`;
}

function wizPickCard(idx){
  const e = wiz._gridEntries && wiz._gridEntries[idx]; if(!e) return;
  if(e.ci !== wiz.ci) wiz.targetSi = null;
  wiz.ci = e.ci; wiz.key = e.key; wiz.sel = {}; wiz.selLengths = {};
  step2();
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
  </div>`;
}

function _wizFooter(){
  document.getElementById('mFooter').innerHTML=`
    <button class="btn" onclick="step1()">← ZURÜCK</button>
    <button class="btn" onclick="closeWiz()">Abbrechen</button>
    <button class="btn btn-accent" onclick="wizDone()">✓ HINZUFÜGEN</button>`;
}

function _wizWeltBadge(){
  const weltName = currentCats()[wiz.ci]?.name||'?';
  return `<span style="display:inline-block;margin-left:8px;color:var(--accent2);background:rgba(74,232,160,.08);border:1px solid rgba(74,232,160,.3);padding:1px 7px;font-size:10px;letter-spacing:1px;vertical-align:middle">→ ${esc(weltName)}</span>`;
}

function _step2Qty(t){
  document.getElementById('mBody').innerHTML=`
    ${_wizStepsHeader()}
    <div style="margin-bottom:14px;">
      <div style="font-size:16px;font-weight:700;color:var(--accent);letter-spacing:1px;margin-bottom:3px;">${esc(wiz.key)}</div>
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;">Anzahl eingeben: ${_wizWeltBadge()}</div>
    </div>
    <div class="cablelist">
      <div class="cablerow" id="cr-0">
        <span class="qlbl" style="flex:1;font-weight:600">${esc(wiz.key)}</span>
        <span class="qlbl">#&nbsp;Stk.:</span>
        <input class="qin" type="number" id="qa-0" min="0" value="1" oninput="wizQ(0)">
        <span class="qlbl">Spare:</span>
        <input class="qin" type="number" id="qs-0" min="0" value="0" oninput="wizQ(0)">
      </div>
    </div>
    <div class="selsum" style="margin-top:10px">
      <div class="selsum-t">VORSCHAU:</div>
      <div id="wizSumItems" style="color:var(--muted);font-size:12px">Mengen eingeben…</div>
    </div>`;
  _wizFooter();
  setTimeout(()=>wizQ(0),0);
}

function _step2Lengths(t){
  t.items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
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
    <div style="margin-bottom:14px;">
      <div style="font-size:16px;font-weight:700;color:var(--accent);letter-spacing:1px;margin-bottom:3px;">${esc(wiz.key)}</div>
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;">Längen ankreuzen und Anzahl eingeben: ${_wizWeltBadge()}</div>
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
    <div class="selsum" style="margin-top:10px">
      <div class="selsum-t">VORSCHAU:</div>
      <div id="wizSumItems" style="color:var(--muted);font-size:12px">Längen ankreuzen…</div>
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
  if(checked){ if(!+qa.value) qa.value='1'; }
  else { qa.value='0'; qs.value='0'; }
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
  const sumItems = document.getElementById('wizSumItems');
  if(!sumItems) return;
  if(!active.length){
    const cat = getActiveCatalogTypes()[wiz.key];
    sumItems.style.color='var(--muted)';
    sumItems.textContent = cat?.unit_type==='qty' ? 'Mengen eingeben…' : 'Längen ankreuzen…';
    return;
  }
  sumItems.style.color='';
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
  const exists = (catalog.items||[]).some(it=>parseLen(it.l||it.n) === numVal);
  if(exists){ toast(`„${lenVal}" existiert bereits in diesem Typ.`, true); lenInput.select(); return; }
  const newEntry = { n: wiz.key, l: lenVal };
  catalog.items.push(newEntry);
  catalog.items.sort((a,b)=>parseLen(a.l||a.n)-parseLen(b.l||b.n));
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

function _mergeItems(sectionItems, newItems){
  newItems.forEach(item=>{
    const ex = item.length
      ? sectionItems.find(i=>i.length===item.length)
      : sectionItems.find(i=>i.name===item.name);
    if(ex){ ex.anzahl=(ex.anzahl||0)+item.anzahl; ex.spare=(ex.spare||0)+item.spare; }
    else sectionItems.push(item);
  });
  sectionItems.sort((a,b)=>{
    const al = a.length ? parseLen(a.length) : 99999;
    const bl = b.length ? parseLen(b.length) : 99999;
    return al - bl;
  });
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
      const displayName = ci2.n || wiz.key || '';
      const displayLen  = ci2.l || '';
      return {name:displayName,length:displayLen,anzahl:v.a,spare:v.s,im_projekt:0,kapitel:'',bemerkung:ci2.b||''};
    });
  if(!selected.length){ toast('Bitte mindestens eine Menge > 0 eingeben.', true); return; }
  const ci  = wiz.ci;
  const cat = currentCats()[ci];
  const sortByLen = items=>{ items.sort((a,b)=>parseLen(a.length)-parseLen(b.length)); return items; };
  if(wiz.targetSi!==null){
    _mergeItems(cat.sections[wiz.targetSi].items, selected);
  } else {
    const ex = cat.sections.findIndex(s=>s.type_name===wiz.key);
    if(ex>=0){ _mergeItems(cat.sections[ex].items, selected); }
    else cat.sections.push({type_name:wiz.key, unit_type: isQty?'qty':'lengths', items:sortByLen(selected)});
  }
  save(); rerenderCat(ci); recalcAll();
  _saveRecent(wiz.key);
  toast('✓ ' + selected.length + ' Position(en) hinzugefügt');
  _doCloseWiz();
}

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
  if(!sec||!name){ toast('Sektionsname und Bezeichnung sind Pflichtfelder.', true); return; }
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
