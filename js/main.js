/* ---------- js/main.js ---------- */

// helpers de selección
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const proyectoInput     = $('#proyecto');
const anchoInput        = $('#ancho');
const altoInput         = $('#alto');
const hojasInput        = $('#hojas');
const modoHojasRadios   = $$('input[name="modoHojas"]');
const direccionRadios   = $$('input[name="direccionParantes"]');

const resumenCard       = $('#resumenCotizacion');
const enviarBtn         = $('#guardarCotizacionBtn');

const step1 = $('#collapseStep1');
const step2 = $('#collapseStep2');
const step3 = $('#collapseStep3');
const step4 = $('#collapseFour');

const pasos = [
{ btn: $('#nextStep1'), collapse: step1, inputs: ['proyecto'] },
{ btn: $('#nextStep2'), collapse: step2, inputs: ['ancho', 'alto'] },
{ btn: $('#nextStep3'), collapse: step3, inputs: ['hojas', 'modoHojas'] },
{ btn: null,          collapse: step4, inputs: ['direccionParantes'] },
];

/* ---------- SweetAlert helpers ---------- */
async function confirmAction(msg) {
const res = await Swal.fire({
    title: msg,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
});
return res.isConfirmed;
}
function mostrarError(msg) {
Swal.fire({ icon: 'error', title: 'Error', text: msg });
}
function alertSuccess(msg) {
Swal.fire({ icon: 'success', title: '¡Éxito!', text: msg, timer: 2200, showConfirmButton: false });
}
window.confirmAction = confirmAction;

async function abrirPopupResumen(obj) {
const html = `
    <div style="text-align:left">
    <p><strong>Proyecto:</strong> ${obj.proyecto}</p>
    <p><strong>Ancho del vano:</strong> ${obj.ancho} m</p>
    <p><strong>Alto del vano:</strong> ${obj.alto} m</p>
    <p><strong>Hojas:</strong> ${obj.hojas}</p>
    <p><strong>Ancho por hoja:</strong> ${obj.anchoHoja.toFixed(2)} m</p>
    <p><strong>Dirección parantes:</strong> ${obj.direccion}</p>
    </div>
`;
return Swal.fire({
    title: 'Resumen de tu proyecto',
    html,
    icon: 'info',
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Guardar cotización',
    denyButtonText: 'Editar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3085d6',
    denyButtonColor: '#6c757d',
    cancelButtonColor: '#d33'
});
}
window.abrirPopupResumen = abrirPopupResumen;

/* ---------- Lógica de hojas ---------- */
function actualizarModoHojas() {
const sel  = document.querySelector('input[name="modoHojas"]:checked');
const modo = sel ? sel.value : 'elige';
const block = $('#eligeHojasBlock');
if (!block) return;
if (modo === 'elige') {
    block.style.display = '';
} else {
    block.style.display = 'none';
    if (hojasInput) hojasInput.value = '';
}
}
modoHojasRadios.forEach(r => r.addEventListener('change', actualizarModoHojas));

/* ---------- Validaciones ---------- */
function validarPaso(stepIndex) {
try {
    if (stepIndex === 0) {
    if (!proyectoInput.value.trim()) throw new Error('Debes ingresar un nombre de proyecto.');
    }
    if (stepIndex === 1) {
    const ancho = parseFloat(anchoInput.value);
    const alto  = parseFloat(altoInput.value);
    if (isNaN(ancho) || ancho <= 0) throw new Error('El ancho debe ser mayor que 0.');
    if (isNaN(alto)  || alto  <= 0) throw new Error('El alto debe ser mayor que 0.');
    if (alto > 5) throw new Error('El alto no puede ser mayor a 5 m.');
    }
    if (stepIndex === 2) {
    const modo = document.querySelector('input[name="modoHojas"]:checked')?.value || 'recomienda';
    if (modo === 'elige') {
        const hojas = parseInt(hojasInput.value, 10);
        if (isNaN(hojas) || hojas < 1) throw new Error('Ingresa una cantidad válida de hojas (entero ≥ 1).');
    }
    }
    return true;
} catch (e) {
    mostrarError(e.message);
    return false;
}
}

/* ---------- Cálculos y resumen ---------- */
function calcularCantidadHojas(ancho) {
const modo = document.querySelector('input[name="modoHojas"]:checked')?.value || 'recomienda';
if (modo === 'elige') {
    const hojas = parseInt(hojasInput.value, 10);
    const anchoHoja = hojas > 0 ? (ancho / hojas) : ancho;
    return { hojas, anchoHoja };
}
let hojas = Math.floor(ancho);
if (hojas < 1) hojas = 1;
let anchoHoja = ancho / hojas;
while (anchoHoja > 3) {
    hojas++;
    anchoHoja = ancho / hojas;
}
return { hojas, anchoHoja };
}
function obtenerDireccion() {
const sel = document.querySelector('input[name="direccionParantes"]:checked');
return sel ? sel.value : 'Verticales';
}
function construirResumenObjeto() {
const medidas = { ancho: parseFloat(anchoInput.value), alto: parseFloat(altoInput.value) };
const reparto = calcularCantidadHojas(medidas.ancho);
return {
    id: Date.now(),
    proyecto: proyectoInput.value.trim(),
    ancho: medidas.ancho,
    alto: medidas.alto,
    hojas: reparto.hojas,
    anchoHoja: reparto.anchoHoja,
    direccion: obtenerDireccion(),
    fecha: new Date().toISOString()
};
}
function mostrarResumenEnPantalla(obj) {
if (!enviarBtn) return;
enviarBtn.dataset.obj = JSON.stringify(obj);
if (resumenCard) resumenCard.classList.add('d-none');
}

function resetFormulario() {
proyectoInput.value = '';
anchoInput.value = '';
altoInput.value = '';
hojasInput.value = '';

const elige = $('#modoElige');
const recomienda = $('#modoRecomienda');
if (elige) elige.checked = true;
if (recomienda) recomienda.checked = false;
actualizarModoHojas();

const dirVert = $$('input[name="direccionParantes"]').find(r => r.value === 'Verticales');
if (dirVert) dirVert.checked = true;

if (resumenCard) resumenCard.classList.add('d-none');

if (step1) bootstrap.Collapse.getOrCreateInstance(step1, { toggle: false }).show();
if (step2) bootstrap.Collapse.getOrCreateInstance(step2, { toggle: false }).hide();
if (step3) bootstrap.Collapse.getOrCreateInstance(step3, { toggle: false }).hide();
if (step4) bootstrap.Collapse.getOrCreateInstance(step4, { toggle: false }).hide();
}

pasos.forEach((p, i) => {
if (!p.btn) return;
p.btn.addEventListener('click', () => {
    if (!validarPaso(i)) return;
    const col = bootstrap.Collapse.getOrCreateInstance(p.collapse, { toggle: false });
    col.hide();
    const next = pasos[i + 1];
    if (next) bootstrap.Collapse.getOrCreateInstance(next.collapse, { toggle: false }).show();
    if (next && next.collapse === document.getElementById('collapseFour')) {
    const resumen = construirResumenObjeto();
    mostrarResumenEnPantalla(resumen);
    }
});
});

direccionRadios.forEach(r => {
r.addEventListener('change', () => {
    const raw = enviarBtn.dataset.obj;
    if (raw) {
    const obj = JSON.parse(raw);
    obj.direccion = obtenerDireccion();
    mostrarResumenEnPantalla(obj);
    enviarBtn.dataset.obj = JSON.stringify(obj);
    }
});
});

enviarBtn?.addEventListener('click', async () => {
try {
    const obj = construirResumenObjeto();
    mostrarResumenEnPantalla(obj);
    const res = await abrirPopupResumen(obj);
    if (res.isDenied) return;     
    if (!res.isConfirmed) return; 
    guardarEnStorage(obj);       
    renderLista();                
    resetFormulario();
    alertSuccess('¡Gracias! Tu proyecto fue guardado en el historial.');
} catch (e) {
    mostrarError(e.message);
}
});
/* ---------- Inicio ---------- */
document.addEventListener('DOMContentLoaded', async () => {
await cargarSemillaHistorial(); 
renderLista();                 
actualizarModoHojas();
});
