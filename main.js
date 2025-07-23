//PRESUPUESTO DE PARASOLES 
// PASO 1)Nombre del proyecto
function nombrarProyecto() {
var nombre = prompt("Paso1: Ingresa el nombre del proyecto:");
if (nombre == null || nombre == "") {
alert("Debes ingresar un nombre válido.");
return nombrarProyecto();
}
return nombre;
}

// PASO 2) El usuario escribe el alto y ancho del vano
function pedirMedidasVano() {
var anchoStr = prompt("Paso2: Ingresa el ancho del vano en metros (ej.2.5):");
if (anchoStr == null || anchoStr == "") {
alert("Por favor ingresa un ancho.");
return pedirMedidasVano();
}
var ancho = anchoStr * 1;
if (ancho <= 0) {
alert("El ancho debe ser un número mayor que 0.");
return pedirMedidasVano();
}

var altoStr = prompt("Paso2: Ingresa el alto del vano en metros (máx.5):");
if (altoStr == null || altoStr == "") {
alert("Por favor ingresa un alto.");
return pedirMedidasVano();
}
var alto = altoStr * 1;
if (alto <= 0) {
alert("El alto debe ser un número mayor que 0.");
return pedirMedidasVano();
}
if (alto > 5) {
alert("⚠️ Debes colocar un alto menor o igual a 5m por seguridad y performance.");
return pedirMedidasVano();
}

return { ancho: ancho, alto: alto };
}

// PASO 3) Cantidad de hojas
function pedirCantidadHojas(ancho) {
var opcion = prompt(
"Paso3: ¿Cómo deseas indicar la cantidad de hojas?\n" +
"1) Yo elijo\n" +
"2) Recomiéndame"
);
if (opcion == null || (opcion != "1" && opcion != "2")) {
alert("Debes ingresar '1' o '2'.");
return pedirCantidadHojas(ancho);
}

// Elección del usuario
if (opcion == "1") {
var hojasStr = prompt(
"¿Cuántas hojas quieres?\n" +
"(Mínimo 1, cada hoja entre 1m y 3m de ancho)"
);
if (hojasStr == null || hojasStr == "") {
alert("Ingresa un número de hojas.");
return pedirCantidadHojas(ancho);
}
var hojas = hojasStr * 1;
var anchoHoja = ancho / hojas;

if (hojas < 1) {
alert("La cantidad mínima de hojas es 1.");
return pedirCantidadHojas(ancho);
}
if (anchoHoja < 1) {
alert("Con " + hojas + " hojas, cada una mide " +
anchoHoja.toFixed(2) +
"m (<1m). Vuelve a intentarlo.");
return pedirCantidadHojas(ancho);
}
if (anchoHoja > 3) {
alert("Con " + hojas + " hojas, cada una mide " +
anchoHoja.toFixed(2) +
"m (>3m). Vuelve a intentarlo.");
return pedirCantidadHojas(ancho);
}

return { hojas: hojas, anchoHoja: anchoHoja };
}

// Recomendada por manual
var hojasRec = ancho - (ancho % 1);
if (hojasRec < 1) hojasRec = 1;
var anchoHojaRec = ancho / hojasRec;
while (anchoHojaRec > 3) {
hojasRec = hojasRec + 1;
anchoHojaRec = ancho / hojasRec;
}
return { hojas: hojasRec, anchoHoja: anchoHojaRec };
}

// PASO 4) Elige el usuario la dirección de los parantes: vertical u horizontal
function pedirDireccionParantes() {
var opcion = prompt(
"Paso4: Elige la dirección de los parantes:\n" +
"1) Verticales\n" +
"2) Horizontales"
);
if (opcion == null || (opcion != "1" && opcion != "2")) {
alert("Debes ingresar '1' o '2'.");
return pedirDireccionParantes();
}
return opcion === "1" ? "Verticales" : "Horizontales";
}

function iniciarCotizacion() {
var proyecto   = nombrarProyecto();
var medidas    = pedirMedidasVano();
var reparto    = pedirCantidadHojas(medidas.ancho);
var direccion  = pedirDireccionParantes();

// Construir resumen  de lo seleccionado por el usuario
var resumen =
"RESUMEN DEL PROYECTO\n\n" +
"Proyecto: "         + proyecto + "\n" +
"Ancho del vano: "   + medidas.ancho + "m\n" +
"Alto del vano: "    + medidas.alto  + "m\n" +
"Hojas: "            + reparto.hojas + "\n" +
"Ancho por hoja: "   + reparto.anchoHoja.toFixed(2) + "m\n" +
"Dirección parantes: "+ direccion + "\n\n" +
"¿Desea enviar el producto a cotización?";

// Mostrar confirmación
var enviar = confirm(resumen);
if (enviar) {
alert("¡Gracias! Tu proyecto ha sido enviado a cotización.");
} else {
// Si el usuario elige Cancelar, reinicia desde el paso 1
iniciarCotizacion();
}
}

// Arranca el proceso
iniciarCotizacion();
