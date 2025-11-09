// technician.js - enhanced with auto-generate Technician ID and UI polish
let ORDERS = JSON.parse(localStorage.getItem('nsix_orders') || '[]');
let TECHS = JSON.parse(localStorage.getItem('nsix_techs') || '[]');
let CURRENT = JSON.parse(localStorage.getItem('nsix_current_tech') || 'null');

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function generateTechCode(){
  const n = Math.floor(1000 + Math.random()*9000);
  return 'TC-' + n;
}

function renderIncoming(){
  const el = $('#incoming');
  const pending = ORDERS.filter(o=>o.status==='pending');
  if(pending.length===0){ el.innerHTML = '<div class="text-slate-400">No incoming orders</div>'; return; }
  el.innerHTML = '';
  pending.forEach(o=>{
    const it = document.createElement('div');
    it.className = 'p-4 rounded bg-slate-900/30 flex justify-between items-start shadow';
    it.innerHTML = `<div><div class="font-semibold">${o.serviceTitle}</div><div class="text-sm text-slate-400">${o.customerName} • ${o.address}</div><div class="text-xs text-slate-500">Jadwal: ${new Date(o.scheduledAt).toLocaleString()}</div></div><div class="flex flex-col gap-2"><button class="btn-accept px-3 py-1 rounded bg-nsix text-black" data-id="${o.id}">Terima</button></div>`;
    el.appendChild(it);
  });
  $$('.btn-accept').forEach(b=>b.onclick = e=> acceptOrder(e.target.getAttribute('data-id')));
}

function renderAssigned(){
  const el = $('#assigned');
  const myId = CURRENT ? CURRENT.code : null;
  const assigned = ORDERS.filter(o=> o.technicianId === myId);
  if(!CURRENT){ el.innerHTML = '<div class="text-slate-400">Belum login</div>'; return; }
  if(assigned.length===0){ el.innerHTML = '<div class="text-slate-400">No assigned orders</div>'; return; }
  el.innerHTML = '';
  assigned.forEach(o=>{
    const it = document.createElement('div');
    it.className = 'p-4 rounded bg-slate-900/30 flex justify-between items-start shadow';
    it.innerHTML = `<div><div class="font-semibold">${o.serviceTitle}</div><div class="text-sm text-slate-400">${o.customerName}</div><div class="text-xs text-slate-500">Status: <span class="text-nsix">${o.status}</span></div></div><div class="flex flex-col gap-2">${renderTechControls(o)}</div>`;
    el.appendChild(it);
  });
  $$('.btn-start').forEach(b=>b.onclick = e=> updateStatus(e.target.getAttribute('data-id'),'in_progress'));
  $$('.btn-complete').forEach(b=>b.onclick = e=> updateStatus(e.target.getAttribute('data-id'),'completed'));
}

function renderTechControls(o){
  if(o.status==='accepted') return `<button class="btn-start px-3 py-1 rounded bg-nsix text-black" data-id="${o.id}">Mulai</button>`;
  if(o.status==='in_progress') return `<button class="btn-complete px-3 py-1 rounded bg-nsix text-black" data-id="${o.id}">Selesai</button>`;
  return '';
}

function acceptOrder(id){
  const tech = CURRENT;
  if(!tech) return alert('Login/Register dulu');
  ORDERS = ORDERS.map(o=> o.id===id? {...o, status: 'accepted', technicianId: tech.code } : o);
  localStorage.setItem('nsix_orders', JSON.stringify(ORDERS));
  renderIncoming(); renderAssigned();
}

function updateStatus(id, status){
  ORDERS = ORDERS.map(o=> o.id===id? {...o, status } : o);
  localStorage.setItem('nsix_orders', JSON.stringify(ORDERS));
  renderAssigned(); renderIncoming();
}

function renderTechInfo(){
  const el = $('#tech-info');
  if(!CURRENT){ el.innerHTML = '<div class="text-slate-400">Belum login</div>'; return; }
  el.innerHTML = `<div class="text-slate-100"><div class="font-semibold">${CURRENT.name}</div><div class="text-sm text-slate-400">ID: ${CURRENT.code}</div></div>`;
  $('#btn-logout').classList.remove('hidden');
}

$('#btn-register').onclick = ()=>{
  const name = $('#t-name').value.trim();
  const phone = $('#t-phone').value.trim();
  if(!name||!phone) return alert('Lengkapi data');
  const code = generateTechCode();
  const tech = { id: 'T' + Date.now(), name, phone, code };
  TECHS.push(tech);
  localStorage.setItem('nsix_techs', JSON.stringify(TECHS));
  CURRENT = tech;
  localStorage.setItem('nsix_current_tech', JSON.stringify(CURRENT));
  renderTechInfo(); renderAssigned(); renderIncoming();
  alert('Registered. Your Technician ID: ' + code);
};

$('#btn-login-code').onclick = ()=>{
  const code = $('#t-code').value.trim();
  if(!code) return alert('Masukkan code');
  const tech = TECHS.find(t=>t.code===code);
  if(!tech) return alert('Tech ID not found');
  CURRENT = tech;
  localStorage.setItem('nsix_current_tech', JSON.stringify(CURRENT));
  renderTechInfo(); renderAssigned(); renderIncoming();
};

$('#btn-logout').onclick = ()=>{
  CURRENT = null; localStorage.removeItem('nsix_current_tech'); $('#btn-logout').classList.add('hidden'); renderTechInfo();
};

// init
renderIncoming(); renderAssigned(); renderTechInfo();
