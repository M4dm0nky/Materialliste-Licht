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
  const onlyFilled  = document.getElementById('pdfOnlyFilled').checked;
  const onlyMissing = document.getElementById('pdfOnlyMissing').checked;
  const showDiff    = document.getElementById('pdfShowDiff').checked || onlyMissing;
  const orient      = document.querySelector('input[name="pdfOrient"]:checked')?.value || 'landscape';
  const themeId     = document.querySelector('input[name="pdfTheme"]:checked')?.value || 'standard';
  const theme       = PDF_THEMES.find(t => t.id === themeId) || PDF_THEMES[0];
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
  let itemCount     = 0;

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
          let rows = isQty ? '' : `<tr class="sec-hdr"><td colspan="${cols}">${sec.type_name} <span style="color:#888;font-weight:400;font-size:7pt;">(${cat.name})</span></td></tr>`;
          renderItems.forEach(item => {
            itemCount++;
            const d = xdiff(item);
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
    tableBodies += `<tbody ${pageBreak}><tr class="pos-hdr"><td colspan="${cols}"><span>${esc(pos.name)}</span></td></tr></tbody>`;
    tableBodies += renderPosSections(pos);
  });

  if(onlyMissing && itemCount === 0){ toast('Keine fehlenden Positionen gefunden.', true); return; }

  const diffHeader = showDiff ? '<th>DIFF</th>' : '';
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${projectName}</title>
${theme.fontUrl ? '<link href="' + theme.fontUrl + '" rel="stylesheet">' : ''}
<style>
${theme.css(orient)}
</style></head><body>
<div class="ph">
  <div class="ph-left">${lbPlaner}</div>
  <div class="ph-center">${lbBand}<div><div class="pt">${projectName}</div><div class="ps">Material Planer · Touring Production · ◆ v0.6.19</div></div></div>
  <div class="ph-right"><div class="pd">${projectDate}</div>${lbBooking}</div>
</div>
<table>
  <thead><tr><th>Bezeichnung</th><th>Länge/Typ</th><th>#&nbsp;Stk.</th><th>Spare</th><th>Gesamt</th><th>Im&nbsp;Proj.</th>${diffHeader}<th>Kapitel</th></tr></thead>
  ${tableBodies}
</table>
<div class="np"><strong>Cmd+P</strong> / <strong>Strg+P</strong> → "Als PDF speichern"</div>
<script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script>
</body></html>`;

  const win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
}
