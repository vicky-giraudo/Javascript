// historial.js
const KEY_STORAGE = 'cotizacionesParasoles';

function leerStorage() {
try {
    const raw = localStorage.getItem(KEY_STORAGE);
    return raw ? JSON.parse(raw) : [];
} catch {
    return [];
}
}
function escribirStorage(arr) {
localStorage.setItem(KEY_STORAGE, JSON.stringify(arr));
}
function guardarEnStorage(obj) {
const arr = leerStorage();
arr.push(obj);
escribirStorage(arr);
}

window.leerStorage = leerStorage;
window.escribirStorage = escribirStorage;
window.guardarEnStorage = guardarEnStorage;

const listaCotizaciones = document.getElementById('listaCotizaciones');
const vaciarStorageBtn  = document.getElementById('vaciarStorage');

function montarToolbarHistorial() {
const wrapId = 'toolbarHistorial';
if (document.getElementById(wrapId)) return;

const wrap = document.createElement('div');
wrap.id = wrapId;
wrap.className = 'mb-2';
wrap.innerHTML = `
    <input id="buscaProyecto" type="text" class="form-control form-control-sm mb-2" placeholder="Buscar proyecto...">
    <select id="ordenHistorial" class="form-select form-select-sm" aria-label="Ordenar historial">
    <option value="fecha_desc">Más recientes</option>
    <option value="fecha_asc">Más antiguos</option>
    <option value="ancho_desc">Ancho (↓)</option>
    <option value="ancho_asc">Ancho (↑)</option>
    </select>
`;
if (listaCotizaciones && listaCotizaciones.parentElement) {
    listaCotizaciones.parentElement.insertBefore(wrap, listaCotizaciones);
}
document.getElementById('buscaProyecto')?.addEventListener('input', renderLista);
document.getElementById('ordenHistorial')?.addEventListener('change', renderLista);
}

function renderLista() {
montarToolbarHistorial();

const data = leerStorage();
const txt = (document.getElementById('buscaProyecto')?.value || '').toLowerCase().trim();
const ord = document.getElementById('ordenHistorial')?.value || 'fecha_desc';

let arr = txt ? data.filter(c => (c.proyecto || '').toLowerCase().includes(txt)) : data;

const comp = {
    'fecha_desc': (a, b) => new Date(b.fecha) - new Date(a.fecha),
    'fecha_asc' : (a, b) => new Date(a.fecha) - new Date(b.fecha),
    'ancho_desc': (a, b) => (b.ancho || 0) - (a.ancho || 0),
    'ancho_asc' : (a, b) => (a.ancho || 0) - (b.ancho || 0),
}[ord];
if (comp) arr = arr.slice().sort(comp);

listaCotizaciones.innerHTML = '';
if (!arr.length) {
    listaCotizaciones.innerHTML = `<div class="text-muted small">No hay cotizaciones guardadas.</div>`;
    return;
}

arr.forEach((c) => {
    const item = document.createElement('div');
    item.className = 'card p-2';
    const fecha = c.fecha ? new Date(c.fecha).toLocaleString() : '';
    item.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
        <div>
        <div class="fw-semibold">${c.proyecto || '(sin nombre)'}</div>
        <div class="small text-muted">${fecha}</div>
        </div>
        <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-primary" data-ver="${c.id}">Ver</button>
        <button class="btn btn-sm btn-outline-danger"  data-del="${c.id}">Borrar</button>
        </div>
    </div>
    <div class="small mt-2">
        ${(c.ancho ?? '?')}×${(c.alto ?? '?')} m • ${c.hojas} hoja(s) • ${c.direccion || c.direccionParantes || ''}
    </div>
    `;

    item.querySelector('[data-ver]').addEventListener('click', async () => {
    if (window.abrirPopupResumen) await window.abrirPopupResumen(c);
    });

    item.querySelector('[data-del]').addEventListener('click', async () => {
    const ok = window.confirmAction ? await window.confirmAction('¿Eliminar esta cotización?') : confirm('¿Eliminar esta cotización?');
    if (!ok) return;
    const todos = leerStorage().filter(x => x.id !== c.id);
    escribirStorage(todos);
    renderLista();
    if (window.Swal) Swal.fire({icon:'success', title:'Cotización eliminada', timer:1500, showConfirmButton:false});
    });

    listaCotizaciones.appendChild(item);
});
}
window.renderLista = renderLista;

async function cargarSemillaHistorial() {
const loaderId = 'historialLoader';
const loader = document.createElement('div');
loader.id = loaderId;
loader.className = 'text-muted small my-2';
loader.textContent = 'Cargando historial inicial...';
if (listaCotizaciones && !document.getElementById(loaderId)) {
    listaCotizaciones.prepend(loader);
}
try {
    const res = await fetch('./data/cotizaciones.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo leer data/cotizaciones.json');
    const semilla = await res.json();
    if (!Array.isArray(semilla)) throw new Error('El JSON debe ser un array');

    const existentes = leerStorage();
    const ids = new Set(existentes.map(e => e.id));
    const fusion = existentes.concat(semilla.filter(x => !ids.has(x.id)));
    escribirStorage(fusion);
} catch (err) {
    if (window.Swal) Swal.fire({ icon: 'error', title: 'Error al cargar historial', text: err.message });
} finally {
    document.getElementById(loaderId)?.remove();
}
}
window.cargarSemillaHistorial = cargarSemillaHistorial;

vaciarStorageBtn?.addEventListener('click', async () => {
const ok = window.confirmAction ? await window.confirmAction('¿Eliminar todas las cotizaciones guardadas?') : confirm('¿Eliminar todas las cotizaciones guardadas?');
if (!ok) return;
localStorage.removeItem(KEY_STORAGE);
listaCotizaciones.innerHTML = `<div class="text-muted small">No hay cotizaciones guardadas.</div>`;
if (window.Swal) Swal.fire({icon:'success', title:'Historial eliminado', timer:1500, showConfirmButton:false});
});