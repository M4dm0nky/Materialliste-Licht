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
  const orient      = document.querySelector('input[name="pdfOrient"]:checked')?.value || 'portrait';
  closeModal('pdfModal');
  if(!selPos.length){ toast('Bitte mindestens eine Position wählen.',true); return; }

  // NYX CI Logos — inline SVG, keine Netzwerkabhängigkeit beim Drucken
  const NYX_LOGO_HZ = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80"><rect width="320" height="80" fill="#0b0d14"></rect><g transform="scale(0.4) translate(0,0)"><defs><filter id="gBolt_hz" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><filter id="gSoft_hz" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><radialGradient id="hexGrad_hz" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#f7c948" stop-opacity="0.09"></stop><stop offset="100%" stop-color="#f7c948" stop-opacity="0"></stop></radialGradient><linearGradient id="waveGrad_hz" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f7c948" stop-opacity="0"></stop><stop offset="18%" stop-color="#f7c948" stop-opacity="0.7"></stop><stop offset="55%" stop-color="#f7c948" stop-opacity="1"></stop><stop offset="85%" stop-color="#f7c948" stop-opacity="0.6"></stop><stop offset="100%" stop-color="#f7c948" stop-opacity="0.1"></stop></linearGradient><clipPath id="cbClip_hz"><rect x="51" y="49" width="98" height="112" rx="5"></rect></clipPath></defs><path d="M188.00,100.00 L144.00,176.21 L56.00,176.21 L12.00,100.00 L56.00,23.79 L144.00,23.79 Z" fill="url(#hexGrad_hz)"></path><path d="M188.00,100.00 L144.00,176.21 L56.00,176.21 L12.00,100.00 L56.00,23.79 L144.00,23.79 Z" fill="none" stroke="#dde2ee" stroke-width="1.8" opacity="0.2"></path><path d="M180.00,100.00 L140.00,169.28 L60.00,169.28 L20.00,100.00 L60.00,30.72 L140.00,30.72 Z" fill="none" stroke="#f7c948" stroke-width="0.6" opacity="0.1"></path><rect x="51" y="49" width="98" height="112" rx="5" fill="#1e2840" stroke="#dde2ee" stroke-width="1.6" opacity="0.9"></rect><g clip-path="url(#cbClip_hz)"><line x1="61" y1="71" x2="139" y2="71" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="86.6" x2="139" y2="86.6" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="117.8" x2="139" y2="117.8" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="133.4" x2="139" y2="133.4" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="149" x2="139" y2="149" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line></g><line x1="58" y1="105" x2="151" y2="105" stroke="#dde2ee" stroke-width="0.8" stroke-dasharray="3 4" opacity="0.15" clip-path="url(#cbClip_hz)"></line><path d="M60,105 L60.62,103.24 L61.24,101.5 L61.87,99.81 L62.49,98.19 L63.11,96.67 L63.73,95.26 L64.36,93.99 L64.98,92.86 L65.6,91.91 L66.22,91.14 L66.85,90.56 L67.47,90.18 L68.09,90.01 L68.72,90.05 L69.34,90.29 L69.96,90.73 L70.58,91.38 L71.2,92.21 L71.83,93.22 L72.45,94.39 L73.07,95.71 L73.69,97.16 L74.32,98.72 L74.94,100.36 L75.56,102.07 L76.19,103.82 L76.81,105.59 L77.43,107.35 L78.05,109.07 L78.67,110.74 L79.3,112.33 L79.92,113.82 L80.54,115.18 L81.16,116.41 L81.79,117.47 L82.41,118.37 L83.03,119.07 L83.66,119.59 L84.28,119.9 L84.9,120 L85.52,119.9 L86.14,119.59 L86.77,119.07 L87.39,118.37 L88.01,117.47 L88.63,116.41 L89.26,115.18 L89.88,113.82 L90.5,112.33 L91.13,110.74 L91.75,109.07 L92.37,107.35 L92.99,105.59 L93.62,103.82 L94.24,102.07 L94.86,100.36 L95.48,98.72 L96.1,97.16 L96.73,95.71 L97.35,94.39 L97.97,93.22 L98.59,92.21 L99.22,91.38 L99.84,90.73 L100.46,90.29 L101.08,90.05 L101.71,90.01 L102.33,90.18 L102.95,90.56 L103.57,91.14 L104.2,91.91 L104.82,92.86 L105.44,93.99 L106.06,95.26 L106.69,96.67 L107.31,98.19 L107.93,99.81 L108.55,101.5 L109.18,103.24 L109.8,105" stroke="url(#waveGrad_hz)" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#gBolt_hz)"></path><path d="M60,105 L60.62,103.24 L61.24,101.5 L61.87,99.81 L62.49,98.19 L63.11,96.67 L63.73,95.26 L64.36,93.99 L64.98,92.86 L65.6,91.91 L66.22,91.14 L66.85,90.56 L67.47,90.18 L68.09,90.01 L68.72,90.05 L69.34,90.29 L69.96,90.73 L70.58,91.38 L71.2,92.21 L71.83,93.22 L72.45,94.39 L73.07,95.71 L73.69,97.16 L74.32,98.72 L74.94,100.36 L75.56,102.07 L76.19,103.82 L76.81,105.59 L77.43,107.35 L78.05,109.07 L78.67,110.74 L79.3,112.33 L79.92,113.82 L80.54,115.18 L81.16,116.41 L81.79,117.47 L82.41,118.37 L83.03,119.07 L83.66,119.59 L84.28,119.9 L84.9,120 L85.52,119.9 L86.14,119.59 L86.77,119.07 L87.39,118.37 L88.01,117.47 L88.63,116.41 L89.26,115.18 L89.88,113.82 L90.5,112.33 L91.13,110.74 L91.75,109.07 L92.37,107.35 L92.99,105.59 L93.62,103.82 L94.24,102.07 L94.86,100.36 L95.48,98.72 L96.1,97.16 L96.73,95.71 L97.35,94.39 L97.97,93.22 L98.59,92.21 L99.22,91.38 L99.84,90.73 L100.46,90.29 L101.08,90.05 L101.71,90.01 L102.33,90.18 L102.95,90.56 L103.57,91.14 L104.2,91.91 L104.82,92.86 L105.44,93.99 L106.06,95.26 L106.69,96.67 L107.31,98.19 L107.93,99.81 L108.55,101.5 L109.18,103.24 L109.8,105" stroke="#f7c948" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.75"></path><circle cx="110.8" cy="105" r="15" fill="#f7c948" opacity="0.08" filter="url(#gBolt_hz)"></circle><circle cx="110.8" cy="105" r="11" fill="#f7c948" opacity="0.18" filter="url(#gBolt_hz)"></circle><circle cx="110.8" cy="105" r="8" fill="#f7c948" opacity="0.35" filter="url(#gSoft_hz)"></circle><circle cx="110.8" cy="105" r="6" fill="#f7c948"></circle><line x1="117.8" y1="105" x2="140" y2="105" stroke="#f7c948" stroke-width="2.5" stroke-linecap="round" opacity="0.7" filter="url(#gSoft_hz)"></line><polygon points="149,105 140,98.5 140,111.5" fill="#f7c948" opacity="0.85"></polygon><rect x="83" y="38.6" width="34" height="16" rx="6.1" fill="#1e2840" stroke="#f7c948" stroke-width="1.8" opacity="0.95"></rect><rect x="92" y="34" width="16" height="11" rx="4.4" fill="#1e2840" stroke="#f7c948" stroke-width="1.5" opacity="0.9"></rect></g><line x1="92" y1="18" x2="92" y2="62" stroke="#2a3a58" stroke-width="1"></line><text x="106" y="46" font-family="Space Grotesk, system-ui, sans-serif" font-weight="300" font-size="28" letter-spacing="11" fill="#dde2ee">NYX</text><text x="108" y="60" font-family="Space Grotesk, system-ui, sans-serif" font-weight="400" font-size="8" letter-spacing="5.5" fill="#f7c948" opacity="0.55">LIGHTWORK</text></svg>`;

  const NYX_LOGO_PRIMARY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" style="height:22mm;width:auto;display:block;"><rect width="200" height="280" fill="#0b0d14"></rect><defs><filter id="gBolt_prim" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><filter id="gSoft_prim" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><radialGradient id="hexGrad_prim" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#f7c948" stop-opacity="0.09"></stop><stop offset="100%" stop-color="#f7c948" stop-opacity="0"></stop></radialGradient><linearGradient id="waveGrad_prim" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f7c948" stop-opacity="0"></stop><stop offset="18%" stop-color="#f7c948" stop-opacity="0.7"></stop><stop offset="55%" stop-color="#f7c948" stop-opacity="1"></stop><stop offset="85%" stop-color="#f7c948" stop-opacity="0.6"></stop><stop offset="100%" stop-color="#f7c948" stop-opacity="0.1"></stop></linearGradient><clipPath id="cbClip_prim"><rect x="51" y="49" width="98" height="112" rx="5"></rect></clipPath></defs><path d="M188,100 L144,176.21 L56,176.21 L12,100 L56,23.79 L144,23.79 Z" fill="url(#hexGrad_prim)"></path><path d="M188,100 L144,176.21 L56,176.21 L12,100 L56,23.79 L144,23.79 Z" fill="none" stroke="#dde2ee" stroke-width="1.8" opacity="0.2"></path><path d="M180,100 L140,169.28 L60,169.28 L20,100 L60,30.72 L140,30.72 Z" fill="none" stroke="#f7c948" stroke-width="0.6" opacity="0.1"></path><rect x="51" y="49" width="98" height="112" rx="5" fill="#1e2840" stroke="#dde2ee" stroke-width="1.6" opacity="0.9"></rect><g clip-path="url(#cbClip_prim)"><line x1="61" y1="71" x2="139" y2="71" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="86.6" x2="139" y2="86.6" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="117.8" x2="139" y2="117.8" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="133.4" x2="139" y2="133.4" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line><line x1="61" y1="149" x2="139" y2="149" stroke="#dde2ee" stroke-width="0.7" opacity="0.1"></line></g><line x1="58" y1="105" x2="151" y2="105" stroke="#dde2ee" stroke-width="0.8" stroke-dasharray="3 4" opacity="0.15" clip-path="url(#cbClip_prim)"></line><path d="M60,105 L60.62,103.24 L61.24,101.5 L61.87,99.81 L62.49,98.19 L63.11,96.67 L63.73,95.26 L64.36,93.99 L64.98,92.86 L65.6,91.91 L66.22,91.14 L66.85,90.56 L67.47,90.18 L68.09,90.01 L68.72,90.05 L69.34,90.29 L69.96,90.73 L70.58,91.38 L71.2,92.21 L71.83,93.22 L72.45,94.39 L73.07,95.71 L73.69,97.16 L74.32,98.72 L74.94,100.36 L75.56,102.07 L76.19,103.82 L76.81,105.59 L77.43,107.35 L78.05,109.07 L78.67,110.74 L79.3,112.33 L79.92,113.82 L80.54,115.18 L81.16,116.41 L81.79,117.47 L82.41,118.37 L83.03,119.07 L83.66,119.59 L84.28,119.9 L84.9,120 L85.52,119.9 L86.14,119.59 L86.77,119.07 L87.39,118.37 L88.01,117.47 L88.63,116.41 L89.26,115.18 L89.88,113.82 L90.5,112.33 L91.13,110.74 L91.75,109.07 L92.37,107.35 L92.99,105.59 L93.62,103.82 L94.24,102.07 L94.86,100.36 L95.48,98.72 L96.1,97.16 L96.73,95.71 L97.35,94.39 L97.97,93.22 L98.59,92.21 L99.22,91.38 L99.84,90.73 L100.46,90.29 L101.08,90.05 L101.71,90.01 L102.33,90.18 L102.95,90.56 L103.57,91.14 L104.2,91.91 L104.82,92.86 L105.44,93.99 L106.06,95.26 L106.69,96.67 L107.31,98.19 L107.93,99.81 L108.55,101.5 L109.18,103.24 L109.8,105" stroke="url(#waveGrad_prim)" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#gBolt_prim)"></path><path d="M60,105 L60.62,103.24 L61.24,101.5 L61.87,99.81 L62.49,98.19 L63.11,96.67 L63.73,95.26 L64.36,93.99 L64.98,92.86 L65.6,91.91 L66.22,91.14 L66.85,90.56 L67.47,90.18 L68.09,90.01 L68.72,90.05 L69.34,90.29 L69.96,90.73 L70.58,91.38 L71.2,92.21 L71.83,93.22 L72.45,94.39 L73.07,95.71 L73.69,97.16 L74.32,98.72 L74.94,100.36 L75.56,102.07 L76.19,103.82 L76.81,105.59 L77.43,107.35 L78.05,109.07 L78.67,110.74 L79.3,112.33 L79.92,113.82 L80.54,115.18 L81.16,116.41 L81.79,117.47 L82.41,118.37 L83.03,119.07 L83.66,119.59 L84.28,119.9 L84.9,120 L85.52,119.9 L86.14,119.59 L86.77,119.07 L87.39,118.37 L88.01,117.47 L88.63,116.41 L89.26,115.18 L89.88,113.82 L90.5,112.33 L91.13,110.74 L91.75,109.07 L92.37,107.35 L92.99,105.59 L93.62,103.82 L94.24,102.07 L94.86,100.36 L95.48,98.72 L96.1,97.16 L96.73,95.71 L97.35,94.39 L97.97,93.22 L98.59,92.21 L99.22,91.38 L99.84,90.73 L100.46,90.29 L101.08,90.05 L101.71,90.01 L102.33,90.18 L102.95,90.56 L103.57,91.14 L104.2,91.91 L104.82,92.86 L105.44,93.99 L106.06,95.26 L106.69,96.67 L107.31,98.19 L107.93,99.81 L108.55,101.5 L109.18,103.24 L109.8,105" stroke="#f7c948" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.75"></path><circle cx="110.8" cy="105" r="15" fill="#f7c948" opacity="0.08" filter="url(#gBolt_prim)"></circle><circle cx="110.8" cy="105" r="11" fill="#f7c948" opacity="0.18" filter="url(#gBolt_prim)"></circle><circle cx="110.8" cy="105" r="8" fill="#f7c948" opacity="0.35" filter="url(#gSoft_prim)"></circle><circle cx="110.8" cy="105" r="6" fill="#f7c948"></circle><line x1="117.8" y1="105" x2="140" y2="105" stroke="#f7c948" stroke-width="2.5" stroke-linecap="round" opacity="0.7" filter="url(#gSoft_prim)"></line><polygon points="149,105 140,98.5 140,111.5" fill="#f7c948" opacity="0.85"></polygon><rect x="83" y="38.6" width="34" height="16" rx="6.1" fill="#1e2840" stroke="#f7c948" stroke-width="1.8" opacity="0.95"></rect><rect x="92" y="34" width="16" height="11" rx="4.4" fill="#1e2840" stroke="#f7c948" stroke-width="1.5" opacity="0.9"></rect><text x="100" y="236" text-anchor="middle" font-family="Space Grotesk, system-ui, sans-serif" font-weight="300" font-size="34" letter-spacing="14" fill="#dde2ee">NYX</text><text x="104" y="256" text-anchor="middle" font-family="Space Grotesk, system-ui, sans-serif" font-weight="400" font-size="9" letter-spacing="7" fill="#f7c948" opacity="0.55">LIGHTWORK</text></svg>`;

  const lbBooking = logos.booking ? `<img src="${logos.booking}" style="max-height:14mm;max-width:40mm;object-fit:contain;">` : '';
  const lbBand    = logos.band    ? `<img src="${logos.band}"    style="max-height:14mm;max-width:40mm;object-fit:contain;">` : '';
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
            rows += `<tr>
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
    tableBodies += `<tbody style="page-break-inside:avoid"><tr class="pos-hdr"><td colspan="${cols}">${esc(pos.name)}</td></tr></tbody>`;
    tableBodies += renderPosSections(pos);
  });

  if(onlyMissing && itemCount === 0){ toast('Keine fehlenden Positionen gefunden.', true); return; }

  const diffHeader = showDiff ? '<th>DIFF</th>' : '';
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${projectName}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
body{font-family:'Geist',sans-serif;font-size:9pt;color:#0b0d14;background:#fff;}
.band{background:#0b0d14;height:14mm;display:flex;align-items:center;justify-content:space-between;padding:0 10mm;}
.band-logo{display:flex;align-items:center;}.band-logo svg{height:10mm;width:auto;}
.band-tag{font-family:'JetBrains Mono',monospace;font-size:8.5pt;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9AA3B5;}
.ph{display:grid;grid-template-columns:1fr auto;align-items:start;padding:8mm 10mm 6mm;border-bottom:2px solid #0b0d14;gap:12px;}
.pt{font-family:'Geist',sans-serif;font-size:26pt;font-weight:600;letter-spacing:-0.018em;color:#0b0d14;line-height:1.1;}
.ps{font-family:'JetBrains Mono',monospace;font-size:8.5pt;font-weight:400;letter-spacing:0.04em;color:#5A6678;margin-top:4px;}
.ph-logos{display:flex;align-items:center;gap:10px;justify-content:flex-end;}
.stat-strip{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid #D6D9DE;border-bottom:2px solid #0b0d14;padding:6mm 10mm;}
.stat{text-align:center;}
.stat-val{display:block;font-family:'Geist',sans-serif;font-size:18pt;font-weight:600;letter-spacing:-0.015em;font-variant-numeric:tabular-nums;color:#0b0d14;}
.stat-lbl{display:block;font-family:'JetBrains Mono',monospace;font-size:8pt;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:#5A6678;margin-top:3px;}
.tw{padding:0 10mm;}
table{width:100%;border-collapse:collapse;}
thead th{background:#0b0d14;color:#dde2ee;padding:5px 8px;text-align:left;font-family:'Geist',sans-serif;font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;border:none;}
thead th:nth-child(n+3){text-align:center;}
.grp-hdr td{background:#1a1f2e;color:#f7c948;font-family:'Geist',sans-serif;font-size:10pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:6px 8px 6px 14px;border-top:2px solid #0b0d14;border-left:4px solid #f7c948;}
.sec-hdr td{background:#F8F6F0;color:#3a3a4a;font-family:'Geist',sans-serif;font-size:8.5pt;font-weight:600;letter-spacing:0.06em;padding:4px 8px 4px 14px;border-top:1px solid #D6D9DE;border-left:3px solid #D6D9DE;}
.pos-hdr td{background:#0b0d14;color:#dde2ee;font-family:'Geist',sans-serif;font-size:22pt;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:12px 8px;text-align:center;border:none;}
tbody.cat-group{page-break-inside:avoid;}
tbody tr{border-bottom:1px solid #D6D9DE;}
.ntd{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9pt;font-variant-numeric:tabular-nums;width:100%;}
.ntd2{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9pt;font-variant-numeric:tabular-nums;text-align:center;white-space:nowrap;width:1%;}
.ltd{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9pt;color:#5A6678;white-space:nowrap;width:1%;}
.ktd{padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:8.5pt;color:#5A6678;white-space:nowrap;width:1%;}
.closing-page{page-break-before:always;}
.closing-flex{height:281mm;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;}
.closing-footer{background:#0b0d14;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:8mm 10mm;gap:10mm;}
.cf-left,.cf-right{color:#dde2ee;}
.cf-center{display:flex;justify-content:center;align-items:center;}
.cf-right{text-align:right;}
.cf-label{font-family:'JetBrains Mono',monospace;font-size:8pt;letter-spacing:0.22em;text-transform:uppercase;color:#9AA3B5;}
.cf-val{font-family:'Geist',sans-serif;font-size:10pt;font-weight:500;color:#dde2ee;margin-top:1px;}
.cf-name{font-family:'Geist',sans-serif;font-size:16pt;font-weight:600;color:#dde2ee;letter-spacing:-0.018em;}
.cf-stats-sm{font-family:'JetBrains Mono',monospace;font-size:9pt;color:#9AA3B5;font-variant-numeric:tabular-nums;}
.cf-final::before{content:"ABSCHLUSS";font-family:'JetBrains Mono',monospace;font-size:8pt;letter-spacing:0.14em;text-transform:uppercase;color:#9AA3B5;}
.slim-footer{background:#0b0d14;height:9mm;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;padding:0 10mm;margin-top:0;}
.slim-footer span{font-family:'JetBrains Mono',monospace;font-size:8pt;letter-spacing:0.14em;text-transform:uppercase;color:#9AA3B5;}
.slim-footer span:nth-child(2){text-align:center;}
.slim-footer span:nth-child(3){text-align:right;}
.cf-center svg{height:22mm!important;width:auto!important;}
.np{margin:16px 10mm;padding:12px 16px;background:#fffbeb;border:1.5px solid #f59e0b;border-left:4px solid #d97706;font-size:9pt;color:#78350f;border-radius:3px;font-family:'JetBrains Mono',monospace;line-height:1.6;}
.outer{width:100%;border-collapse:collapse;}
.outer-td{padding:0;vertical-align:top;}
@media print{
  .np{display:none!important;}
  @page{size:A4 ${orient};margin:8mm 0 8mm 0;}
}
</style></head><body>
<table class="outer"><colgroup><col></colgroup>
<thead><tr><td class="outer-td" style="padding:0;"><div class="band">
  <div class="band-logo">${NYX_LOGO_HZ}</div>
  <div class="band-tag">${esc(projectName)} &middot; Material Planer</div>
</div></td></tr></thead>
<tfoot><tr><td class="outer-td" style="padding:0;">
  <div class="slim-footer">
    <span>NYX LIGHTWORK</span>
    <span>${esc(projectName)} &ndash; MATERIAL PLANER</span>
    <span>${projectDate}</span>
  </div>
</td></tr></tfoot>
<tbody><tr><td class="outer-td">
<div class="ph">
  <div>
    <div class="pt">${esc(projectName)}</div>
    <div class="ps">Material Planer &middot; Touring Production &middot; ${projectDate} &middot; ◆ v0.5.9.30</div>
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
  <thead><tr><th>Bezeichnung</th><th>L&auml;nge/Typ</th><th>#&nbsp;Stk.</th><th>Spare</th><th>Gesamt</th><th>Im&nbsp;Proj.</th>${diffHeader}<th>Kapitel</th></tr></thead>
  ${tableBodies}
</table>
</div>
</td></tr></tbody></table>
<div class="closing-page">
<div class="closing-flex">
<div class="closing-footer">
  <div class="cf-left">
    <div class="cf-stats-sm">${itemCount}&nbsp;Items &middot; ${selPos.length}&nbsp;Positionen</div>
    <div class="cf-stats-sm">${missingCount}&nbsp;Fehlend</div>
    <div class="cf-label" style="margin-top:8px;">Version</div>
    <div class="cf-val">◆ v0.5.9.30</div>
    <div class="cf-label" style="margin-top:4px;">Datum</div>
    <div class="cf-val">${projectDate}</div>
  </div>
  <div class="cf-center">${NYX_LOGO_PRIMARY}</div>
  <div class="cf-right">
    <div class="cf-name">${esc(projectName)}</div>
    <div class="cf-val" style="margin-top:6px;">${projectDate}</div>
    <div class="cf-val">Material Planer</div>
    <div class="cf-final" style="margin-top:4px;"></div>
  </div>
</div>
</div>
</div>
<div class="np"><strong>Cmd+P / Strg+P</strong> &rarr; Als PDF speichern &nbsp;&nbsp; <strong>&#9888; Chrome-Tipp:</strong> Druckdialog &rarr; &ldquo;Weitere Einstellungen&rdquo; &rarr; Haken bei <strong>&ldquo;Kopf- und Fu&szlig;zeilen&rdquo;</strong> entfernen &mdash; sonst erscheinen Chromes Datum + &ldquo;about:blank&rdquo; &uuml;ber/unter unseren Balken.</div>
<script>window.onload=()=>{if(document.fonts&&document.fonts.ready){document.fonts.ready.then(()=>setTimeout(()=>window.print(),150));}else{setTimeout(()=>window.print(),800);}};<\/script>
</body></html>`;

  const win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
}
