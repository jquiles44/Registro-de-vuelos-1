import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════
//  CONFIGURACIÓN DE LA API (Apps Script)
//  Sustituye con tu URL real del Paso 4
// ══════════════════════════════════════════════════════════
// ⚠️ PON AQUÍ TU URL REAL DE APPS SCRIPT (termina en /exec)
const API_URL = 'https://script.google.com/macros/s/AKfycby1nUBZFIWysqQjIMnG6MxAyrl2iN0WKO3go39UdRFqK2bZsL2LKfybVJy90tgfSIsk/exec';
const API_READY = !API_URL.includes('AKfycb...');

async function callApi(action, payload = {}) {
  const isRead = ['getAll','getFlights','getAirlines','getPlanes'].includes(action);
  try {
    const res = isRead
      ? await fetch(`${API_URL}?action=${action}`, { redirect: 'follow' })
      : await fetch(API_URL, { method:'POST', redirect:'follow', headers:{'Content-Type':'text/plain'}, body:JSON.stringify({ action, ...payload }) });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'API error');
    return json.data;
  } catch(err) { console.error(`[API] ${action}:`, err); throw err; }
}

// Sube imagen base64 a Drive. dataUrl = "data:image/jpeg;base64,..."
// Devuelve { fileId, url } — url es la URL pública para mostrar en <img>
async function uploadToDrive(dataUrl, prefix) {
  const [meta, base64] = dataUrl.split(',');
  const mimeType = meta.match(/:(.*?);/)[1];
  const ext = mimeType.split('/')[1].replace('jpeg','jpg');
  const filename = `${prefix}_${Date.now()}.${ext}`;
  return callApi('uploadFile', { base64, filename, mimeType });
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600&display=swap');`;

const STYLE = `
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --sky:#EBF4FF;--sky2:#F5F9FF;--white:#FFFFFF;
  --navy:#0B1D3A;--navy2:#1A3560;
  --blue:#1565C0;--blue2:#1976D2;--blue-light:#E3F0FF;--blue-mid:#90CAF9;
  --accent:#F57C00;--accent-light:#FFF3E0;
  --green:#00796B;--green-light:#E0F2F1;
  --red:#C62828;--red-light:#FFEBEE;
  --border:#CBD8EA;--border2:#B0C4DE;
  --muted:#5A7A9B;--muted2:#4A6580;
  --text:#0D2340;--text2:#2C4A6B;
  --shadow:0 2px 12px rgba(11,29,58,0.10);
  --shadow-lg:0 8px 32px rgba(11,29,58,0.16);
}
body{background:var(--sky);color:var(--text);font-family:'Barlow',sans-serif;min-height:100vh;}
.app{display:flex;height:100vh;overflow:hidden;}

.sidebar{width:220px;min-width:220px;background:var(--navy);display:flex;flex-direction:column;z-index:20;box-shadow:4px 0 20px rgba(11,29,58,0.25);}
.sidebar-logo{padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px;}
.logo-mark{width:40px;height:40px;background:linear-gradient(135deg,#1976D2,#0D47A1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 2px 8px rgba(25,118,210,0.4);}
.logo-text{font-family:'Oxanium',sans-serif;font-size:20px;font-weight:800;color:#fff;letter-spacing:2px;line-height:1;}
.logo-sub{font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1.5px;margin-top:2px;}
.nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;}
.nav-section{font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:2px;padding:12px 10px 6px;text-transform:uppercase;}
.nav-item{padding:9px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.5);transition:all 0.18s;border:1px solid transparent;user-select:none;}
.nav-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);}
.nav-item.active{background:rgba(25,118,210,0.25);color:#90CAF9;border-color:rgba(25,118,210,0.35);}
.nav-icon{width:18px;text-align:center;font-size:14px;flex-shrink:0;}
.nav-badge{margin-left:auto;background:var(--accent);color:#fff;border-radius:10px;padding:2px 7px;font-size:10px;font-weight:700;font-family:'Share Tech Mono',monospace;}
.sidebar-stats{padding:14px 16px;border-top:1px solid rgba(255,255,255,0.08);font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);display:flex;flex-direction:column;gap:5px;}
.sidebar-stat-val{color:rgba(255,255,255,0.6);font-weight:600;}

.main{flex:1;overflow-y:auto;background:var(--sky);}
.main::-webkit-scrollbar{width:6px;}
.main::-webkit-scrollbar-track{background:var(--sky);}
.main::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
.page{padding:24px 28px 40px;}

.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;flex-wrap:wrap;gap:12px;}
.page-title{font-family:'Oxanium',sans-serif;font-size:28px;font-weight:700;color:var(--navy);letter-spacing:1px;line-height:1.1;}
.page-sub{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);margin-top:4px;}

.btn{padding:9px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'Barlow',sans-serif;font-size:13px;font-weight:600;transition:all 0.18s;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;letter-spacing:0.3px;}
.btn-primary{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(21,101,192,0.3);}
.btn-primary:hover{background:var(--blue2);transform:translateY(-1px);}
.btn-ghost{background:var(--white);color:var(--navy);border:1.5px solid var(--border2);}
.btn-ghost:hover{border-color:var(--blue);color:var(--blue);}
.btn-danger{background:var(--red-light);color:var(--red);border:1.5px solid rgba(198,40,40,0.2);}
.btn-danger:hover{background:#FFCDD2;}
.btn-sm{padding:6px 12px;font-size:12px;}
.btn-icon{width:32px;height:32px;border-radius:7px;background:var(--white);border:1.5px solid var(--border);cursor:pointer;color:var(--muted);transition:all 0.18s;display:inline-flex;align-items:center;justify-content:center;font-size:14px;}
.btn-icon:hover{border-color:var(--blue);color:var(--blue);}

.card{background:var(--white);border:1.5px solid var(--border);border-radius:14px;padding:18px;box-shadow:var(--shadow);}

.flight-card{background:var(--white);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);transition:all 0.2s;cursor:pointer;display:flex;flex-direction:column;}
.flight-card:hover{border-color:var(--blue2);transform:translateY(-2px);box-shadow:var(--shadow-lg);}
.flight-card-photo{height:110px;overflow:hidden;position:relative;background:linear-gradient(135deg,var(--navy) 0%,var(--blue2) 100%);flex-shrink:0;}
.flight-card-photo img{width:100%;height:100%;object-fit:cover;}
.flight-card-photo-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;opacity:0.12;}
.flight-card-photo-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(11,29,58,0.55));}
.flight-card-status{position:absolute;top:10px;left:10px;}
.flight-card-no{position:absolute;bottom:8px;right:10px;font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(255,255,255,0.8);}
.flight-card-body{padding:14px;flex:1;display:flex;flex-direction:column;gap:10px;}

.flight-route{display:flex;align-items:center;gap:8px;}
.iata{font-family:'Oxanium',sans-serif;font-size:28px;font-weight:800;color:var(--navy);line-height:1;}
.city-name{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;}
.route-mid{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;}
.route-line{width:100%;display:flex;align-items:center;gap:4px;}
.route-line::before,.route-line::after{content:'';flex:1;height:1px;background:var(--border2);}
.route-dist{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);}
.flight-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
.chip{display:flex;align-items:center;gap:5px;background:var(--sky);border:1px solid var(--border);border-radius:20px;padding:3px 9px;}
.chip-txt{font-size:11px;color:var(--muted2);font-weight:500;}

.badge{padding:3px 9px;border-radius:20px;font-size:10px;font-family:'Share Tech Mono',monospace;font-weight:600;letter-spacing:0.5px;}
.badge-green{background:var(--green-light);color:var(--green);}
.badge-blue{background:var(--blue-light);color:var(--blue);}
.badge-orange{background:var(--accent-light);color:var(--accent);}
.badge-red{background:var(--red-light);color:var(--red);}

.filters-bar{background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:18px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;box-shadow:var(--shadow);}
.filter-label{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;white-space:nowrap;}
.filter-select{background:var(--sky);border:1.5px solid var(--border);border-radius:8px;padding:6px 10px;font-family:'Barlow',sans-serif;font-size:12px;font-weight:500;color:var(--navy);outline:none;cursor:pointer;transition:border-color 0.18s;}
.filter-select:focus{border-color:var(--blue);}
.filter-input{background:var(--sky);border:1.5px solid var(--border);border-radius:8px;padding:6px 10px;font-family:'Barlow',sans-serif;font-size:12px;color:var(--navy);outline:none;flex:1;min-width:120px;}
.filter-input::placeholder{color:var(--muted);}
.filter-input:focus{border-color:var(--blue);}

.modal-overlay{position:fixed;inset:0;background:rgba(11,29,58,0.55);display:flex;align-items:center;justify-content:center;z-index:500;backdrop-filter:blur(6px);animation:fadeIn 0.15s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--white);border:1.5px solid var(--border);border-radius:18px;padding:26px;width:640px;max-width:96vw;max-height:92vh;overflow-y:auto;animation:slideUp 0.2s ease;box-shadow:0 24px 80px rgba(11,29,58,0.25);}
.modal::-webkit-scrollbar{width:4px;}
.modal::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-lg{width:820px;}
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.modal-title{font-family:'Oxanium',sans-serif;font-size:22px;font-weight:700;color:var(--navy);letter-spacing:1px;}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.form-group{display:flex;flex-direction:column;gap:5px;position:relative;}
.form-group.full{grid-column:1/-1;}
.form-label{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.form-input{background:var(--sky);border:1.5px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--navy);font-family:'Barlow',sans-serif;font-size:13px;outline:none;transition:border-color 0.18s;width:100%;}
.form-input:focus{border-color:var(--blue);background:var(--white);}
.form-input option{background:var(--white);}
.ac-list{position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:600;background:var(--white);border:1.5px solid var(--border2);border-radius:10px;max-height:220px;overflow-y:auto;box-shadow:var(--shadow-lg);}
.ac-item{padding:9px 12px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--border);transition:background 0.1s;}
.ac-item:hover{background:var(--blue-light);}
.ac-item:last-child{border-bottom:none;}
.ac-code{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--blue);margin-right:8px;font-weight:700;}
.ac-sub{font-size:10px;color:var(--muted);margin-top:1px;}
.photo-drop{border:2px dashed var(--border2);border-radius:10px;padding:16px;text-align:center;cursor:pointer;transition:all 0.18s;background:var(--sky);display:block;}
.photo-drop:hover{border-color:var(--blue);background:var(--blue-light);}

.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
/* bottom-nav oculto en desktop */
.bottom-nav{display:none;}

/* ── TABLET 601-900px: sidebar con solo iconos ── */
@media(min-width:601px) and (max-width:900px){
  .sidebar{width:64px;min-width:64px;}
  .logo-text,.logo-sub,.nav-section,.sidebar-stats{display:none;}
  .sidebar-logo{padding:14px;justify-content:center;}
  .logo-mark{margin:0;}
  .nav{padding:8px 6px;gap:4px;}
  .nav-item{padding:11px;border-radius:10px;justify-content:center;gap:0;position:relative;}
  .nav-item span:last-child:not(.nav-icon):not(.nav-badge){display:none;}
  .nav-icon{width:22px;font-size:20px;}
  .nav-badge{position:absolute;top:3px;right:3px;padding:1px 4px;font-size:8px;}
  .grid-2{grid-template-columns:1fr;}
  .grid-3{grid-template-columns:1fr 1fr;}
  .grid-4{grid-template-columns:1fr 1fr;}
  .modal-overlay{align-items:flex-end;}
  .modal{border-radius:20px 20px 0 0;max-height:94vh;}
  .page-title{font-size:24px;}
  .form-grid{grid-template-columns:1fr;}
  .form-group.full{grid-column:1;}
}

/* ── MÓVIL ≤600px: sin sidebar, bottom nav fija ── */
@media(max-width:600px){
  .app{flex-direction:column;height:100dvh;overflow:hidden;}
  .sidebar{display:none;}
  .main{flex:1;overflow-y:auto;padding-bottom:66px;}

  /* Bottom bar */
  .bottom-nav{
    display:flex;
    position:fixed;bottom:0;left:0;right:0;z-index:300;
    height:62px;
    background:var(--navy);
    border-top:1px solid rgba(255,255,255,0.1);
    justify-content:space-around;align-items:stretch;
    padding-bottom:env(safe-area-inset-bottom,0px);
    box-shadow:0 -4px 20px rgba(11,29,58,0.35);
  }
  .bottom-nav-item{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:2px;cursor:pointer;position:relative;transition:background .15s;
  }
  .bottom-nav-item.active{background:rgba(25,118,210,0.22);}
  .bottom-nav-icon{font-size:20px;line-height:1;}
  .bottom-nav-lbl{font-family:'Share Tech Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:.3px;}
  .bottom-nav-item.active .bottom-nav-lbl{color:#90CAF9;}
  .bottom-nav-badge{position:absolute;top:3px;right:calc(50% - 16px);background:var(--accent);color:#fff;border-radius:10px;padding:1px 5px;font-size:8px;font-weight:700;}

  /* Layout */
  .page{padding:12px 12px 16px;}
  .page-title{font-size:20px;}
  .page-header{margin-bottom:14px;}
  .page-header .btn-primary{width:100%;justify-content:center;}
  .grid-2,.grid-3{grid-template-columns:1fr;}
  .grid-4{grid-template-columns:1fr 1fr;}
  .form-grid{grid-template-columns:1fr;}
  .form-group.full{grid-column:1;}
  .form-input{font-size:16px;}
  .modal-overlay{align-items:flex-end;padding:0;}
  .modal{width:100%;max-width:100%;border-radius:20px 20px 0 0;padding:20px 16px 28px;max-height:93dvh;}
  .modal-lg{width:100%;}
  .modal-title{font-size:18px;}
  .filters-bar{flex-wrap:nowrap;overflow-x:auto;padding:8px 10px;gap:8px;}
  .filters-bar::-webkit-scrollbar{display:none;}
  .stat-value{font-size:30px;}
  .iata{font-size:24px;}
  #leaflet-map{height:260px;}
}

.stat-card{background:var(--white);border:1.5px solid var(--border);border-radius:14px;padding:20px;box-shadow:var(--shadow);}
.stat-value{font-family:'Oxanium',sans-serif;font-size:40px;font-weight:800;color:var(--blue);line-height:1;}
.stat-label{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:6px;}

.entity-card{background:var(--white);border:1.5px solid var(--border);border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;transition:all 0.2s;cursor:pointer;box-shadow:var(--shadow);}
.entity-card:hover{border-color:var(--blue2);transform:translateY(-1px);box-shadow:var(--shadow-lg);}
.entity-logo{width:54px;height:54px;border-radius:12px;background:var(--sky);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;overflow:hidden;}
.entity-logo img{width:100%;height:100%;object-fit:contain;}
.entity-name{font-family:'Oxanium',sans-serif;font-size:18px;font-weight:700;color:var(--navy);}
.entity-sub{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);margin-top:2px;}

#leaflet-map{width:100%;height:460px;border-radius:14px;z-index:1;}
.map-wrap{position:relative;border-radius:14px;overflow:hidden;border:1.5px solid var(--border);box-shadow:var(--shadow-lg);}
.map-info-bar{background:rgba(255,255,255,0.95);border-top:1.5px solid var(--border);padding:10px 16px;display:flex;gap:20px;flex-wrap:wrap;align-items:center;backdrop-filter:blur(8px);}
.map-stat-v{font-family:'Oxanium',sans-serif;font-size:18px;font-weight:700;color:var(--blue);}
.map-stat-l{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}

.progress-bar{background:var(--sky);border:1px solid var(--border);border-radius:4px;height:7px;overflow:hidden;}
.progress-fill{height:100%;background:var(--blue);border-radius:4px;transition:width 0.5s;}
.sec-title{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:2px;padding-bottom:8px;border-bottom:1.5px solid var(--border);margin-bottom:12px;}
.mini-flight{background:var(--sky);border:1.5px solid var(--border);border-radius:10px;padding:11px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;transition:border-color 0.18s;}
.mini-flight:hover{border-color:var(--blue-mid);}

.pie-wrap{display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
.pie-leg{display:flex;flex-direction:column;gap:7px;flex:1;min-width:120px;}
.pie-row{display:flex;align-items:center;gap:8px;font-size:12px;}
.pie-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}

.bp-header{background:linear-gradient(135deg,var(--navy) 0%,var(--navy2) 60%,var(--blue2) 100%);border-radius:12px 12px 0 0;padding:20px 22px;color:#fff;position:relative;overflow:hidden;}
.bp-header::after{content:'✈';position:absolute;right:-10px;top:50%;transform:translateY(-50%);font-size:100px;opacity:0.05;}
.bp-body{background:var(--white);border-radius:0 0 12px 12px;padding:20px 22px;}
.bp-divider{border:none;margin:16px -22px;border-top:2px dashed var(--border);}

.record-card{background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:8px;}
.record-label{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.record-route{font-family:'Oxanium',sans-serif;font-size:22px;font-weight:800;color:var(--navy);letter-spacing:1px;}

.empty-state{text-align:center;padding:48px 20px;color:var(--muted);}
.empty-icon{font-size:48px;opacity:0.25;margin-bottom:12px;}
.empty-text{font-family:'Share Tech Mono',monospace;font-size:12px;}
.fm{display:flex;flex-direction:column;gap:1px;}
.fm-l{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.fm-v{font-size:12px;font-weight:600;color:var(--text2);}
`;

/* ═══════════ AIRPORTS DB ═══════════ */
const AIRPORTS = [
  {iata:"MAD",name:"Adolfo Suárez Madrid-Barajas",city:"Madrid",country:"España",lat:40.4936,lng:-3.5668},
  {iata:"BCN",name:"El Prat",city:"Barcelona",country:"España",lat:41.2971,lng:2.0785},
  {iata:"AGP",name:"Costa del Sol",city:"Málaga",country:"España",lat:36.6749,lng:-4.4991},
  {iata:"VLC",name:"Valencia",city:"Valencia",country:"España",lat:39.4893,lng:-0.4816},
  {iata:"SVQ",name:"San Pablo",city:"Sevilla",country:"España",lat:37.4180,lng:-5.8931},
  {iata:"IBZ",name:"Ibiza",city:"Ibiza",country:"España",lat:38.8729,lng:1.3731},
  {iata:"PMI",name:"Son Sant Joan",city:"Palma",country:"España",lat:39.5517,lng:2.7388},
  {iata:"TFS",name:"Tenerife Sur",city:"Tenerife",country:"España",lat:28.0445,lng:-16.5724},
  {iata:"LPA",name:"Gran Canaria",city:"Las Palmas",country:"España",lat:27.9319,lng:-15.3866},
  {iata:"LHR",name:"Heathrow",city:"Londres",country:"Reino Unido",lat:51.4700,lng:-0.4543},
  {iata:"LGW",name:"Gatwick",city:"Londres",country:"Reino Unido",lat:51.1537,lng:-0.1821},
  {iata:"CDG",name:"Charles de Gaulle",city:"París",country:"Francia",lat:49.0097,lng:2.5479},
  {iata:"ORY",name:"Orly",city:"París",country:"Francia",lat:48.7233,lng:2.3794},
  {iata:"FCO",name:"Leonardo da Vinci",city:"Roma",country:"Italia",lat:41.8003,lng:12.2389},
  {iata:"MXP",name:"Malpensa",city:"Milán",country:"Italia",lat:45.6306,lng:8.7281},
  {iata:"NAP",name:"Capodichino",city:"Nápoles",country:"Italia",lat:40.8860,lng:14.2908},
  {iata:"AMS",name:"Schiphol",city:"Ámsterdam",country:"Países Bajos",lat:52.3105,lng:4.7683},
  {iata:"FRA",name:"Frankfurt",city:"Fráncfort",country:"Alemania",lat:50.0379,lng:8.5622},
  {iata:"MUC",name:"Munich",city:"Múnich",country:"Alemania",lat:48.3537,lng:11.7750},
  {iata:"BER",name:"Brandenburg",city:"Berlín",country:"Alemania",lat:52.3667,lng:13.5033},
  {iata:"ZRH",name:"Zurich",city:"Zúrich",country:"Suiza",lat:47.4647,lng:8.5492},
  {iata:"VIE",name:"Schwechat",city:"Viena",country:"Austria",lat:48.1103,lng:16.5697},
  {iata:"BRU",name:"Brussels",city:"Bruselas",country:"Bélgica",lat:50.9014,lng:4.4844},
  {iata:"LIS",name:"Humberto Delgado",city:"Lisboa",country:"Portugal",lat:38.7813,lng:-9.1359},
  {iata:"OPO",name:"Sá Carneiro",city:"Oporto",country:"Portugal",lat:41.2481,lng:-8.6814},
  {iata:"ATH",name:"Eleftherios Venizelos",city:"Atenas",country:"Grecia",lat:37.9364,lng:23.9445},
  {iata:"DUB",name:"Dublin",city:"Dublín",country:"Irlanda",lat:53.4273,lng:-6.2436},
  {iata:"CPH",name:"Kastrup",city:"Copenhague",country:"Dinamarca",lat:55.6180,lng:12.6560},
  {iata:"ARN",name:"Arlanda",city:"Estocolmo",country:"Suecia",lat:59.6519,lng:17.9186},
  {iata:"OSL",name:"Gardermoen",city:"Oslo",country:"Noruega",lat:60.1939,lng:11.1004},
  {iata:"HEL",name:"Vantaa",city:"Helsinki",country:"Finlandia",lat:60.3172,lng:24.9633},
  {iata:"WAW",name:"Chopin",city:"Varsovia",country:"Polonia",lat:52.1657,lng:20.9671},
  {iata:"PRG",name:"Václav Havel",city:"Praga",country:"Rep. Checa",lat:50.1008,lng:14.2600},
  {iata:"BUD",name:"Ferenc Liszt",city:"Budapest",country:"Hungría",lat:47.4298,lng:19.2611},
  {iata:"IST",name:"Istanbul",city:"Estambul",country:"Turquía",lat:41.2753,lng:28.7519},
  {iata:"DXB",name:"Dubai International",city:"Dubái",country:"EAU",lat:25.2528,lng:55.3644},
  {iata:"DOH",name:"Hamad International",city:"Doha",country:"Qatar",lat:25.2731,lng:51.6081},
  {iata:"JFK",name:"John F. Kennedy",city:"Nueva York",country:"EEUU",lat:40.6413,lng:-73.7781},
  {iata:"LAX",name:"Los Angeles Intl.",city:"Los Ángeles",country:"EEUU",lat:33.9425,lng:-118.4081},
  {iata:"MIA",name:"Miami International",city:"Miami",country:"EEUU",lat:25.7959,lng:-80.2870},
  {iata:"MEX",name:"Benito Juárez",city:"Ciudad de México",country:"México",lat:19.4363,lng:-99.0721},
  {iata:"CUN",name:"Cancún",city:"Cancún",country:"México",lat:21.0365,lng:-86.8771},
  {iata:"GRU",name:"Guarulhos",city:"São Paulo",country:"Brasil",lat:-23.4356,lng:-46.4731},
  {iata:"EZE",name:"Ministro Pistarini",city:"Buenos Aires",country:"Argentina",lat:-34.8222,lng:-58.5358},
  {iata:"BOG",name:"El Dorado",city:"Bogotá",country:"Colombia",lat:4.7016,lng:-74.1469},
  {iata:"LIM",name:"Jorge Chávez",city:"Lima",country:"Perú",lat:-12.0219,lng:-77.1143},
  {iata:"SCL",name:"Arturo Merino",city:"Santiago",country:"Chile",lat:-33.3930,lng:-70.7858},
  {iata:"NRT",name:"Narita",city:"Tokio",country:"Japón",lat:35.7720,lng:140.3929},
  {iata:"HND",name:"Haneda",city:"Tokio",country:"Japón",lat:35.5494,lng:139.7798},
  {iata:"PEK",name:"Capital",city:"Pekín",country:"China",lat:40.0799,lng:116.6031},
  {iata:"PVG",name:"Pudong",city:"Shanghái",country:"China",lat:31.1434,lng:121.8052},
  {iata:"SIN",name:"Changi",city:"Singapur",country:"Singapur",lat:1.3644,lng:103.9915},
  {iata:"BKK",name:"Suvarnabhumi",city:"Bangkok",country:"Tailandia",lat:13.6900,lng:100.7501},
  {iata:"SYD",name:"Kingsford Smith",city:"Sídney",country:"Australia",lat:-33.9399,lng:151.1753},
  {iata:"CMN",name:"Mohammed V",city:"Casablanca",country:"Marruecos",lat:33.3675,lng:-7.5898},
  {iata:"RAK",name:"Menara",city:"Marrakech",country:"Marruecos",lat:31.6069,lng:-8.0363},
  {iata:"CPT",name:"Cape Town Intl.",city:"Ciudad del Cabo",country:"Sudáfrica",lat:-33.9649,lng:18.6017},
  {iata:"CAI",name:"Cairo International",city:"El Cairo",country:"Egipto",lat:30.1219,lng:31.4056},
];

const COLORS = ["#1565C0","#F57C00","#00796B","#C62828","#6A1B9A","#00838F","#2E7D32","#EF6C00","#AD1457","#0277BD"];

const INIT_AIRLINES = [
  {id:1,name:"Iberia",country:"España",status:"active",logo:"",iata:"IB"},
  {id:2,name:"Ryanair",country:"Irlanda",status:"active",logo:"",iata:"FR"},
  {id:3,name:"Air France",country:"Francia",status:"active",logo:"",iata:"AF"},
  {id:4,name:"Spanair",country:"España",status:"closed",logo:"",iata:"JK"},
];
const INIT_PLANES = [
  {id:1,brand:"Boeing",model:"737-800",type:"Narrow-body",logo:""},
  {id:2,brand:"Airbus",model:"A320neo",type:"Narrow-body",logo:""},
  {id:3,brand:"Airbus",model:"A350-900",type:"Wide-body",logo:""},
];
const INIT_FLIGHTS = [
  {id:1,from:"MAD",to:"LHR",fromCity:"Madrid",toCity:"Londres",fromName:"Adolfo Suárez",toName:"Heathrow",fromLat:40.4936,fromLng:-3.5668,toLat:51.4700,toLng:-0.4543,date:"2024-03-15",airline:"Iberia",airlineId:1,flightNo:"IB3163",plane:"Airbus A320neo",planeId:2,duration:"2h 15m",distance:1246,seat:"12A",status:"flown",photo:""},
  {id:2,from:"LHR",to:"CDG",fromCity:"Londres",toCity:"París",fromName:"Heathrow",toName:"Charles de Gaulle",fromLat:51.4700,fromLng:-0.4543,toLat:49.0097,toLng:2.5479,date:"2024-03-22",airline:"Air France",airlineId:3,flightNo:"AF1081",plane:"Airbus A320neo",planeId:2,duration:"1h 20m",distance:341,seat:"5C",status:"flown",photo:""},
  {id:3,from:"MAD",to:"BCN",fromCity:"Madrid",toCity:"Barcelona",fromName:"Adolfo Suárez",toName:"El Prat",fromLat:40.4936,fromLng:-3.5668,toLat:41.2971,toLng:2.0785,date:"2025-06-10",airline:"Ryanair",airlineId:2,flightNo:"FR8341",plane:"Boeing 737-800",planeId:1,duration:"1h 05m",distance:483,seat:"22B",status:"upcoming",photo:""},
  {id:4,from:"BCN",to:"FCO",fromCity:"Barcelona",toCity:"Roma",fromName:"El Prat",toName:"Leonardo da Vinci",fromLat:41.2971,fromLng:2.0785,toLat:41.8003,toLng:12.2389,date:"2025-06-14",airline:"Ryanair",airlineId:2,flightNo:"FR4521",plane:"Boeing 737-800",planeId:1,duration:"1h 45m",distance:862,seat:"14F",status:"upcoming",photo:""},
];

/* ═══════════ HELPERS ═══════════ */
function haversine(lat1,lon1,lat2,lon2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}
function estimateDur(km){if(!km)return"";const m=Math.round((km/850)*60)+25;return `${Math.floor(m/60)}h ${String(m%60).padStart(2,"0")}m`;}
function toB64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}

/* ═══════════ LEAFLET MAP ═══════════ */
function LeafletMap({ flights }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const flown = flights.filter(f => f.status === "flown");
  const visited = [...new Set(flown.flatMap(f => [f.from, f.to]))];

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    function initMap() {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      const L = window.L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([48, 10], 4);
      mapInstanceRef.current = map;

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Draw routes
      flown.forEach(f => {
        const fromAp = AIRPORTS.find(a => a.iata === f.from);
        const toAp = AIRPORTS.find(a => a.iata === f.to);
        const fLat = fromAp?.lat ?? f.fromLat;
        const fLng = fromAp?.lng ?? f.fromLng;
        const tLat = toAp?.lat ?? f.toLat;
        const tLng = toAp?.lng ?? f.toLng;
        if (!fLat || !tLat) return;
        L.polyline([[fLat, fLng], [tLat, tLng]], {
          color: "#1565C0", weight: 2.5, opacity: 0.75, dashArray: "6 5",
        }).addTo(map).bindTooltip(`${f.from} → ${f.to} · ${f.airline || ""} · ${f.distance || "?"}km`);
      });

      // Draw airport markers
      const markerIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:#F57C00;border:2.5px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        className: "", iconAnchor: [6, 6],
      });

      visited.forEach(code => {
        const ap = AIRPORTS.find(a => a.iata === code);
        if (!ap) return;
        L.marker([ap.lat, ap.lng], { icon: markerIcon })
          .addTo(map)
          .bindTooltip(`<b>${code}</b><br>${ap.city}<br><small>${ap.name}</small>`, { direction: "top" });
      });

      // Fit bounds
      if (visited.length > 1) {
        const aps = visited.map(c => AIRPORTS.find(a => a.iata === c)).filter(Boolean);
        const bounds = L.latLngBounds(aps.map(a => [a.lat, a.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (visited.length === 1) {
        const ap = AIRPORTS.find(a => a.iata === visited[0]);
        if (ap) map.setView([ap.lat, ap.lng], 7);
      }
    }

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [flights]);

  const totalKm = flown.reduce((s, f) => s + (f.distance || 0), 0);

  return (
    <div className="map-wrap">
      <div ref={mapRef} id="leaflet-map" />
      <div className="map-info-bar">
        {[["🌍", visited.length, "Destinos"], ["✈", flown.length, "Rutas"], ["📏", totalKm.toLocaleString() + " km", "Distancia total"]].map(([ic, v, l]) => (
          <div key={l} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>{ic}</span>
            <div className="map-stat">
              <div className="map-stat-v">{v}</div>
              <div className="map-stat-l">{l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ MINI COMPONENTS ═══════════ */
function LogoBox({ src, fallback, size = 18 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: "var(--sky)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: Math.round(size * 0.5) }}>{fallback}</span>}
    </div>
  );
}

function PieChart({ data, size = 130 }) {
  if (!data || !data.length) return <div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "'Share Tech Mono',monospace" }}>Sin datos</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "'Share Tech Mono',monospace" }}>Sin vuelos</div>;
  let a = -Math.PI / 2;
  const cx = size / 2, cy = size / 2, r = size / 2 - 5;
  const slices = data.map((d, i) => {
    const ang = (d.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    a += ang;
    return { ...d, path: `M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${ang > Math.PI ? 1 : 0},1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}Z`, color: COLORS[i % COLORS.length] };
  });
  return (
    <div className="pie-wrap">
      <svg width={size} height={size} style={{ flex: `0 0 ${size}px` }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={r * 0.38} fill="var(--white)" />
        <text x={cx} y={cy + 6} textAnchor="middle" fill="var(--navy)" fontSize="14" fontFamily="'Oxanium',sans-serif" fontWeight="800">{total}</text>
      </svg>
      <div className="pie-leg">
        {slices.map((s, i) => (
          <div key={i} className="pie-row">
            <div className="pie-dot" style={{ background: s.color }} />
            <span style={{ color: "var(--text2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, marginLeft: 6, color: "var(--muted)" }}>{s.value} ({Math.round(s.value / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ AIRPORT AUTOCOMPLETE ═══════════ */
function AirportInput({ label, initValue, onSelect }) {
  const [q, setQ] = useState(initValue || "");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState([]);
  const ref = useRef();
  useEffect(() => { setQ(initValue || ""); }, [initValue]);
  useEffect(() => {
    if (q.length < 2) { setRes([]); return; }
    const low = q.toLowerCase();
    setRes(AIRPORTS.filter(a => a.iata.toLowerCase().includes(low) || a.city.toLowerCase().includes(low) || a.name.toLowerCase().includes(low) || a.country.toLowerCase().includes(low)).slice(0, 8));
  }, [q]);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="form-group" ref={ref}>
      <div className="form-label">{label}</div>
      <input className="form-input" value={q} placeholder="Buscar aeropuerto..." onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => q.length >= 2 && setOpen(true)} />
      {open && res.length > 0 && (
        <div className="ac-list">
          {res.map(a => (
            <div key={a.iata} className="ac-item" onMouseDown={() => { setQ(`${a.iata} — ${a.city}`); onSelect(a); setOpen(false); }}>
              <div><span className="ac-code">{a.iata}</span>{a.name}</div>
              <div className="ac-sub">{a.city}, {a.country}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ FLIGHT FORM ═══════════ */
function FlightForm({ initial, airlines, planes, onSave, onClose }) {
  const blank = { from: "", to: "", fromCity: "", toCity: "", fromName: "", toName: "", fromLat: null, fromLng: null, toLat: null, toLng: null, date: "", airline: "", airlineId: null, flightNo: "", plane: "", planeId: null, duration: "", distance: 0, seat: "", status: "upcoming", photo: "" };
  const [f, setF] = useState(initial || blank);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setMany = o => setF(p => ({ ...p, ...o }));
  const handleFrom = ap => { const d = (f.toLat && ap.lat) ? haversine(ap.lat, ap.lng, f.toLat, f.toLng) : 0; setMany({ from: ap.iata, fromCity: ap.city, fromName: ap.name, fromLat: ap.lat, fromLng: ap.lng, distance: d, duration: estimateDur(d) }); };
  const handleTo = ap => { const d = (f.fromLat && ap.lat) ? haversine(f.fromLat, f.fromLng, ap.lat, ap.lng) : 0; setMany({ to: ap.iata, toCity: ap.city, toName: ap.name, toLat: ap.lat, toLng: ap.lng, distance: d, duration: estimateDur(d) }); };
  const handleAirline = id => { const al = airlines.find(a => a.id === Number(id)); setMany({ airlineId: al?.id || null, airline: al?.name || "" }); };
  const handlePlane = id => { const pl = planes.find(p => p.id === Number(id)); setMany({ planeId: pl?.id || null, plane: pl ? `${pl.brand} ${pl.model}` : "" }); };
  const handlePhoto = async e => { const file = e.target.files[0]; if (!file) return; set("photo", await toB64(file)); };
  const save = async () => {
    if (!f.from || !f.to || !f.date) return;
    let data = { ...f, id: f.id || Date.now() };
    // Si hay foto nueva en base64 → subirla a Drive ahora
    if (data.photo && data.photo.startsWith('data:')) {
      try {
        const { fileId, url } = await uploadToDrive(data.photo, 'flight');
        data.photoUrl = url;
        data.photoFileId = fileId;
      } catch(e) { console.error('Error subiendo foto a Drive:', e); }
    }
    // Nunca guardar base64 en Sheets (demasiado grande)
    delete data.photo;
    onSave(data);
    onClose();
  };
  const selAl = airlines.find(a => a.id === f.airlineId);
  const selPl = planes.find(p => p.id === f.planeId);
  return (
    <>
      <div className="form-grid">
        <AirportInput label="Aeropuerto Origen" initValue={f.from ? `${f.from} — ${f.fromCity}` : ""} onSelect={handleFrom} />
        <AirportInput label="Aeropuerto Destino" initValue={f.to ? `${f.to} — ${f.toCity}` : ""} onSelect={handleTo} />
        <div className="form-group"><div className="form-label">Fecha</div><input className="form-input" type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div>
        <div className="form-group"><div className="form-label">Nº Vuelo</div><input className="form-input" value={f.flightNo} onChange={e => set("flightNo", e.target.value)} placeholder="IB3163" /></div>
        <div className="form-group">
          <div className="form-label">Aerolínea</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {selAl && <LogoBox src={selAl.logo} fallback={selAl.iata} size={30} />}
            <select className="form-input" value={f.airlineId || ""} onChange={e => handleAirline(e.target.value)} style={{ flex: 1 }}>
              <option value="">Seleccionar...</option>
              {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <div className="form-label">Avión</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {selPl && <LogoBox src={selPl.logo} fallback="✈" size={30} />}
            <select className="form-input" value={f.planeId || ""} onChange={e => handlePlane(e.target.value)} style={{ flex: 1 }}>
              <option value="">Seleccionar...</option>
              {planes.map(p => <option key={p.id} value={p.id}>{p.brand} {p.model}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><div className="form-label">Duración (auto)</div><input className="form-input" value={f.duration} onChange={e => set("duration", e.target.value)} /></div>
        <div className="form-group"><div className="form-label">Distancia km (auto)</div><input className="form-input" type="number" value={f.distance || ""} onChange={e => set("distance", Number(e.target.value))} /></div>
        <div className="form-group"><div className="form-label">Asiento</div><input className="form-input" value={f.seat} onChange={e => set("seat", e.target.value)} placeholder="12A" /></div>
        <div className="form-group">
          <div className="form-label">Estado</div>
          <select className="form-input" value={f.status} onChange={e => set("status", e.target.value)}>
            <option value="upcoming">Programado</option><option value="flown">Volado</option>
          </select>
        </div>
        <div className="form-group full">
          <div className="form-label">Foto del vuelo</div>
          <label className="photo-drop"><div style={{ fontSize: 22, marginBottom: 4 }}>📷</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Clic para subir imagen</div><input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} /></label>
          {f.photo && <img src={f.photo} alt="preview" style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8, marginTop: 8, border: "1px solid var(--border)" }} />}
        </div>
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>Guardar Vuelo</button>
      </div>
    </>
  );
}

/* ═══════════ FLIGHT DETAIL MODAL ═══════════ */
function FlightDetailModal({ flight, airlines, planes, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const al = airlines.find(a => a.id === flight.airlineId);
  const pl = planes.find(p => p.id === flight.planeId);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${editing ? "" : "modal-lg"}`}>
        <div className="modal-header">
          <div><div className="modal-title">{flight.from} → {flight.to}</div><div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{flight.flightNo || "—"} · {flight.date}</div></div>
          <div style={{ display: "flex", gap: 8 }}>
            {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏ Editar</button>}
            {!editing && <button className="btn btn-danger btn-sm" onClick={() => { onDelete(flight.id); onClose(); }}>🗑</button>}
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>
        {editing ? (
          <FlightForm initial={flight} airlines={airlines} planes={planes} onSave={u => { onSave(u); setEditing(false); }} onClose={() => setEditing(false)} />
        ) : (
          <div>
            <div className="bp-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 2, marginBottom: 4 }}>ORIGEN</div>
                  <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{flight.from}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{flight.fromCity}</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{flight.fromName}</div>
                </div>
                <div style={{ textAlign: "center", flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 28, opacity: 0.7 }}>✈</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{flight.duration}</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{flight.distance} km</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 2, marginBottom: 4 }}>DESTINO</div>
                  <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{flight.to}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{flight.toCity}</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{flight.toName}</div>
                </div>
              </div>
            </div>
            <div className="bp-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["Nº Vuelo", flight.flightNo], ["Fecha", flight.date], ["Asiento", flight.seat], ["Estado", flight.status === "flown" ? "✓ Volado" : "⏳ Programado"]].map(([l, v]) => (
                  <div key={l}><div className="fm-l">{l}</div><div className="fm-v">{v || "—"}</div></div>
                ))}
              </div>
              <hr className="bp-divider" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: (flight.photoUrl || flight.photo) ? 16 : 0 }}>
                {[[al?.logo, al?.iata || "✈", flight.airline, al?.country, "Aerolínea"], [pl?.logo, "✈", flight.plane, pl?.type, "Aeronave"]].map(([logo, fb, name, sub, lbl]) => (
                  <div key={lbl} style={{ background: "var(--sky)", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <LogoBox src={logo} fallback={fb} size={38} />
                    <div><div className="fm-l">{lbl}</div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--navy)" }}>{name || "—"}</div><div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>{sub}</div></div>
                  </div>
                ))}
              </div>
              {(flight.photoUrl || flight.photo) && <img src={flight.photoUrl || flight.photo} alt="flight" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ FLIGHT CARD ═══════════ */
function FlightCard({ flight, airlines, planes, onClick }) {
  const al = airlines.find(a => a.id === flight.airlineId);
  const pl = planes.find(p => p.id === flight.planeId);
  return (
    <div className="flight-card" onClick={onClick}>
      <div className="flight-card-photo">
        {(flight.photoUrl || flight.photo) ? <img src={flight.photoUrl || flight.photo} alt="flight" /> : <div className="flight-card-photo-placeholder">✈</div>}
        <div className="flight-card-photo-overlay" />
        <div className="flight-card-status"><span className={`badge ${flight.status === "flown" ? "badge-green" : "badge-orange"}`}>{flight.status === "flown" ? "✓ VOLADO" : "⏳ PRÓXIMO"}</span></div>
        {flight.flightNo && <div className="flight-card-no">{flight.flightNo}</div>}
      </div>
      <div className="flight-card-body">
        <div className="flight-route">
          <div><div className="iata">{flight.from}</div><div className="city-name">{flight.fromCity}</div></div>
          <div className="route-mid">
            <div className="route-line"><span style={{ color: "var(--blue)", fontSize: 14 }}>✈</span></div>
            <div className="route-dist">{flight.distance} km · {flight.duration}</div>
          </div>
          <div style={{ textAlign: "right" }}><div className="iata">{flight.to}</div><div className="city-name" style={{ textAlign: "right" }}>{flight.toCity}</div></div>
        </div>
        <div className="flight-chips">
          {al && <div className="chip"><LogoBox src={al.logo} fallback={al.iata} size={16} /><span className="chip-txt">{al.name}</span></div>}
          {pl && <div className="chip"><span style={{ fontSize: 11 }}>✈</span><span className="chip-txt">{pl.brand} {pl.model}</span></div>}
          <div className="chip"><span className="chip-txt">💺 {flight.seat || "—"}</span></div>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "var(--muted)" }}>{flight.date}</div>
      </div>
    </div>
  );
}

/* ═══════════ FLIGHTS PAGE ═══════════ */
function FlightsPage({ flights, setFlights, airlines, planes, statusFilter }) {
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [filterAirline, setFilterAirline] = useState("");
  const [filterPlane, setFilterPlane] = useState("");
  const [filterDest, setFilterDest] = useState("");

  const all = flights.filter(f => f.status === statusFilter);
  const filtered = all.filter(f => {
    const s = search.toLowerCase();
    if (s && !f.from.toLowerCase().includes(s) && !f.to.toLowerCase().includes(s) && !f.fromCity.toLowerCase().includes(s) && !f.toCity.toLowerCase().includes(s) && !(f.flightNo || "").toLowerCase().includes(s)) return false;
    if (filterAirline && f.airlineId !== Number(filterAirline)) return false;
    if (filterPlane && f.planeId !== Number(filterPlane)) return false;
    if (filterDest && f.to !== filterDest && f.from !== filterDest) return false;
    return true;
  }).sort((a, b) => statusFilter === "flown" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

  const destinations = [...new Set(all.flatMap(f => [f.from, f.to]))].sort();
  const detailFlight = detail ? flights.find(f => String(f.id) === String(detail.id)) || detail : null;
  const anyFilter = search || filterAirline || filterPlane || filterDest;

  // FlightForm ya sube la foto a Drive dentro de save(), así que aquí solo guardamos en Sheets
  const handleAdd = async (data) => {
    if (API_READY) {
      try { const res = await callApi('saveFlight', { data }); data.id = String(res.id); }
      catch(e) { data.id = String(Date.now()); }
    } else { data.id = String(Date.now()); }
    setFlights(p => [...p, data]);
    setShowAdd(false);
  };

  const handleEdit = async (data) => {
    if (API_READY) { try { await callApi('updateFlight', { data }); } catch(e) {} }
    setFlights(p => p.map(f => String(f.id) === String(data.id) ? data : f));
    setDetail(data);
  };

  const handleDelete = async (id) => {
    const f = flights.find(x => String(x.id) === String(id));
    if (f?.photoFileId && API_READY) callApi('deleteFile', { fileId: f.photoFileId }).catch(()=>{});
    if (API_READY) { try { await callApi('deleteFlight', { id: String(id) }); } catch(e) {} }
    setFlights(p => p.filter(x => String(x.id) !== String(id)));
    setDetail(null);
  };

  return (
    <div className="page">
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal"><div className="modal-header"><div className="modal-title">NUEVO VUELO</div><button className="btn-icon" onClick={() => setShowAdd(false)}>✕</button></div>
            <FlightForm airlines={airlines} planes={planes} onSave={handleAdd} onClose={() => setShowAdd(false)} />
          </div>
        </div>
      )}
      {detailFlight && <FlightDetailModal flight={detailFlight} airlines={airlines} planes={planes} onClose={() => setDetail(null)} onSave={handleEdit} onDelete={handleDelete} />}
      <div className="page-header">
        <div><div className="page-title">{statusFilter === "upcoming" ? "VUELOS PROGRAMADOS" : "HISTORIAL DE VUELOS"}</div><div className="page-sub">{filtered.length} de {all.length} vuelos · clic para abrir detalle</div></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Añadir Vuelo</button>
      </div>
      <div className="filters-bar">
        <span className="filter-label">Filtrar:</span>
        <input className="filter-input" placeholder="Vuelo, IATA, ciudad..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterAirline} onChange={e => setFilterAirline(e.target.value)}><option value="">Aerolínea</option>{airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <select className="filter-select" value={filterPlane} onChange={e => setFilterPlane(e.target.value)}><option value="">Avión</option>{planes.map(p => <option key={p.id} value={p.id}>{p.brand} {p.model}</option>)}</select>
        <select className="filter-select" value={filterDest} onChange={e => setFilterDest(e.target.value)}><option value="">Destino</option>{destinations.map(d => <option key={d} value={d}>{d}</option>)}</select>
        {anyFilter && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterAirline(""); setFilterPlane(""); setFilterDest(""); }}>✕ Limpiar</button>}
      </div>
      {filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">✈</div><div className="empty-text">Sin vuelos que coincidan</div></div>
        : <div className="grid-2">{filtered.map(f => <FlightCard key={f.id} flight={f} airlines={airlines} planes={planes} onClick={() => setDetail(f)} />)}</div>}
    </div>
  );
}

/* ═══════════ MAP PAGE ═══════════ */
function MapPage({ flights }) {
  const flown = flights.filter(f => f.status === "flown");
  const visited = [...new Set(flown.flatMap(f => [f.from, f.to]))];
  return (
    <div className="page" style={{ maxWidth: "100%" }}>
      <div className="page-header"><div><div className="page-title">MAPA DE RUTAS</div><div className="page-sub">Mapa interactivo real · zoom y arrastrar disponibles</div></div></div>
      <div style={{ marginBottom: 20 }}><LeafletMap flights={flights} /></div>
      <div className="sec-title" style={{ marginTop: 20 }}>DESTINOS VISITADOS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visited.length === 0
          ? <div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "'Share Tech Mono',monospace" }}>Registra vuelos volados para ver destinos</div>
          : visited.map(code => {
            const ap = AIRPORTS.find(a => a.iata === code);
            return (
              <div key={code} className="card" style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 20, fontWeight: 800, color: "var(--blue)" }}>{code}</span>
                <div><div style={{ fontSize: 12, fontWeight: 600 }}>{ap?.city || code}</div><div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>{ap?.country}</div></div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ═══════════ ENTITY EDIT FORM ═══════════ */
function EntityEditForm({ data, fields, onSave, onCancel }) {
  const [f, setF] = useState({ ...data });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const handleFile = async (k, e) => { const file = e.target.files[0]; if (!file) return; set(k, await toB64(file)); };
  return (
    <div className="card" style={{ maxWidth: 540 }}>
      <div className="form-grid">
        {fields.map(fi => (
          <div key={fi.key} className={`form-group ${fi.full ? "full" : ""}`}>
            <div className="form-label">{fi.label}</div>
            {fi.type === "select" ? (
              <select className="form-input" value={f[fi.key] || ""} onChange={e => set(fi.key, e.target.value)}>
                {fi.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : fi.type === "file" ? (
              <div>
                <label className="photo-drop" style={{ padding: 10 }}><div style={{ fontSize: 12, color: "var(--muted)" }}>📎 Subir imagen</div><input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(fi.key, e)} /></label>
                {f[fi.key] && <img src={f[fi.key]} alt="" style={{ height: 48, marginTop: 8, objectFit: "contain", borderRadius: 6 }} />}
              </div>
            ) : (
              <input className="form-input" value={f[fi.key] || ""} onChange={e => set(fi.key, e.target.value)} placeholder={fi.placeholder || ""} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(f)}>Guardar</button>
      </div>
    </div>
  );
}

/* ═══════════ AIRLINES PAGE ═══════════ */
function AirlinesPage({ airlines, setAirlines, flights }) {
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const del = async (id) => {
    if (API_READY) { try { await callApi('deleteAirline', { id: String(id) }); } catch(e) {} }
    setAirlines(p => p.filter(a => a.id !== id)); setSelected(null);
  };

  // Sube logo a Drive si es base64, luego guarda en Sheets
  const processAndSaveAirline = async (f, isNew) => {
    const data = { ...f };
    if (data.logo && data.logo.startsWith('data:')) {
      try {
        const { fileId, url } = await uploadToDrive(data.logo, 'airline');
        data.logoUrl = url; data.logoFileId = fileId; data.logo = url;
      } catch(e) { console.error('Error logo Drive:', e); }
    }
    if (isNew) {
      if (API_READY) {
        try { const res = await callApi('saveAirline', { data }); data.id = Number(res.id); }
        catch(e) { data.id = Date.now(); }
      } else { data.id = Date.now(); }
      setAirlines(p => [...p, data]); setShowAdd(false);
    } else {
      if (API_READY) { try { await callApi('updateAirline', { data }); } catch(e) {} }
      setAirlines(p => p.map(a => a.id === data.id ? data : a)); setEditing(false);
    }
  };

  const pieData = airlines.map(al => ({ label: al.name, value: flights.filter(f => f.airlineId === al.id && f.status === "flown").length })).filter(d => d.value > 0);

  if (selected) {
    const al = airlines.find(a => a.id === selected) || {};
    const alF = flights.filter(f => f.airlineId === al.id);
    const alPlanes = [...new Set(alF.map(f => f.plane).filter(Boolean))];
    if (editing) return (
      <div className="page">
        <div className="page-header"><div className="page-title">EDITAR {(al.name || "").toUpperCase()}</div><button className="btn btn-ghost" onClick={() => setEditing(false)}>← Volver</button></div>
        <EntityEditForm data={al} fields={[{ key: "name", label: "Nombre" }, { key: "iata", label: "IATA" }, { key: "country", label: "Nacionalidad" }, { key: "status", label: "Estado", type: "select", options: [{ value: "active", label: "Activa" }, { value: "closed", label: "Cerrada" }] }, { key: "logo", label: "Logo", type: "file", full: true }]}
          onSave={f => processAndSaveAirline(f, false)} onCancel={() => setEditing(false)} />
      </div>
    );
    return (
      <div className="page">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="entity-logo" style={{ width: 64, height: 64 }}>{al.logo ? <img src={al.logo} alt="" /> : <span>{al.iata || "✈"}</span>}</div>
            <div><div className="page-title">{al.name}</div><div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}><div className="page-sub">{al.country} · {al.iata}</div><span className={`badge ${al.status === "active" ? "badge-green" : "badge-red"}`}>{al.status === "active" ? "ACTIVA" : "CERRADA"}</span></div></div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏ Editar</button>
            <button className="btn btn-danger" onClick={() => del(al.id)}>🗑</button>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>← Volver</button>
          </div>
        </div>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {[["Vuelos totales", alF.length, "var(--blue)"], ["Volados", alF.filter(f => f.status === "flown").length, "var(--green)"], ["Programados", alF.filter(f => f.status === "upcoming").length, "var(--accent)"]].map(([l, v, c]) => (
            <div key={l} className="stat-card"><div className="stat-value" style={{ color: c }}>{v}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}><div className="sec-title">AVIONES UTILIZADOS</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{alPlanes.length === 0 ? <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>Sin datos</div> : alPlanes.map(p => <span key={p} className="badge badge-blue" style={{ fontSize: 11, padding: "5px 12px" }}>✈ {p}</span>)}</div></div>
        <div><div className="sec-title">HISTORIAL DE VUELOS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alF.length === 0 ? <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>Sin vuelos</div> : alF.map(f => (
              <div key={f.id} className="mini-flight">
                <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--blue)" }}>{f.from}</span>
                <span style={{ color: "var(--muted)" }}>→</span>
                <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--blue)" }}>{f.to}</span>
                <span style={{ fontSize: 12, color: "var(--muted2)" }}>{f.fromCity} → {f.toCity}</span>
                <span style={{ marginLeft: "auto", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)" }}>{f.date}</span>
                <span className={`badge ${f.status === "flown" ? "badge-green" : "badge-orange"}`}>{f.status === "flown" ? "✓" : "⏳"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      {showAdd && (
        <div className="modal-overlay"><div className="modal"><div className="modal-header"><div className="modal-title">NUEVA AEROLÍNEA</div><button className="btn-icon" onClick={() => setShowAdd(false)}>✕</button></div>
          <EntityEditForm data={{ name: "", iata: "", country: "", status: "active", logo: "" }} fields={[{ key: "name", label: "Nombre", placeholder: "Iberia" }, { key: "iata", label: "IATA", placeholder: "IB" }, { key: "country", label: "Nacionalidad", placeholder: "España" }, { key: "status", label: "Estado", type: "select", options: [{ value: "active", label: "Activa" }, { value: "closed", label: "Cerrada" }] }, { key: "logo", label: "Logo", type: "file", full: true }]}
            onSave={f => processAndSaveAirline(f, true)} onCancel={() => setShowAdd(false)} />
        </div></div>
      )}
      <div className="page-header"><div><div className="page-title">AEROLÍNEAS</div><div className="page-sub">{airlines.length} registradas · clic para ver detalles</div></div><button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Nueva Aerolínea</button></div>
      {pieData.length > 0 && <div className="card" style={{ marginBottom: 20 }}><div className="sec-title" style={{ marginBottom: 14 }}>Distribución de vuelos por aerolínea</div><PieChart data={pieData} size={140} /></div>}
      <div className="grid-2">
        {airlines.map(al => (
          <div key={al.id} className="entity-card" onClick={() => setSelected(al.id)}>
            <div className="entity-logo">{al.logo ? <img src={al.logo} alt="" /> : <span>{al.iata || "✈"}</span>}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div className="entity-name">{al.name}</div><div className="entity-sub">{al.country} · {al.iata}</div></div>
            <span className={`badge ${al.status === "active" ? "badge-green" : "badge-red"}`}>{al.status === "active" ? "ACTIVA" : "CERRADA"}</span>
          </div>
        ))}
      </div>
      {airlines.length === 0 && <div className="empty-state"><div className="empty-icon">🏢</div><div className="empty-text">Sin aerolíneas</div></div>}
    </div>
  );
}

/* ═══════════ PLANES PAGE ═══════════ */
function PlanesPage({ planes, setPlanes, flights, airlines }) {
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const del = async (id) => {
    if (API_READY) { try { await callApi('deletePlane', { id: String(id) }); } catch(e) {} }
    setPlanes(p => p.filter(a => a.id !== id)); setSelected(null);
  };

  const processAndSavePlane = async (f, isNew) => {
    const data = { ...f };
    if (data.logo && data.logo.startsWith('data:')) {
      try {
        const { fileId, url } = await uploadToDrive(data.logo, 'plane');
        data.logoUrl = url; data.logoFileId = fileId; data.logo = url;
      } catch(e) { console.error('Error logo Drive:', e); }
    }
    if (isNew) {
      if (API_READY) {
        try { const res = await callApi('savePlane', { data }); data.id = Number(res.id); }
        catch(e) { data.id = Date.now(); }
      } else { data.id = Date.now(); }
      setPlanes(p => [...p, data]); setShowAdd(false);
    } else {
      if (API_READY) { try { await callApi('updatePlane', { data }); } catch(e) {} }
      setPlanes(p => p.map(a => a.id === data.id ? data : a)); setEditing(false);
    }
  };

  const pieData = planes.map(pl => ({ label: `${pl.brand} ${pl.model}`, value: flights.filter(f => f.planeId === pl.id && f.status === "flown").length })).filter(d => d.value > 0);

  if (selected) {
    const pl = planes.find(p => p.id === selected) || {};
    const plF = flights.filter(f => f.planeId === pl.id);
    const plAirlines = [...new Set(plF.map(f => f.airlineId).filter(Boolean))].map(id => airlines.find(a => a.id === id)).filter(Boolean);
    if (editing) return (
      <div className="page">
        <div className="page-header"><div className="page-title">EDITAR {pl.brand} {pl.model}</div><button className="btn btn-ghost" onClick={() => setEditing(false)}>← Volver</button></div>
        <EntityEditForm data={pl} fields={[{ key: "brand", label: "Fabricante" }, { key: "model", label: "Modelo" }, { key: "type", label: "Tipo", full: true }, { key: "logo", label: "Imagen del avión", type: "file", full: true }]}
          onSave={f => processAndSavePlane(f, false)} onCancel={() => setEditing(false)} />
      </div>
    );
    return (
      <div className="page">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="entity-logo" style={{ width: 64, height: 64 }}>{pl.logo ? <img src={pl.logo} alt="" /> : <span style={{ fontSize: 30 }}>✈</span>}</div>
            <div><div className="page-title">{pl.brand} {pl.model}</div><div className="page-sub">{pl.type}</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏ Editar</button>
            <button className="btn btn-danger" onClick={() => del(pl.id)}>🗑</button>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>← Volver</button>
          </div>
        </div>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {[["Vuelos totales", plF.length, "var(--blue)"], ["Volados", plF.filter(f => f.status === "flown").length, "var(--green)"], ["Aerolíneas", plAirlines.length, "var(--accent)"]].map(([l, v, c]) => (
            <div key={l} className="stat-card"><div className="stat-value" style={{ color: c }}>{v}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}><div className="sec-title">AEROLÍNEAS QUE LO OPERARON</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {plAirlines.length === 0 ? <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>Sin datos</div> : plAirlines.map(al => (
              <div key={al.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--sky)", borderRadius: 10, padding: "8px 12px", border: "1.5px solid var(--border)" }}>
                <LogoBox src={al.logo} fallback={al.iata} size={24} /><span style={{ fontSize: 13, fontWeight: 600 }}>{al.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div><div className="sec-title">VUELOS EN ESTE AVIÓN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plF.length === 0 ? <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>Sin vuelos</div> : plF.map(f => {
              const al = airlines.find(a => a.id === f.airlineId);
              return (
                <div key={f.id} className="mini-flight">
                  <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--blue)" }}>{f.from}</span>
                  <span style={{ color: "var(--muted)" }}>→</span>
                  <span style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--blue)" }}>{f.to}</span>
                  <span style={{ fontSize: 12, color: "var(--muted2)" }}>{f.fromCity} → {f.toCity}</span>
                  {al && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><LogoBox src={al.logo} fallback={al.iata} size={16} /><span style={{ fontSize: 11, color: "var(--muted)" }}>{al.name}</span></div>}
                  <span style={{ marginLeft: "auto", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)" }}>{f.date}</span>
                  <span className={`badge ${f.status === "flown" ? "badge-green" : "badge-orange"}`}>{f.status === "flown" ? "✓" : "⏳"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      {showAdd && (
        <div className="modal-overlay"><div className="modal"><div className="modal-header"><div className="modal-title">NUEVO AVIÓN</div><button className="btn-icon" onClick={() => setShowAdd(false)}>✕</button></div>
          <EntityEditForm data={{ brand: "", model: "", type: "", logo: "" }} fields={[{ key: "brand", label: "Fabricante", placeholder: "Boeing" }, { key: "model", label: "Modelo", placeholder: "737-800" }, { key: "type", label: "Tipo", placeholder: "Narrow-body", full: true }, { key: "logo", label: "Imagen", type: "file", full: true }]}
            onSave={f => processAndSavePlane(f, true)} onCancel={() => setShowAdd(false)} />
        </div></div>
      )}
      <div className="page-header"><div><div className="page-title">FLOTA DE AVIONES</div><div className="page-sub">{planes.length} modelos · clic para ver detalles</div></div><button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Nuevo Avión</button></div>
      {pieData.length > 0 && <div className="card" style={{ marginBottom: 20 }}><div className="sec-title" style={{ marginBottom: 14 }}>Vuelos por tipo de aeronave</div><PieChart data={pieData} size={140} /></div>}
      <div className="grid-2">
        {planes.map(pl => (
          <div key={pl.id} className="entity-card" onClick={() => setSelected(pl.id)}>
            <div className="entity-logo">{pl.logo ? <img src={pl.logo} alt="" /> : <span style={{ fontSize: 26 }}>✈</span>}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div className="entity-name">{pl.brand} {pl.model}</div><div className="entity-sub">{pl.type}</div></div>
            <span className="badge badge-blue">{flights.filter(f => f.planeId === pl.id && f.status === "flown").length} vuelos</span>
          </div>
        ))}
      </div>
      {planes.length === 0 && <div className="empty-state"><div className="empty-icon">✈</div><div className="empty-text">Sin aviones</div></div>}
    </div>
  );
}

/* ═══════════ STATS PAGE ═══════════ */
function StatsPage({ flights, airlines, planes }) {
  const flown = flights.filter(f => f.status === "flown");
  const totalKm = flown.reduce((s, f) => s + (f.distance || 0), 0);
  const destinations = [...new Set(flown.map(f => f.to))].length;
  const byAirline = airlines.map(al => ({ label: al.name, value: flown.filter(f => f.airlineId === al.id).length })).filter(d => d.value > 0);
  const byPlane = planes.map(pl => ({ label: `${pl.brand} ${pl.model}`, value: flown.filter(f => f.planeId === pl.id).length })).filter(d => d.value > 0);
  const byMonth = {};
  flown.forEach(f => { const m = f.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + 1; });
  const months = Object.entries(byMonth).sort();
  const maxMonth = Math.max(...months.map(m => m[1]), 1);
  const withDist = flown.filter(f => f.distance > 0);
  const longest = withDist.length ? withDist.reduce((a, b) => b.distance > a.distance ? b : a, withDist[0]) : null;
  const shortest = withDist.length ? withDist.reduce((a, b) => b.distance < a.distance ? b : a, withDist[0]) : null;

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">ESTADÍSTICAS DE VUELO</div><div className="page-sub">Tu actividad aérea completa</div></div>
      <div className="grid-4" style={{ marginBottom: 22 }}>
        {[["Vuelos realizados", flown.length, "var(--blue)"], ["Destinos visitados", destinations, "var(--green)"], ["Kilómetros volados", totalKm.toLocaleString(), "var(--accent)"], ["Aerolíneas usadas", byAirline.length, "#6A1B9A"]].map(([l, v, c]) => (
          <div key={l} className="stat-card"><div className="stat-value" style={{ color: c }}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      {(longest || shortest) && (
        <div className="grid-2" style={{ marginBottom: 22 }}>
          {longest && (
            <div className="record-card">
              <div className="record-label">🏆 VUELO MÁS LARGO</div>
              <div className="record-route">{longest.from} → {longest.to}</div>
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 8 }}>{longest.fromCity} → {longest.toCity}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div><div className="fm-l">Distancia</div><div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--blue)" }}>{longest.distance.toLocaleString()} km</div></div>
                <div><div className="fm-l">Duración</div><div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--blue)" }}>{longest.duration}</div></div>
                {longest.airline && <div><div className="fm-l">Aerolínea</div><div className="fm-v" style={{ fontSize: 13 }}>{longest.airline}</div></div>}
                <div><div className="fm-l">Fecha</div><div className="fm-v" style={{ fontSize: 13 }}>{longest.date}</div></div>
              </div>
            </div>
          )}
          {shortest && shortest.id !== longest?.id && (
            <div className="record-card">
              <div className="record-label">📏 VUELO MÁS CORTO</div>
              <div className="record-route">{shortest.from} → {shortest.to}</div>
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 8 }}>{shortest.fromCity} → {shortest.toCity}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div><div className="fm-l">Distancia</div><div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{shortest.distance.toLocaleString()} km</div></div>
                <div><div className="fm-l">Duración</div><div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{shortest.duration}</div></div>
                {shortest.airline && <div><div className="fm-l">Aerolínea</div><div className="fm-v" style={{ fontSize: 13 }}>{shortest.airline}</div></div>}
                <div><div className="fm-l">Fecha</div><div className="fm-v" style={{ fontSize: 13 }}>{shortest.date}</div></div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="grid-2" style={{ marginBottom: 22 }}>
        <div className="card"><div className="sec-title" style={{ marginBottom: 14 }}>Por aerolínea</div><PieChart data={byAirline} size={130} /></div>
        <div className="card"><div className="sec-title" style={{ marginBottom: 14 }}>Por tipo de avión</div><PieChart data={byPlane} size={130} /></div>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="sec-title" style={{ marginBottom: 16 }}>Actividad mensual</div>
        {months.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "'Share Tech Mono',monospace" }}>Sin datos</div> : months.map(([m, count]) => (
          <div key={m} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", color: "var(--text2)" }}>{m}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{count} vuelo{count > 1 ? "s" : ""}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(count / maxMonth) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      {totalKm > 0 && (
        <div className="card" style={{ background: "linear-gradient(135deg,var(--navy) 0%,var(--navy2) 100%)", border: "none", color: "#fff" }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Distancia en perspectiva</div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[["🌍", (totalKm / 40075).toFixed(2) + "×", "vueltas al mundo"], ["🌙", (totalKm / 384400).toFixed(3) + "×", "a la Luna"], ["✈", Math.floor(totalKm / 850) + "h", "vuelo aprox."]].map(([ic, v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{ic}</div>
                <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 26, fontWeight: 800, color: "#90CAF9" }}>{v}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ ROOT APP ═══════════ */
const NAV = [
  { id: "upcoming", icon: "⏳", label: "Programados" },
  { id: "flown", icon: "✅", label: "Historial" },
  { id: "map", icon: "🗺", label: "Mapa" },
  { id: "planes", icon: "✈", label: "Aviones" },
  { id: "airlines", icon: "🏢", label: "Aerolíneas" },
  { id: "stats", icon: "📊", label: "Estadísticas" },
];

export default function App() {
  const [page, setPage]         = useState("upcoming");
  const [flights, setFlights]   = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [planes, setPlanes]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [apiOk, setApiOk]       = useState(false);

  useEffect(() => {
    if (!API_READY) {
      setFlights(INIT_FLIGHTS); setAirlines(INIT_AIRLINES); setPlanes(INIT_PLANES);
      setLoading(false); return;
    }
    callApi('getAll')
      .then(d => {
        const n = v => (v !== '' && v != null) ? Number(v) : null;
        setFlights((d.flights||[]).map(r => ({
          ...r, id: String(r.id),
          airlineId: n(r.airlineId), planeId: n(r.planeId),
          distance: n(r.distance)||0,
          fromLat: n(r.fromLat), fromLng: n(r.fromLng),
          toLat: n(r.toLat), toLng: n(r.toLng),
          // photoUrl viene de Drive; photo solo para preview local
          photo: r.photoUrl || '',
        })).filter(r => r.id));
        setAirlines((d.airlines||[]).map(r => ({
          ...r, id: Number(r.id), logo: r.logoUrl || r.logo || '',
        })).filter(r => r.id));
        setPlanes((d.planes||[]).map(r => ({
          ...r, id: Number(r.id), logo: r.logoUrl || r.logo || '',
        })).filter(r => r.id));
        setApiOk(true);
      })
      .catch(() => {
        setFlights(INIT_FLIGHTS); setAirlines(INIT_AIRLINES); setPlanes(INIT_PLANES);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = flights.filter(f => f.status === "upcoming").length;
  const flown    = flights.filter(f => f.status === "flown").length;
  const totalKm  = flights.reduce((s, f) => s + (f.status === "flown" ? (Number(f.distance)||0) : 0), 0);

  const NAV_ALL = [
    { id:"upcoming", icon:"⏳", label:"Programados" },
    { id:"flown",    icon:"✅", label:"Historial" },
    { id:"map",      icon:"🗺", label:"Mapa" },
    { id:"planes",   icon:"✈", label:"Aviones" },
    { id:"airlines", icon:"🏢", label:"Aerolíneas" },
    { id:"stats",    icon:"📊", label:"Stats" },
  ];

  if (loading) return (
    <>
      <style>{FONTS}{STYLE}</style>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100dvh',background:'var(--sky)',gap:16}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:30,fontWeight:800,color:'var(--navy)',letterSpacing:2}}>✈ FLIGHTLOG</div>
        <div style={{display:'flex',gap:8}}>
          {[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:'50%',background:'var(--blue)',animation:`fl ${1.2}s ${i*0.3}s infinite ease-in-out`}}/>)}
        </div>
        <style>{`@keyframes fl{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <style>{FONTS}{STYLE}</style>
      <div className="app">

        {/* Sidebar — desktop y tablet */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">✈</div>
            <div><div className="logo-text">FLIGHTLOG</div><div className="logo-sub">PERSONAL TRACKER</div></div>
          </div>
          <nav className="nav">
            <div className="nav-section">VUELOS</div>
            {NAV_ALL.slice(0,3).map(n => (
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
                {n.id==="upcoming" && upcoming>0 && <span className="nav-badge">{upcoming}</span>}
              </div>
            ))}
            <div className="nav-section">FLOTA</div>
            {NAV_ALL.slice(3).map(n => (
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div className="sidebar-stats">
            <div>Vuelos <span className="sidebar-stat-val">{flown} realizados · {upcoming} prog.</span></div>
            <div>Total <span className="sidebar-stat-val">{totalKm.toLocaleString()} km</span></div>
            <div style={{marginTop:4,display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:apiOk?'#2dd4a0':'#f8a93d'}}/>
              <span style={{fontSize:9}}>{apiOk?'Google Sheets ✓':'Modo demo'}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main className="main">
          {page==="upcoming" && <FlightsPage flights={flights} setFlights={setFlights} airlines={airlines} planes={planes} statusFilter="upcoming"/>}
          {page==="flown"    && <FlightsPage flights={flights} setFlights={setFlights} airlines={airlines} planes={planes} statusFilter="flown"/>}
          {page==="map"      && <MapPage flights={flights} />}
          {page==="planes"   && <PlanesPage planes={planes} setPlanes={setPlanes} flights={flights} airlines={airlines} />}
          {page==="airlines" && <AirlinesPage airlines={airlines} setAirlines={setAirlines} flights={flights} />}
          {page==="stats"    && <StatsPage flights={flights} airlines={airlines} planes={planes} />}
        </main>

        {/* Bottom nav — solo móvil (CSS lo activa en ≤600px) */}
        <nav className="bottom-nav">
          {NAV_ALL.map(n => (
            <div key={n.id} className={`bottom-nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span className="bottom-nav-icon">{n.icon}</span>
              <span className="bottom-nav-lbl">{n.label}</span>
              {n.id==="upcoming" && upcoming>0 && <span className="bottom-nav-badge">{upcoming}</span>}
            </div>
          ))}
        </nav>

      </div>
    </>
  );
}
