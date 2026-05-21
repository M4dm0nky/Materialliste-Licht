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
  const selPos      = [...document.querySelectorAll('.pdfposcb')].filter(c=>c.checked).map(c=>+c.dataset.pi);
  const selCats     = [...document.querySelectorAll('.pdfcatcb')].filter(c=>c.checked).map(c=>+c.dataset.ci);
  const onlyFilled  = document.getElementById('pdfOnlyFilled').checked;
  const onlyMissing = document.getElementById('pdfOnlyMissing').checked;
  const showDiff    = document.getElementById('pdfShowDiff').checked || onlyMissing;
  const orient      = document.querySelector('input[name="pdfOrient"]:checked')?.value || 'landscape';
  closeModal('pdfModal');
  if(!selPos.length){ toast('Bitte mindestens eine Position wählen.',true); return; }

  const lbPlaner   = logos.planer  ? `<img src="${logos.planer}"  style="max-height:10mm;max-width:50mm;object-fit:contain;object-position:left center;filter:brightness(0) invert(1);">` : '';
  const lbBooking  = logos.booking ? `<img src="${logos.booking}" style="max-height:14mm;max-width:40mm;object-fit:contain;">` : '';
  const lbBand     = logos.band    ? `<img src="${logos.band}"    style="max-height:14mm;max-width:40mm;object-fit:contain;">` : '';
  const lbCfCenter = logos.band
    ? `<img src="${logos.band}"    style="max-height:20mm;max-width:60mm;object-fit:contain;">`
    : (logos.planer ? `<img src="${logos.planer}" style="max-height:20mm;max-width:60mm;object-fit:contain;filter:brightness(0) invert(1);">` : '');
  const projectName = state._project || 'Material Planer';
  const projectDate = state._date || new Date().toLocaleDateString('de-DE');

  const pdfCatTypes = getActiveCatalogTypes();
  const pdfGroups   = getActiveCatalog().groups || [];
  const cols        = showDiff ? 8 : 7;
  let itemCount     = 0;
  let missingCount  = 0;

  function renderPosSections(pos){
    let bodies = '';
    selCats.forEach(ci => {
      const cat = pos.categories[ci];
      if(!cat) return;

      const grouped = {};
      pdfGroups.forEach(g => { grouped[g.id] = []; });
      grouped['__none'] = [];

      cat.sections.forEach(sec => {
        let items = onlyFilled
          ? sec.items.filter(i => (i.anzahl||0)+(i.spare||0)+(i.im_projekt||0) > 0)
          : sec.items;
        if(onlyMissing) items = items.filter(i => xdiff(i) < 0);
        if(!items.length) return;
        const gid = pdfCatTypes[sec.type_name]?.group || '__none';
        (grouped[gid] || grouped['__none']).push({sec, items});
      });

      const groupOrder = [...pdfGroups.map(g=>({id:g.id,name:g.name})), {id:'__none',name:null}];
      groupOrder.forEach(({id:gid, name:gname}) => {
        const secs = grouped[gid] || [];
        if(!secs.length) return;
        let groupContent = '';
        if(gname) groupContent += `<tr class="grp-hdr"><td colspan="${cols}">${gname}</td></tr>`;
        secs.forEach(({sec, items}) => {
          const isQty = (pdfCatTypes[sec.type_name]?.unit_type === 'qty')
                     || (sec.unit_type === 'qty')
                     || (sec.items.length > 0 && sec.items.every(it => !it.length));
          const renderItems = isQty ? items.slice(0,1) : items;
          let rows = isQty ? '' : `<tr class="sec-hdr"><td colspan="${cols}">${sec.type_name} <span style="color:#5A6678;font-weight:400;font-size:7pt;">(${cat.name})</span></td></tr>`;
          renderItems.forEach(item => {
            itemCount++;
            const d = xdiff(item);
            if(d < 0) missingCount++;
            const hasData = (item.anzahl||0)+(item.spare||0)+(item.im_projekt||0) > 0;
            const diffColor = d < 0 ? '#c0392b' : d > 0 ? '#1a6b3a' : '#5A6678';
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
          groupContent += rows;
        });
        if(groupContent) bodies += `<tbody class="cat-group">${groupContent}</tbody>`;
      });
    });
    return bodies;
  }

  let tableBodies = '';
  selPos.forEach((pi, idx) => {
    const pos = state.positions[pi];
    if(!pos) return;
    const pageBreak = idx > 0 ? 'style="page-break-before:always"' : '';
    tableBodies += `<tbody ${pageBreak}><tr class="pos-hdr"><td colspan="${cols}">${esc(pos.name)}</td></tr></tbody>`;
    tableBodies += renderPosSections(pos);
  });

  if(onlyMissing && itemCount === 0){ toast('Keine fehlenden Positionen gefunden.', true); return; }

  const diffHeader = showDiff ? '<th>DIFF</th>' : '';
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${projectName}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Geist',sans-serif;font-size:9pt;color:#0b0d14;background:#fff;}
.band{background:#0b0d14;height:14mm;display:flex;align-items:center;justify-content:space-between;padding:0 10mm;}
.band-tag{font-family:'JetBrains Mono',monospace;font-size:10pt;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:#dde2ee;}
.ph{display:grid;grid-template-columns:1fr auto;align-items:start;padding:8mm 10mm 6mm;border-bottom:2px solid #0b0d14;gap:12px;}
.pt{font-family:'Geist',sans-serif;font-size:26pt;font-weight:600;letter-spacing:-0.018em;color:#0b0d14;line-height:1.1;}
.ps{font-family:'JetBrains Mono',monospace;font-size:9pt;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:#5A6678;margin-top:4px;}
.ph-logos{display:flex;align-items:center;gap:10px;justify-content:flex-end;}
.stat-strip{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid #D6D9DE;border-bottom:2px solid #0b0d14;padding:6mm 10mm;}
.stat{text-align:center;}
.stat-val{display:block;font-family:'Geist',sans-serif;font-size:18pt;font-weight:600;letter-spacing:-0.015em;font-variant-numeric:tabular-nums;color:#0b0d14;}
.stat-lbl{display:block;font-family:'JetBrains Mono',monospace;font-size:9pt;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:#5A6678;margin-top:3px;}
.tw{padding:0 10mm;}
table{width:100%;border-collapse:collapse;}
thead th{background:#0b0d14;color:#dde2ee;padding:5px 8px;text-align:left;font-family:'Geist',sans-serif;font-size:8.5pt;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;border:none;}
thead th:nth-child(n+3){text-align:center;}
.grp-hdr td{background:#1e2840;color:#dde2ee;font-family:'Geist',sans-serif;font-size:9pt;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 8px;border-top:2px solid #0b0d14;}
.sec-hdr td{background:#F1EFE9;color:#0b0d14;font-family:'Geist',sans-serif;font-size:8.5pt;font-weight:600;letter-spacing:0.04em;padding:4px 8px;border-top:1px solid #D6D9DE;}
.pos-hdr td{background:#0b0d14;color:#dde2ee;font-family:'Geist',sans-serif;font-size:14pt;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:10px 8px;text-align:center;border:none;}
tbody.cat-group{page-break-inside:avoid;}
tbody tr{border-bottom:1px solid #D6D9DE;}
.ntd{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9pt;font-variant-numeric:tabular-nums;}
.ntd2{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9pt;font-variant-numeric:tabular-nums;text-align:center;}
.ltd{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9pt;color:#5A6678;white-space:nowrap;}
.ktd{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:8.5pt;color:#5A6678;}
.slim-footer{background:#0b0d14;height:9mm;display:flex;align-items:center;justify-content:space-between;padding:0 10mm;margin-top:8mm;}
.slim-footer span{font-family:'JetBrains Mono',monospace;font-size:8.5pt;letter-spacing:0.14em;text-transform:uppercase;color:#9AA3B5;}
.closing-footer{page-break-before:always;background:#0b0d14;min-height:36mm;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:8mm 10mm;gap:10mm;}
.cf-left{color:#dde2ee;}.cf-center{display:flex;justify-content:center;align-items:center;}.cf-right{color:#dde2ee;text-align:right;}
.cf-label{font-family:'JetBrains Mono',monospace;font-size:8pt;letter-spacing:0.22em;text-transform:uppercase;color:#9AA3B5;}
.cf-val{font-family:'Geist',sans-serif;font-size:10pt;font-weight:500;color:#dde2ee;margin-top:1px;}
.np{margin:8px 10mm;padding:8px;background:#F1EFE9;border:1px solid #D6D9DE;font-size:8pt;color:#333;border-radius:2px;font-family:'JetBrains Mono',monospace;}
@media print{
  .np{display:none!important;}
  .band{position:fixed;top:0;left:0;right:0;z-index:100;}
  .slim-footer{position:fixed;bottom:0;left:0;right:0;z-index:100;}
  @page{size:A4 ${orient};margin:14mm 0mm 9mm 0mm;}
}
</style></head><body>
<div class="band">
  <div>${lbPlaner}</div>
  <div class="band-tag">${esc(projectName)}</div>
</div>
<div class="ph">
  <div>
    <div class="pt">${esc(projectName)}</div>
    <div class="ps">Material Planer · Touring Production · ${projectDate} · ◆ v0.5.9.14</div>
  </div>
  <div class="ph-logos">${lbBand}${lbBooking}</div>
</div>
<div class="stat-strip">
  <div class="stat"><span class="stat-val">${selPos.length}</span><span class="stat-lbl">Positionen</span></div>
  <div class="stat"><span class="stat-val">${itemCount}</span><span class="stat-lbl">Items gesamt</span></div>
  <div class="stat"><span class="stat-val">${missingCount}</span><span class="stat-lbl">Fehlend</span></div>
</div>
<div class="tw">
<table>
  <thead><tr><th>Bezeichnung</th><th>Länge/Typ</th><th>#&nbsp;Stk.</th><th>Spare</th><th>Gesamt</th><th>Im&nbsp;Proj.</th>${diffHeader}<th>Kapitel</th></tr></thead>
  ${tableBodies}
</table>
</div>
<div class="slim-footer">
  <span>NYX Lightwork · Material Planer</span>
  <span>${projectDate}</span>
</div>
<div class="closing-footer">
  <div class="cf-left">
    <div class="cf-label">Projekt</div>
    <div class="cf-val">${esc(projectName)}</div>
    <div class="cf-label" style="margin-top:6px;">Datum</div>
    <div class="cf-val">${projectDate}</div>
    <div class="cf-label" style="margin-top:6px;">Version</div>
    <div class="cf-val">◆ v0.5.9.14</div>
  </div>
  <div class="cf-center">${lbCfCenter}</div>
  <div class="cf-right">
    <div class="cf-label">Erstellt mit</div>
    <div class="cf-val">Material Planer</div>
    <div class="cf-label" style="margin-top:6px;">NYX Lightwork</div>
    <div class="cf-val">Touring Production</div>
  </div>
</div>
<div class="np"><strong>Cmd+P</strong> / <strong>Strg+P</strong> → "Als PDF speichern"</div>
<script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script>
</body></html>`;

  const win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
}
