// ══════════════════════════════════════════════════
// BERECHNUNG — DIFF, TOTAL, Badges
// ══════════════════════════════════════════════════
function xdiff(item){ return (item.anzahl||0)+(item.spare||0)-(item.im_projekt||0); }
function xtotal(item){ return (item.anzahl||0)+(item.spare||0); }

function lc(ci,si,ii){
  const item = currentCats()[ci].sections[si].items[ii];
  const d = xdiff(item), t = xtotal(item);
  const dEl = document.getElementById(`diff-${ci}-${si}-${ii}`);
  const tEl = document.getElementById(`total-${ci}-${si}-${ii}`);
  const tr  = document.getElementById(`row-${ci}-${si}-${ii}`);
  if(!dEl) return;
  const hasData = (item.anzahl||0)+(item.spare||0)+(item.im_projekt||0) > 0;
  if(!hasData){
    dEl.textContent='—'; dEl.className='td-diff zero'; tEl.textContent='—';
    if(tr) tr.className='';
  } else {
    dEl.textContent = d>=0 ? '+'+d : d;
    dEl.className   = 'td-diff '+(d>0?'pos':d<0?'neg':'zero');
    tEl.textContent = t;
    if(tr) tr.className='has-data';
  }
  recalcBadge(ci);
}

function recalcAll(){
  currentCats().forEach((_,ci)=>
    currentCats()[ci].sections.forEach((_,si)=>
      currentCats()[ci].sections[si].items.forEach((_,ii)=>lc(ci,si,ii))
    )
  );
}

function recalcBadge(ci){
  const cat = currentCats()[ci];
  const all = cat.sections.flatMap(s=>s.items);
  const neg = all.filter(i=>xdiff(i)<0&&((i.anzahl||0)+(i.spare||0)+(i.im_projekt||0)>0)).length;
  const b = document.getElementById(`badge-${ci}`);
  if(b){ b.textContent=neg>0?neg:'✓'; b.className='tbadge '+(neg>0?'warn':'ok'); }
  const anyWarn = currentCats().some(cat=>
    cat.sections.flatMap(s=>s.items).some(i=>xdiff(i)<0&&((i.anzahl||0)+(i.spare||0)+(i.im_projekt||0)>0))
  );
  document.getElementById('gDot').className   = 'sdot '+(anyWarn?'warn':'ok');
  document.getElementById('gStatus').textContent = anyWarn?'! ZU BUCHEN':'ALLES OK';
}
