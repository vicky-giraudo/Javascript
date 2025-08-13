//JAVA SCRIPT DEL COTIZADOR DE PARA SOLES
const KEY_STORAGE = 'cotizacionesParasoles';


const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------- DOM ---------- */
const form = $('#cotizadorForm');
const modoHojasRadios = $$('input[name="modoHojas"]');
const eligeHojasBlock = $('#eligeHojasBlock');
const hojasInput = $('#hojas');
const errorBox = $('#errorBox');

const resumenCard = $('#resumenCard');
const resumenText = $('#resumenText');
const enviarBtn = $('#enviarBtn');
const editarBtn = $('#editarBtn');

const listaCotizaciones = $('#listaCotizaciones');
const vaciarStorageBtn = $('#vaciarStorage');

function mostrarError(msg) {
if (errorBox) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
} else {
    console.error('errorBox no encontrado:', msg);
}
}
function ocultarError() {
if (errorBox) {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
}
}

function actualizarModoHojas() {
const sel = document.querySelector('input[name="modoHojas"]:checked');
const modo = sel ? sel.value : 'elige';
if (modo === 'elige') {
    if (eligeHojasBlock) eligeHojasBlock.style.display = '';
} else {
    if (eligeHojasBlock) eligeHojasBlock.style.display = 'none';
    if (hojasInput) hojasInput.value = '';
}
}
if (modoHojasRadios.length) modoHojasRadios.forEach(r => r.addEventListener('change', actualizarModoHojas));
document.addEventListener('DOMContentLoaded', actualizarModoHojas);

function obtenerMedidas() {
const ancho = parseFloat($('#ancho').value);
const alto = parseFloat($('#alto').value);
if (isNaN(ancho) || ancho <= 0) throw new Error('El ancho debe ser un número mayor que 0.');
if (isNaN(alto) || alto <= 0) throw new Error('El alto debe ser un número mayor que 0.');
if (alto > 5) throw new Error('Debes colocar un alto menor o igual a 5m por seguridad y performance.');
return { ancho, alto };
}

// Cantidad de hojas
function calcularCantidadHojas(ancho) {
const sel = document.querySelector('input[name="modoHojas"]:checked');
const modo = sel ? sel.value : 'recomienda';
if (modo === 'elige') {
    const hojas = parseInt(hojasInput.value);
    if (isNaN(hojas) || hojas < 1) throw new Error('Ingresa una cantidad válida de hojas (mínimo 1).');
    const anchoHoja = ancho / hojas;
    if (anchoHoja < 1) throw new Error(`Con ${hojas} hojas, cada una mide ${anchoHoja.toFixed(2)}m (<1m).`);
    if (anchoHoja > 3) throw new Error(`Con ${hojas} hojas, cada una mide ${anchoHoja.toFixed(2)}m (>3m).`);
    return { hojas, anchoHoja };
} else {

    let hojasRec = ancho - (ancho % 1);
    if (hojasRec < 1) hojasRec = 1;
    let anchoHojaRec = ancho / hojasRec;
    while (anchoHojaRec > 3) {
    hojasRec = hojasRec + 1;
    anchoHojaRec = ancho / hojasRec;
    }
    return { hojas: hojasRec, anchoHoja: anchoHojaRec };
}
}

function obtenerDireccion() {
const sel = document.querySelector('input[name="direccion"]:checked');
return sel ? sel.value : 'Verticales';
}

/* ---------- Storage ---------- */
function leerStorage() {
try {
    const raw = localStorage.getItem(KEY_STORAGE);
    if (!raw) return [];
    return JSON.parse(raw);
} catch (e) {
    console.warn('Error leyendo localStorage:', e);
    return [];
}
}

function guardarEnStorage(obj) {
const arr = leerStorage();
arr.push(obj);
localStorage.setItem(KEY_STORAGE, JSON.stringify(arr));
}

function renderLista() {

if (!listaCotizaciones) {
    console.warn('renderLista: #listaCotizaciones no existe en el DOM. Abortando render.');
    return;
}

const arr = leerStorage();
listaCotizaciones.innerHTML = '';
if (arr.length === 0) {
    listaCotizaciones.innerHTML = '<li>No hay cotizaciones guardadas.</li>';
    return;
}
arr.forEach((c, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
    <div>
        <strong>${c.proyecto}</strong> — ${c.ancho}m x ${c.alto}m — ${c.hojas} hojas (${c.anchoHoja.toFixed(2)}m)
        <div style="font-size:.85rem;color:#666;">${new Date(c.fecha).toLocaleString()}</div>
    </div>
    <div>
        <button data-idx="${idx}" class="btn-ver">Ver</button>
        <button data-idx="${idx}" class="btn-borrar secondary">Borrar</button>
    </div>
    `;
    listaCotizaciones.appendChild(li);
});

$$('.btn-ver').forEach(b => {
    b.addEventListener('click', (ev) => {
    const idx = Number(ev.currentTarget.dataset.idx);
    const arr = leerStorage();
    const c = arr[idx];
    if (c) {
        mostrarResumenEnPantalla(c, {guardarDisabled:true});
    }
    });
});
$$('.btn-borrar').forEach(b => {
    b.addEventListener('click', (ev) => {
    const idx = Number(ev.currentTarget.dataset.idx);
    const arr = leerStorage();
    arr.splice(idx,1);
    localStorage.setItem(KEY_STORAGE, JSON.stringify(arr));
    renderLista();
    });
});
}

/* ---------- Mostrar resumen ---------- */
function construirResumenObjeto({ proyecto, medidas, reparto, direccion }) {
return {
    id: Date.now(),
    proyecto,
    ancho: medidas.ancho,
    alto: medidas.alto,
    hojas: reparto.hojas,
    anchoHoja: reparto.anchoHoja,
    direccion,
    fecha: new Date().toISOString()
};
}

function mostrarResumenEnPantalla(obj, opts = {}) {

if (resumenText) {
    resumenText.textContent = [
    `Proyecto: ${obj.proyecto}`,
    `Ancho del vano: ${obj.ancho} m`,
    `Alto del vano: ${obj.alto} m`,
    `Hojas: ${obj.hojas}`,
    `Ancho por hoja: ${obj.anchoHoja.toFixed(2)} m`,
    `Dirección parantes: ${obj.direccion}`,
    ].join('\n');
}
if (resumenCard) resumenCard.classList.remove('hidden');

if (enviarBtn) {
    enviarBtn.disabled = !!opts.guardarDisabled;
    enviarBtn.dataset.obj = JSON.stringify(obj);
}
}

/* ---------- FORMULARIO ---------- */
if (form) {
form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    ocultarError();
    if (resumenCard) resumenCard.classList.add('hidden');

    try {
    const proyecto = $('#proyecto').value.trim();
    if (!proyecto) throw new Error('Debes ingresar un nombre de proyecto.');
    const medidas = obtenerMedidas();
    const reparto = calcularCantidadHojas(medidas.ancho);
    const direccion = obtenerDireccion();

    const proyectoObj = construirResumenObjeto({ proyecto, medidas, reparto, direccion });
    mostrarResumenEnPantalla(proyectoObj);
    } catch (err) {
    mostrarError(err.message || 'Error en la validación.');
    }
});
}

/* ---------- Botones del resumen ---------- */
if (enviarBtn) {
enviarBtn.addEventListener('click', () => {
    try {
    const raw = enviarBtn.dataset.obj;
    if (!raw) throw new Error('No hay un proyecto válido para guardar.');
    const obj = JSON.parse(raw);
    guardarEnStorage(obj);
    renderLista();
    if (resumenCard) resumenCard.classList.add('hidden');
    if (form) form.reset();
    actualizarModoHojas();
    alertSuccess('¡Gracias! Tu proyecto ha sido guardado en cotizaciones.');
    } catch (e) {
    mostrarError(e.message || 'Error al guardar.');
    }
});
}

if (editarBtn) {
editarBtn.addEventListener('click', () => {
    if (resumenCard) resumenCard.classList.add('hidden');
});
}

/* ---------- Vaciar storage ---------- */
if (vaciarStorageBtn) {
vaciarStorageBtn.addEventListener('click', () => {
    if (!confirm('¿Eliminar todas las cotizaciones guardadas?')) return;
    localStorage.removeItem(KEY_STORAGE);
    renderLista();
});
}

function alertSuccess(msg) {

if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.background = '#ecf9f1';
    errorBox.style.border = '1px solid #bdeacb';
    errorBox.style.color = '#0b7a3a';
    errorBox.classList.remove('hidden');
    setTimeout(() => {
    ocultarError();

    errorBox.style.background = '';
    errorBox.style.border = '';
    errorBox.style.color = '';
    }, 2200);
} else {
    console.log(msg);
}
}

document.addEventListener('DOMContentLoaded', () => {
renderLista();
});

