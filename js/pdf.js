// ══════════════════════════════════════════════════
// PDF EXPORT
// ══════════════════════════════════════════════════
function openPDFExport(){
  document.getElementById('pdfPosCbs').innerHTML = state.positions.map((pos,pi) =>
    `<label class="pdf-cb-row"><input type="checkbox" class="pdfposcb" data-pi="${pi}" checked> ${esc(pos.name)}</label>`
  ).join('');
  document.getElementById('pdfCatCbs').innerHTML = currentCats().map((cat,ci) =>
    `<label class="pdf-cb-row"><input type="checkbox" class="pdfcatcb" data-ci="${ci}" checked> ${esc(cat.name)}</label>`
  ).join('');
  document.getElementById('pdfModal').classList.add('open');
}

function generatePDF(){
  const selPos    = [...document.querySelectorAll('.pdfposcb')].filter(c=>c.checked).map(c=>+c.dataset.pi);
  const selCats   = [...document.querySelectorAll('.pdfcatcb')].filter(c=>c.checked).map(c=>+c.dataset.ci);
  const onlyFilled = document.getElementById('pdfOnlyFilled').checked;
  const showDiff   = document.getElementById('pdfShowDiff').checked;
  closeModal('pdfModal');
  if(!selPos.length){ toast('Bitte mindestens eine Position wählen.',true); return; }

  const lbPlaner  = logos.planer  ? `<img src="${logos.planer}"  style="max-height:52px;max-width:160px;object-fit:contain;object-position:left center;">` : '';
  const lbBooking = logos.booking ? `<img src="${logos.booking}" style="max-height:52px;max-width:160px;object-fit:contain;object-position:right center;">` : '';
  const lbBand    = logos.band    ? `<img src="${logos.band}"    style="max-height:48px;max-width:140px;object-fit:contain;">` : '';
  const projectName = state._project || 'Material Planer';
  const projectDate = state._date || new Date().toLocaleDateString('de-DE');

  const pdfCatTypes = getActiveCatalogTypes();
  const pdfGroups   = getActiveCatalog().groups || [];
  const cols        = showDiff ? 8 : 7;

  function renderPosSections(pos){
    let bodies = '';
    selCats.forEach(ci => {
      const cat = pos.categories[ci];
      if(!cat) return;

      const grouped = {};
      pdfGroups.forEach(g => { grouped[g.id] = []; });
      grouped['__none'] = [];

      cat.sections.forEach(sec => {
        const items = onlyFilled
          ? sec.items.filter(i => (i.anzahl||0)+(i.spare||0)+(i.im_projekt||0) > 0)
          : sec.items;
        if(!items.length) return;
        const gid = pdfCatTypes[sec.type_name]?.group || '__none';
        (grouped[gid] || grouped['__none']).push({sec, items});
      });

      const groupOrder = [...pdfGroups.map(g=>({id:g.id,name:g.name})), {id:'__none',name:null}];
      groupOrder.forEach(({id:gid, name:gname}) => {
        const secs = grouped[gid] || [];
        if(!secs.length) return;
        if(gname) bodies += `<tbody><tr class="grp-hdr"><td colspan="${cols}">${gname}</td></tr></tbody>`;
        secs.forEach(({sec, items}) => {
          const isQty = (pdfCatTypes[sec.type_name]?.unit_type === 'qty')
                     || (sec.unit_type === 'qty')
                     || (sec.items.length > 0 && sec.items.every(it => !it.length));
          const renderItems = isQty ? items.slice(0,1) : items;
          let rows = isQty ? '' : `<tr class="sec-hdr"><td colspan="${cols}">${sec.type_name} <span style="color:#888;font-weight:400;font-size:7pt;">(${cat.name})</span></td></tr>`;
          renderItems.forEach(item => {
            const d = (item.anzahl||0)+(item.spare||0)-(item.im_projekt||0);
            const hasData = (item.anzahl||0)+(item.spare||0)+(item.im_projekt||0) > 0;
            const diffColor = d < 0 ? '#c0392b' : d > 0 ? '#1a6b3a' : '#888';
            rows += `<tr${hasData?' class="filled"':''}>
              <td class="ntd">${isQty ? (item.name||sec.type_name||'') : (item.name||'')}</td>
              <td class="ltd">${isQty ? '' : (item.length||'')}</td>
              <td class="ntd2">${item.anzahl||0}</td>
              <td class="ntd2">${item.spare||0}</td>
              <td class="ntd2">${(item.anzahl||0)+(item.spare||0)}</td>
              <td class="ntd2">${item.im_projekt||0}</td>
              ${showDiff?`<td class="ntd2" style="color:${diffColor};font-weight:700;">${hasData?(d>=0?'+'+d:d):'—'}</td>`:''}
              <td class="ktd">${item.kapitel||''}</td>
            </tr>`;
          });
          if(rows) bodies += `<tbody class="sec-group">${rows}</tbody>`;
        });
      });
    });
    return bodies;
  }

  let tableBodies = '';
  selPos.forEach((pi, idx) => {
    const pos = state.positions[pi];
    if(!pos) return;
    const pageBreak = idx > 0 ? 'style="page-break-before:always"' : '';
    tableBodies += `<tbody ${pageBreak}><tr class="pos-hdr"><td colspan="${cols}"><span>${esc(pos.name)}</span></td></tr></tbody>`;
    tableBodies += renderPosSections(pos);
  });

  const diffHeader = showDiff ? '<th>DIFF</th>' : '';
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${projectName}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'IBM Plex Mono',monospace;font-size:8.5pt;color:#111;padding:14px;}
.ph{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:2px solid #e8c84a;padding-bottom:10px;margin-bottom:14px;gap:8px;}
.ph-left{display:flex;align-items:center;justify-content:flex-start;}
.ph-center{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;}
.ph-right{display:flex;align-items:center;justify-content:flex-end;}
.pt{font-family:'Bebas Neue',sans-serif;font-size:26pt;letter-spacing:3px;color:#0d0f14;line-height:1;}
.ps{font-size:7pt;color:#666;text-transform:uppercase;letter-spacing:.1em;margin-top:2px;}
.pd{font-size:7.5pt;color:#e8c84a;text-align:right;}
table{width:100%;border-collapse:collapse;margin-top:2px;}
thead th{background:#0d0f14;color:#e8c84a;padding:5px 7px;text-align:left;font-size:7pt;text-transform:uppercase;letter-spacing:.08em;border:1px solid #2a3050;}
thead th:nth-child(n+3){text-align:center;}
.grp-hdr td{background:#e8c84a;color:#0d0f14;font-family:'Bebas Neue',sans-serif;font-size:11pt;letter-spacing:3px;padding:5px 10px;border-top:2px solid #c9a800;}
.sec-hdr td{background:#1c2030;color:#e8c84a;font-family:'Bebas Neue',sans-serif;font-size:10pt;letter-spacing:2px;padding:5px 8px;border-top:1px solid #2a3050;border-bottom:1px solid #2a3050;}
.pos-hdr td{background:#000;color:#000;font-family:'Bebas Neue',sans-serif;font-size:18pt;letter-spacing:5px;padding:14px 10px;text-align:center;border:3px solid #000;box-shadow:inset 0 0 0 4px #e8c84a;}
.pos-hdr td span{background:#e8c84a;color:#000;padding:6px 28px;display:inline-block;}
tbody.sec-group{page-break-inside:avoid;}
tbody tr{border-bottom:1px solid #e8e8e8;}
tbody tr.filled{background:#f8fdf9;}
.ntd{padding:4px 7px;font-size:8pt;}
.ntd2{padding:4px 7px;font-size:8pt;text-align:center;}
.ltd{padding:4px 7px;font-size:7.5pt;font-family:'IBM Plex Mono',monospace;color:#555;white-space:nowrap;}
.ktd{padding:4px 7px;font-size:7.5pt;color:#888;}
.np{margin-top:14px;padding:8px;background:#fffbe6;border:1px solid #e8c84a;font-size:8pt;color:#333;border-radius:3px;}
@media print{body{padding:5px;}.np{display:none!important;}@page{size:A4 landscape;margin:8mm;}}
</style></head><body>
<div class="ph">
  <div class="ph-left">${lbPlaner}</div>
  <div class="ph-center">${lbBand}<div><div class="pt">${projectName}</div><div class="ps">Material Planer · Touring Production · ◆ v0.4.1</div></div></div>
  <div class="ph-right"><div class="pd">${projectDate}</div>${lbBooking}</div>
</div>
<table>
  <thead><tr><th>Bezeichnung</th><th>Länge/Typ</th><th>#&nbsp;Stk.</th><th>Spare</th><th>Gesamt</th><th>Im&nbsp;Proj.</th>${diffHeader}<th>Kapitel</th></tr></thead>
  ${tableBodies}
</table>
<div class="np"><strong>Cmd+P</strong> / <strong>Strg+P</strong> → "Als PDF speichern" → Querformat empfohlen</div>
<script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script>
</body></html>`;

  const win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
}
