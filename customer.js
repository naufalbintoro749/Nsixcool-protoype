// customer.js - enhanced UI with Tailwind dark design
const SERVICES = [
  { id: 's1', title: 'Cuci AC + Vacuum', price: 120000, desc: 'Pembersihan lengkap, vacuum, cek kebocoran.' },
  { id: 's2', title: 'Service + Isi Freon', price: 350000, desc: 'Pengecekan komponen & isi freon.' },
  { id: 's3', title: 'Ganti Kompresor', price: 1500000, desc: 'Estimasi penggantian kompresor.' }
];

let CART = [];
let ORDERS = JSON.parse(localStorage.getItem('nsix_orders') || '[]');

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function formatIDR(n){ return 'Rp ' + n.toLocaleString('id-ID'); }

function renderServices(){
  const wrap = $('#services');
  wrap.innerHTML = '';
  SERVICES.forEach(s => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-lg bg-slate-900/30 hover:scale-[1.02] transition shadow-inner';
    card.innerHTML = `
      <div class="flex justify-between items-start gap-3">
        <div>
          <h4 class="font-semibold">${s.title}</h4>
          <p class="text-sm text-slate-400">${s.desc}</p>
          <div class="mt-2 text-nsix font-bold">${formatIDR(s.price)}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button class="btn-add px-3 py-1 rounded bg-nsix text-black" data-id="${s.id}">Pesan</button>
        </div>
      </div>`;
    wrap.appendChild(card);
  });
}

function updateCart(){
  const el = $('#cart');
  if(CART.length===0){ el.innerHTML = 'Belum ada layanan'; return; }
  el.innerHTML = '';
  CART.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center bg-slate-900/30 p-2 rounded';
    row.innerHTML = `<div><div class="font-semibold">${c.title}</div><div class="text-slate-400 text-sm">${formatIDR(c.price)}</div></div><div><button class="btn-remove text-sm px-2 py-1 rounded bg-slate-700" data-i="${i}">Hapus</button></div>`;
    el.appendChild(row);
  });
}

function saveOrders(){ localStorage.setItem('nsix_orders', JSON.stringify(ORDERS)); }

function renderOrdersList(){
  const el = $('#orders-list');
  const list = ORDERS.slice().reverse();
  if(list.length===0){ el.innerHTML = '<div class="text-slate-400">Belum ada pesanan</div>'; return; }
  el.innerHTML = '';
  list.forEach(o => {
    const it = document.createElement('div');
    it.className = 'p-4 rounded bg-slate-900/30 flex justify-between items-start shadow';
    it.innerHTML = `<div><div class="font-semibold">${o.serviceTitle}</div><div class="text-sm text-slate-400">${o.customerName} - ${o.address}</div><div class="text-xs text-slate-500">Status: <span class="text-nsix">${o.status}</span> ${o.technicianId ? '<span class="text-slate-300">• ' + o.technicianId + '</span>' : ''}</div></div><div class="text-right"><div class="font-semibold">${formatIDR(o.price)}</div></div>`;
    el.appendChild(it);
  });
}

function showOrdersPanel(show=true){ $('#orders-area').classList.toggle('hidden', !show); }

// events
document.addEventListener('click', e => {
  const t = e.target;
  if(t.matches('.btn-add')){
    const id = t.getAttribute('data-id');
    const s = SERVICES.find(x=>x.id===id);
    CART.push({ id: s.id, title: s.title, price: s.price });
    updateCart();
  }
  if(t.matches('.btn-remove')){
    const i = +t.getAttribute('data-i');
    CART.splice(i,1); updateCart();
  }
});

$('#btn-checkout').onclick = () => {
  if(CART.length===0) return alert('Cart kosong');
  $('#modal').classList.remove('hidden');
};
$('#modal-cancel').onclick = ()=> $('#modal').classList.add('hidden');

$('#modal-confirm').onclick = ()=> {
  const name = $('#c-name').value.trim();
  const phone = $('#c-phone').value.trim();
  const address = $('#c-address').value.trim();
  const sched = $('#c-sched').value;
  if(!name||!phone||!address||!sched) return alert('Lengkapi data');
  const item = CART[0];
  const order = {
    id: 'O' + Date.now(),
    serviceId: item.id,
    serviceTitle: item.title,
    price: item.price,
    customerName: name,
    phone, address,
    scheduledAt: sched,
    status: 'pending',
    technicianId: null
  };
  ORDERS.push(order); saveOrders();
  CART = []; updateCart(); $('#modal').classList.add('hidden'); renderOrdersList(); alert('Order berhasil dibuat');
};

$('#btn-orders').onclick = ()=> showOrdersPanel(true);
$('#close-orders').onclick = ()=> showOrdersPanel(false);
$('#btn-clear').onclick = ()=> { CART=[]; updateCart(); };

// init
renderServices(); updateCart(); renderOrdersList();
