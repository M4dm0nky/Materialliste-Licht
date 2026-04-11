// ══════════════════════════════════════════════════
// LOGOS — Upload, Anzeige, Persistenz
// ══════════════════════════════════════════════════
const LOGOS_KEY = 'materialliste-logos';
let logos = {planer:'', band:'', booking:''};

function handleLogoUpload(type, input){
  const file = input.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = e => {
    logos[type] = e.target.result;
    applyLogoToHeader(type);
    updateLogoPreviews();
    saveLogosGlobal();
    toast('✓ ' + type + '-Logo gesetzt');
  };
  r.readAsDataURL(file);
  input.value = '';
}

function removeLogo(type){
  logos[type] = '';
  applyLogoToHeader(type);
  updateLogoPreviews();
  saveLogosGlobal();
  toast(type + '-Logo entfernt');
}

function applyLogoToHeader(type){
  if(type === 'planer'){
    const area = document.getElementById('areaPlaner'); if(!area) return;
    area.innerHTML = '';
    if(logos.planer){ const img=document.createElement('img'); img.src=logos.planer; img.className='logo-planer'; area.appendChild(img); }
  } else if(type === 'booking'){
    const area = document.getElementById('areaBooking'); if(!area) return;
    area.innerHTML = '';
    if(logos.booking){ const img=document.createElement('img'); img.src=logos.booking; img.className='logo-booking'; area.appendChild(img); }
  } else if(type === 'band'){
    const area = document.getElementById('areaBand'); if(!area) return;
    const existing = area.querySelector('.logo-band'); if(existing) existing.remove();
    if(logos.band){ const img=document.createElement('img'); img.src=logos.band; img.className='logo-band'; area.insertBefore(img, area.firstChild); }
  }
}

function applyAllLogos(){ ['planer','booking','band'].forEach(t => applyLogoToHeader(t)); }

function updateLogoPreviews(){
  ['band','booking','planer'].forEach(type => {
    const key  = type.charAt(0).toUpperCase() + type.slice(1);
    const prev = document.getElementById('prev'+key);
    const rm   = document.getElementById('rm'+key);
    if(!prev) return;
    if(logos[type]){ prev.src=logos[type]; prev.style.display='block'; rm.style.display='block'; }
    else { prev.src=''; prev.style.display='none'; rm.style.display='none'; }
  });
}

function saveLogosGlobal(){
  try{ localStorage.setItem(LOGOS_KEY, JSON.stringify(logos)); }catch(e){}
}

function loadLogosGlobal(){
  try{
    const r = localStorage.getItem(LOGOS_KEY);
    if(r){ const l=JSON.parse(r); logos.planer=l.planer||''; logos.band=l.band||''; logos.booking=l.booking||''; applyAllLogos(); }
  }catch(e){}
}

function openLogosModal(){
  updateLogoPreviews();
  document.getElementById('logoModal').classList.add('open');
}

function closeModal(id){ document.getElementById(id).classList.remove('open'); }

// ── SIDEBAR TOGGLE ─────────────────────────────────────────────────
function toggleSidebar(){
  const sb     = document.getElementById('appSidebar');
  const layout = document.getElementById('appLayout');
  const btn    = document.getElementById('btnSidebar');
  const vis    = sb.style.display !== 'none';
  sb.style.display               = vis ? 'none' : '';
  layout.style.gridTemplateColumns = vis ? '1fr' : '220px 1fr';
  btn.textContent                = vis ? '▶ Einblenden' : '◀ Ausblenden';
  let fab = document.getElementById('fabSidebar');
  if(!fab){
    fab = document.createElement('button');
    fab.id        = 'fabSidebar';
    fab.className = 'fab-sidebar';
    fab.innerHTML = '▶ Menü';
    fab.onclick   = toggleSidebar;
    document.body.appendChild(fab);
  }
  fab.style.display = vis ? 'flex' : 'none';
}
