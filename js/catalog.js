// ══════════════════════════════════════════════════
// KATALOG — vollständige Datenbank
// ══════════════════════════════════════════════════
const CATALOG = {
  "DMX 5-Pin":{cat:"Kabel Liste",items:[
    {n:"5-Pin DMX",l:"1,5m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"7m"},
    {n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},
    {n:"",l:"30m"},{n:"",l:"40m"},{n:"",l:"50m Trommel"},{n:"",l:"100m Trommel"}
  ]},
  "DMX 3-Pin":{cat:"Kabel Liste",items:[
    {n:"3-Pin DMX",l:"1,5m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"9m"},
    {n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},
    {n:"",l:"30m"},{n:"",l:"40m"},{n:"",l:"50m Trommel"},{n:"",l:"100m Trommel"}
  ]},
  "DMX 4er Baum 5-Pin":{cat:"Kabel Liste",items:[
    {n:"4er Baum 5-Pin",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},{n:"",l:"15m"},
    {n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"30m"},{n:"",l:"40m"},
    {n:"",l:"50m"},{n:"",l:"100m"}
  ]},
  "DMX LK37":{cat:"Kabel Liste",items:[
    {n:"LK37",l:"5m"},{n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},
    {n:"",l:"30m"},{n:"",l:"40m"},{n:"",l:"50m"},{n:"",l:"70m"},{n:"",l:"100m"},
    {n:"LK37 M → 12x DMX F",l:""},{n:"LK37 F → 12x DMX M",l:""}
  ]},
  "DMX Adapter":{cat:"Kabel Liste",items:[
    {n:"Cat → 4x DMX M",l:""},{n:"Cat → 4x DMX F",l:""},
    {n:"DMX 3pol M → DMX 5pol F",l:""},{n:"DMX 3pol F → DMX 5pol M",l:""}
  ]},
  "Netzwerk LWL Glasfaser":{cat:"Kabel Liste",items:[
    {n:"LWL 4er MultiMode SC",l:"Patchkabel 1m"},{n:"",l:"3m"},{n:"",l:"5m"},
    {n:"",l:"10m"},{n:"",l:"20m"},{n:"",l:"50m"},{n:"",l:"100m"},
    {n:"",l:"150m"},{n:"",l:"300m"},{n:"",l:"500m"},
    {n:"LWL Verbinder SC–SC",l:""},{n:"LWL Adapter LC→SC",l:""},{n:"LWL Reinigungset",l:""}
  ]},
  "Netzwerk Cat 6/7 RJ45":{cat:"Kabel Liste",items:[
    {n:"Cat 6/7 RJ45",l:"Patchkabel 1m"},{n:"",l:"3m"},{n:"",l:"5m"},
    {n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},
    {n:"",l:"50m Trommel"},{n:"",l:"100m Trommel"},{n:"Cat 6/7 RJ45 Verbinder",l:""}
  ]},
  "Netzwerk Ethercon":{cat:"Kabel Liste",items:[
    {n:"Ethercon Cat 6/7",l:"5m"},{n:"",l:"10m"},{n:"",l:"20m"},{n:"",l:"30m"},
    {n:"",l:"50m Trommel"},{n:"",l:"90m Trommel"},{n:"",l:"100m Trommel"},
    {n:"Ethercon Verbinder",l:""}
  ]},
  "Stromkabel Han16":{cat:"Kabel Liste",items:[
    {n:'Han16 2,5"',l:"1m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"30m"},
    {n:"",l:"40m"},{n:"",l:"50m"},
    {n:"Han16 M → 6x Schuko",l:""},{n:"Han16 M → 6x Schuko + Han F",l:""},
    {n:"6x Schuko M → Han F",l:""},{n:"Han16 Y-Verbinder",l:""},{n:"Han16 Verbinder",l:""}
  ]},
  "Stromkabel Han6 5kW":{cat:"Kabel Liste",items:[
    {n:"Han6 5KW",l:"1m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"30m"},
    {n:"",l:"40m"},{n:"",l:"50m"},
    {n:"Han8 5KW → 3x CEE32 F",l:""},{n:"3x CEE32 M → Han8 5KW",l:""}
  ]},
  "Stromkabel Socapex":{cat:"Kabel Liste",items:[
    {n:'Socapex 2,5"',l:"1m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"30m"},
    {n:"",l:"40m"},{n:"",l:"50m"},
    {n:"Soca M → 6x Schuko",l:""},{n:"Soca M → 6x Schuko + Soca F",l:""},
    {n:"6x Schuko M → Soca F",l:""},{n:"Soca M → Varilite Smart Repeater",l:""},
    {n:"Socapex M → Harting F",l:""},{n:"Socapex F → Harting M",l:""}
  ]},
  "Stromkabel Schuko":{cat:"Kabel Liste",items:[
    {n:"Schuko",l:"1,5m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},
    {n:"3er Verteiler",l:""},{n:"6er Verteiler",l:""}
  ]},
  "Stromkabel VL5":{cat:"Kabel Liste",items:[
    {n:"VL5 Verbindungskabel",l:"1,5m"},{n:"",l:"3m"},{n:"",l:"5m"},
    {n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"}
  ]},
  "CEE 16A Blau":{cat:"Kabel Liste",items:[
    {n:"CEE 16A Blau",l:"1,5m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"50m"},
    {n:"CEE16 → Schuko F",l:""},{n:"Schuko M → CEE16",l:""}
  ]},
  "CEE 32A Blau":{cat:"Kabel Liste",items:[
    {n:"CEE 32A Blau",l:"1,5m"},{n:"",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"15m"},{n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"50m"},
    {n:"CEE16 → CEE32 Blau",l:""},{n:"CEE32 Blau → 3x CEE32 Blau",l:""}
  ]},
  "CEE 16A Rot":{cat:"Kabel Liste",items:[
    {n:"CEE 16A Rot",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},{n:"",l:"15m"},
    {n:"",l:"20m"},{n:"",l:"25m"},{n:"",l:"50m"},
    {n:"CEE16A Rot → 3x Schuko F",l:""},{n:"CEE16A Rot → 6x Schuko F",l:""}
  ]},
  "CEE 32A Rot":{cat:"Kabel Liste",items:[
    {n:"CEE 32A Rot",l:"5m"},{n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},
    {n:"",l:"40m"},{n:"",l:"50m"},{n:"",l:"100m"},
    {n:"VT 32A → 32A+2x16A+3x Schuko",l:""},{n:"32A → 3x 32A CEE",l:""}
  ]},
  "CEE 63A Rot":{cat:"Kabel Liste",items:[
    {n:"CEE 63A Rot",l:"5m"},{n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},
    {n:"",l:"40m"},{n:"",l:"50m"},{n:"",l:"100m"},
    {n:"VT 63A → 63A+2x32A+2x16A+3xSchuko",l:""},{n:"32A → 63A Adapter",l:""},
    {n:"VT 63A → 2x 63A",l:""}
  ]},
  "CEE 125A Rot":{cat:"Kabel Liste",items:[
    {n:"CEE 125A Rot",l:"5m"},{n:"",l:"10m"},{n:"",l:"15m"},{n:"",l:"20m"},
    {n:"",l:"40m"},{n:"",l:"50m"},{n:"",l:"100m"},
    {n:"VT 125A → 2x63A+2x32A+2x16A+3xSchuko",l:""},{n:"63A → 125A Adapter",l:""},
    {n:"VT 125A → 2x 63A",l:""}
  ]},
  "Erdungskabel":{cat:"Kabel Liste",items:[
    {n:"Erdungskabel mit Öse",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"20m"},{n:"",l:"30m"},{n:"Erdungskabel Set groß",l:""},
    {n:"Erdungskabel Connex",l:"3m"},{n:"",l:"5m"},{n:"",l:"10m"},
    {n:"",l:"20m"},{n:"",l:"30m"},{n:"Erdungskabel Set Connex",l:""}
  ]},
  "Alurohr & Schellen":{cat:"Zubehör Liste",items:[
    {n:"Alurohr schwarz",l:"1m"},{n:"",l:"1,5m"},{n:"",l:"2m"},{n:"",l:"3m"},
    {n:"",l:"4m"},{n:"",l:"5m"},{n:"",l:"6m"},
    {n:"Gelenkschelle schwarz",l:""},{n:"Starre Schelle schwarz",l:""},
    {n:"Halbschelle + Ring schwarz",l:""},
    {n:"Alurohr silber",l:"1m"},{n:"",l:"1,5m"},{n:"",l:"2m"},{n:"",l:"3m"},
    {n:"",l:"4m"},{n:"",l:"5m"},{n:"",l:"6m"},
    {n:"Gelenkschelle silber",l:""},{n:"Starre Schelle silber",l:""},
    {n:"Halbschelle + Ring silber",l:""}
  ]},
  "Drop Arms & Verlängerungen":{cat:"Zubehör Liste",items:[
    {n:"Drop Arm Moving Light schwarz",l:"1m"},{n:"",l:"1,5m"},{n:"",l:"2m"},{n:"",l:"3m"},
    {n:"Drop Arm TV-Zapfen Verlängerung",l:"45–65cm"},{n:"",l:"0,5–1m"},
    {n:"",l:"1,2–2m"},{n:"",l:"1,8–3m"}
  ]},
  "Licht Stative":{cat:"Zubehör Liste",items:[
    {n:"Stahlstativ U126",l:""},{n:"Kurbelstativ",l:""},{n:"Genie",l:""},
    {n:"FD31",l:""},{n:"FD31 Stahlplatte",l:""},{n:"Truss FD34 Schwarz",l:""},
    {n:"Truss Husse Schwarz",l:""},{n:"Stahlplatte 60×60cm Truss 80kg",l:""},
    {n:"Holzverblendung 60×60cm",l:""},{n:"Stahlgewichte 25kg",l:""},
    {n:"Konus → Halbschelle",l:""},{n:"Konus → mini TV-Zapfen",l:""},
    {n:"Truss Koffer",l:""},{n:"Bodenstativ 3-Bein klein",l:""},
    {n:"Bodenstativ 3-Bein mittel",l:""},{n:"Bodenstativ 3-Bein groß",l:""},
    {n:"Bodenstativ Holz + Schraube",l:""},{n:"Bodenstativ Holz + mini TV-Zapfen",l:""}
  ]},
  "Stahlzeug & Sicherung":{cat:"Zubehör Liste",items:[
    {n:"Stahlseil / Safety",l:"30kg 1m"},{n:"",l:"60kg 1m"},
    {n:"",l:"10m Slider 125kg"},{n:"",l:"10m Slider 500kg"},
    {n:"Rundschlinge",l:"1m"},{n:"",l:"1,5m"},{n:"",l:"2m"},
    {n:"Steelflex",l:"1m"},{n:"",l:"1,5m"},{n:"",l:"2m"},
    {n:"Omegaschäkel 1t",l:""},{n:"Omegaschäkel 2t",l:""},{n:"Omegaschäkel 3,25t",l:""},
    {n:"Zurgurt klein",l:"5m"},{n:"Zurgurt mittel",l:"5m"},{n:"Zurgurt groß",l:"5m"},
    {n:"Magic Arm",l:""},{n:"P5 Klemmen mit Bolzen",l:""}
  ]},
  "Verbrauchsmaterial":{cat:"Zubehör Liste",items:[
    {n:"PVC Schwarz",l:""},{n:"PVC Grau",l:""},{n:"Gaffa schwarz",l:""},
    {n:"Gaffa silber",l:""},{n:"Gaffa weiss",l:""},
    {n:"Kabelbinder schwarz dick",l:""},{n:"Kabelbinder schwarz normal",l:""},
    {n:"Kabelbinder weiss dick",l:""},{n:"Kabelbinder weiss normal",l:""},
    {n:"Absperrband Rot/Weiss",l:""},{n:"Markierungstape Rot/Weiss",l:""},
    {n:"Markierungstape gelb/schwarz",l:""},{n:"Beschriftungstape orange",l:""},
    {n:"Beschriftungstape gelb",l:""},{n:"Beschriftungstape pink",l:""},
    {n:"Beschriftungstape grün",l:""},{n:"Dekomolton 1lfm",l:"3m breit"}
  ]},
  "System & Sonderzubehör":{cat:"Zubehör Liste",items:[
    {n:"Notenpultlampen",l:""},{n:"Handdimmer",l:""},{n:"Baufluter 500W",l:""},
    {n:"mini At10",l:""},{n:"Patchkabel → Schuko F",l:""},{n:"Schuko M → Patchkabel",l:""},
    {n:"Ersatzbrenner Kiste",l:""},{n:"Nebelfluid Fog",l:"5l"},
    {n:"Nebelfluid Tour Haze",l:"5l"},{n:"Nebelfluid MDG",l:"5l"},
    {n:"CO2 Flasche",l:"20kg"},{n:"Trichter",l:""},{n:"Ventilator",l:""}
  ]},
  "Büro & Office":{cat:"Zubehör Liste",items:[
    {n:"Podest 2×1m",l:""},{n:"Podest Fuß 60cm",l:""},{n:"Podest Fuß 20cm Rolle",l:""},
    {n:"Drucker Brother A3",l:""},{n:"Monitor 24 Zoll",l:""},
    {n:"Erste-Hilfe Case",l:""},{n:"Feuerlöscher Case",l:""},
    {n:"Kaffeemaschinen Case",l:""},{n:"Bürostuhl",l:""}
  ]},
  "Farbfolien LEE":{cat:"Zubehör Liste",items:
    Array.from({length:17},()=>({n:"LEE",l:"Rolle/Geschnitten"}))
  },
  "Dimmer & Feststrom VT":{cat:"Hardware Liste",items:[
    {n:"Handdimmer 2kW",l:"Schuko"},
    {n:"6-Kanal Dimmer → 6x Schuko",l:"16A CEE"},
    {n:"12-Kanal Dimmer MA → 2x Han",l:"32A CEE"},
    {n:"24-Kanal Dimmer MA → Han",l:"63A/125A CEE",b:"mit Hotpatch / 2x Han Input"},
    {n:"36-Kanal Dimmer MA → Han",l:"125A CEE",b:"mit Hotpatch / 2x Han Input"},
    {n:"12-Kanal VT → 2x Han",l:"32A CEE"},
    {n:"12-Kanal VT → 2x Han Y Single FI",l:"32A CEE"},
    {n:"18-Kanal VT → 3x Han",l:"63A CEE"},
    {n:"36-Kanal VT → Han",l:"63A CEE",b:"Hotpatch"},
    {n:"48-Kanal VT → Han",l:"125A CEE",b:"Hotpatch / 4x Han Input"},
    {n:"USV 1000W",l:"Schuko"},{n:"USV 1500W",l:"Schuko"}
  ]},
  "DMX Steuerung & Netzwerk":{cat:"Hardware Liste",items:[
    {n:"GrandMA2 Full",l:""},{n:"GrandMA2 Light",l:""},{n:"GrandMA2 ONPC Set",l:""},
    {n:"GrandMA2 NPU",l:"",b:"mit USV und SG300"},
    {n:"GrandMA2 4-Port Node",l:""},{n:"GrandMA2 8-Port Node",l:""},
    {n:"Cisco SG300 Switch (LWL SC Ports)",l:""},
    {n:"DMX Switch Single",l:"Swisson"},{n:"2x DMX Switch",l:"Swisson"},
    {n:"4x DMX Switch",l:"Swisson"},
    {n:"Adapterkoffer Cat → DMX (Swisson 4er Rack)",l:""}
  ]}
};

const CAT_ORDER = ["Kabel Liste","Zubehör Liste","Hardware Liste","Lampen Liste"];
const STORAGE_KEY  = 'materialliste-licht-v1';
const CATALOG_KEY  = 'materialliste-licht-catalog-v1';
const CATALOGS_KEY = 'materialliste-licht-catalogs-v1';

let catalogsStore = null;
let activeCatalogId = null;

// ── CATALOG STORE ──────────────────────────────────────────────────
function genCatalogId(){ return 'cat-'+Date.now().toString(36); }

function saveCatalogsStore(){
  try{ localStorage.setItem(CATALOGS_KEY, JSON.stringify(catalogsStore)); }catch(e){}
}

function getActiveCatalog(){
  if(!catalogsStore) return {id:'fallback',name:'Standard-Katalog',isBuiltin:true,types:CATALOG};
  return catalogsStore.catalogs.find(c=>c.id===activeCatalogId)||catalogsStore.catalogs[0];
}

function getActiveCatalogTypes(){ return getActiveCatalog().types; }

function renderActiveCatalogBadge(){
  const el = document.getElementById('activeCatalogBadge');
  if(el) el.textContent = getActiveCatalog().name;
}

function setActivePlanCatalog(planId, catalogId){
  const plans = getPlansIndex();
  const plan  = plans.find(p=>p.id===planId);
  if(plan){ plan.catalogId=catalogId; savePlansIndex(plans); }
  activeCatalogId = catalogId||'cat-default';
  renderActiveCatalogBadge();
}

function initCatalogs(){
  try{
    const raw = localStorage.getItem(CATALOGS_KEY);
    if(raw){
      catalogsStore = JSON.parse(raw);
      // Migration: groups-Array für ältere Kataloge ergänzen
      let migrated = false;
      catalogsStore.catalogs.forEach(c=>{ if(!c.groups){ c.groups=[]; migrated=true; } });
      if(migrated) saveCatalogsStore();
      // Migration: unit_type für alle Typen setzen falls noch nicht vorhanden
      let utMigrated = false;
      catalogsStore.catalogs.forEach(c=>{
        Object.values(c.types||{}).forEach(t=>{
          if(t.unit_type===undefined){ t.unit_type=_detectUnitType(t); utMigrated=true; }
        });
      });
      if(utMigrated) saveCatalogsStore();
      activeCatalogId = 'cat-default';
      return;
    }
  }catch(e){}
  // Erster Start: Standard-Katalog aus CATALOG-Konstante + alten Custom-Entries aufbauen
  const types = {};
  Object.entries(CATALOG).forEach(([key,val])=>{
    types[key] = {cat:val.cat,items:val.items.map(it=>({...it})),unit_type:_detectUnitType(val)};
  });
  try{
    const cc = localStorage.getItem(CATALOG_KEY);
    if(cc){
      const custom = JSON.parse(cc);
      Object.entries(custom).forEach(([key,items])=>{
        if(types[key]) types[key].items.push(...items.map(it=>({...it})));
        else types[key] = {cat:'Kabel Liste',items:items.map(it=>({...it})),unit_type:_detectUnitType({items})};
      });
    }
  }catch(e){}
  catalogsStore = {version:1,catalogs:[{
    id:'cat-default',
    name:'Standard-Katalog',
    isBuiltin:true,
    created:new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}),
    groups:[],
    types
  }]};
  saveCatalogsStore();
  activeCatalogId = 'cat-default';
}

// ── UNIT-TYPE HELPER ───────────────────────────────────────────────
function _detectUnitType(t){
  if(!t||!t.items||t.items.length===0) return 'qty';
  return t.items.some(i=>i.l&&i.l.trim()!=='') ? 'lengths' : 'qty';
}

// ── GRUPPEN-HELPERS ────────────────────────────────────────────────
function catGetTopGroups(cat){ return (cat.groups||[]).filter(g=>!g.parentId); }
function catGetSubGroups(cat, parentId){ return (cat.groups||[]).filter(g=>g.parentId===parentId); }

function catBuildGroupOptions(cat, selectedGid){
  const topGroups = catGetTopGroups(cat);
  let opts = `<option value=""${!selectedGid?' selected':''}>— Ohne Gruppe —</option>`;
  topGroups.forEach(g=>{
    opts += `<option value="${g.id}"${selectedGid===g.id?' selected':''}>${esc(g.name)}</option>`;
    catGetSubGroups(cat,g.id).forEach(sg=>{
      opts += `<option value="${sg.id}"${selectedGid===sg.id?' selected':''}>  · ${esc(sg.name)}</option>`;
    });
  });
  // Verwaiste Untergruppen
  (cat.groups||[]).filter(g=>g.parentId&&!(cat.groups||[]).find(x=>x.id===g.parentId)).forEach(g=>{
    opts += `<option value="${g.id}"${selectedGid===g.id?' selected':''}>${esc(g.name)}</option>`;
  });
  return opts;
}
