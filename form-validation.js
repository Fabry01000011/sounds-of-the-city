// form-validation.js
// Lógica y validación avanzada para el formulario de compra de tickets de un festival musical.

// --- Datos de eventos (simula una API) ---
const eventos = [
  // Cada objeto representa un evento musical disponible para la compra de tickets.
  {
    "evento": "Concierto de rock",
    "fecha": "2024-07-10",
    "lugar": "Estadio Madre de Ciudades",
    "ciudad": "Santiago del Estero",
    "horario": "21:00",
    "artista": "Los Redonditos de Ricota (tributo)",
    "genero": "Rock",
    "precio": 1500,
    "moneda": "ARS",
    "entradas_disponibles": 500
  },
  {
    "evento": "Festival de Música Electrónica",
    "fecha": "2024-07-15",
    "lugar": "Complejo Urbano",
    "ciudad": "Santiago del Estero",
    "horario": "18:00",
    "artista": "Varios DJs",
    "genero": "Electrónica",
    "precio": 2000,
    "moneda": "ARS",
    "entradas_disponibles": 1000
  },
  {
    "evento": "Noche de Jazz",
    "fecha": "2024-07-20",
    "lugar": "Bar Cultural La Ferretería",
    "ciudad": "Santiago del Estero",
    "horario": "22:00",
    "artista": "Trío de Jazz local",
    "genero": "Jazz",
    "precio": 800,
    "moneda": "ARS",
    "entradas_disponibles": 100
  }
];

// --- Carga dinámica de países con fallback robusto ---
// Intenta cargar la lista de países desde GitHub, si falla usa un backup local.
// El input de país es autocompletable y solo acepta países válidos de la lista.
let listaPaisesCargada = [];

async function cargarPaises() {
  const paisSelect = document.getElementById('pais');
  let paises = [];
  try {
    const res = await fetch('https://gist.githubusercontent.com/eduardolat/b2a252d17b17363fab0974bb0634d259/raw/paises.json');
    if (!res.ok) throw new Error('No se pudo cargar desde GitHub');
    paises = await res.json();
  } catch (e) {
    try {
      const resLocal = await fetch('js/paises-backup.json');
      if (!resLocal.ok) throw new Error('No se pudo cargar backup local');
      paises = await resLocal.json();
    } catch (e2) {
      paises = [];
    }
  }
  // Guarda la lista de países en minúsculas para validación estricta
  listaPaisesCargada = paises.map(p => p.nombre.toLowerCase());
  // Crea el input de país con datalist para autocompletar
  const paisInput = document.createElement('input');
  paisInput.type = 'text';
  paisInput.id = 'pais';
  paisInput.name = 'pais';
  paisInput.setAttribute('list', 'lista-paises');
  paisInput.setAttribute('autocomplete', 'off');
  paisInput.required = true;
  paisSelect.replaceWith(paisInput);

  let datalist = document.getElementById('lista-paises');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'lista-paises';
    paisInput.parentNode.insertBefore(datalist, paisInput.nextSibling);
  }
  datalist.innerHTML = paises.length
    ? paises.map(p => `<option value="${p.nombre}"></option>`).join('')
    : '';
}

// --- Carga dinámica de eventos ---
// Llena el select de eventos con los datos simulados.
function cargarEventos() {
  const eventoSelect = document.getElementById('evento');
  eventoSelect.innerHTML = '<option value="">Seleccionar</option>' +
    eventos.map((e, i) => `<option value="${i}">${e.evento} - ${e.artista}</option>`).join('');
}

// --- Actualiza los datos del evento seleccionado en el formulario ---
function actualizarDatosEvento() {
  const idx = document.getElementById('evento').value;
  const fecha = document.getElementById('fechaEvento');
  const ubicacion = document.getElementById('ubicacionEvento');
  if (idx !== "" && eventos[idx]) {
    fecha.value = eventos[idx].fecha + ' ' + eventos[idx].horario;
    ubicacion.value = eventos[idx].lugar + ', ' + eventos[idx].ciudad;
  } else {
    fecha.value = '';
    ubicacion.value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarPaises();
  cargarEventos();
  document.getElementById('evento').addEventListener('change', actualizarDatosEvento);
  document.getElementById('resumenCompra').style.display = 'none';
});

// --- Expresiones regulares para validación de campos ---
const regex = {
  nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,}$/,
  email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
  telefono: /^\d{10}$/,
  fechaNacimiento: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  numeroTarjeta: /^\d{16}$/,
  vencimiento: /^(0[1-9]|1[0-2])\/\d{2}$/,
  cvv: /^\d{3,4}$/,
  nombreTarjeta: /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/
};

// --- Valida si la persona es mayor de edad (>=18 años) ---
function esMayorDeEdad(fechaStr) {
  const partes = fechaStr.split('/');
  if (partes.length !== 3) return false;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const anio = parseInt(partes[2], 10);
  const nacimiento = new Date(anio, mes, dia);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }
  return edad >= 18;
}

// --- Detecta el tipo de tarjeta de crédito por el número ---
function detectarTipoTarjeta(numero) {
  if (/^4/.test(numero)) return 'Visa';
  if (/^5[1-5]/.test(numero)) return 'MasterCard';
  if (/^3[47]/.test(numero)) return 'American Express';
  return '';
}

// --- Validación de campos individuales ---
// Devuelve true si el campo es válido, false si no.
function validarCampo(id) {
  const input = document.getElementById(id);
  const msg = document.getElementById('msg-' + id);
  let valido = true;
  let error = '';
  let valor = input.value.trim();

  switch (id) {
    case 'nombreCompleto':
      valido = regex.nombre.test(valor);
      if (!valido) error = 'Solo letras y mínimo 3 caracteres.';
      break;
    case 'email':
      valido = regex.email.test(valor);
      if (!valido) error = 'Correo inválido.';
      break;
    case 'telefono':
      valido = regex.telefono.test(valor);
      if (!valido) error = 'Debe tener 10 dígitos.';
      break;
    case 'fechaNacimiento':
      valido = regex.fechaNacimiento.test(valor) && esMayorDeEdad(valor);
      if (!regex.fechaNacimiento.test(valor)) error = 'Formato dd/mm/aaaa.';
      else if (!esMayorDeEdad(valor)) error = 'Debés ser mayor de 18 años.';
      break;
    case 'pais':
      // Validación estricta: solo acepta países de la lista cargada
      valido = valor !== '' && listaPaisesCargada.includes(valor.toLowerCase());
      if (!valido) error = 'Seleccioná un país válido.';
      break;
    case 'evento':
      valido = valor !== '';
      if (!valido) error = 'Seleccioná un evento.';
      break;
    case 'tipoEntrada':
      valido = valor !== '';
      if (!valido) error = 'Seleccioná tipo de entrada.';
      break;
    case 'cantidadEntradas':
      valido = valor !== '' && Number(valor) >= 1 && Number(valor) <= 6;
      if (!valido) error = 'Entre 1 y 6 entradas.';
      break;
    case 'numeroTarjeta':
      valor = valor.replace(/\s/g, '');
      valido = regex.numeroTarjeta.test(valor);
      if (!valido) error = 'Debe tener 16 dígitos.';
      break;
    case 'vencimientoTarjeta':
      valido = regex.vencimiento.test(valor) && vencimientoFuturo(valor);
      if (!regex.vencimiento.test(valor)) error = 'Formato MM/AA.';
      else if (!vencimientoFuturo(valor)) error = 'Debe ser una fecha futura.';
      break;
    case 'cvv':
      valido = regex.cvv.test(valor);
      if (!valido) error = '3 o 4 dígitos.';
      break;
    case 'nombreTarjeta':
      valido = regex.nombreTarjeta.test(valor);
      if (!valido) error = 'Solo letras y espacios.';
      break;
  }

  // Muestra feedback visual y mensaje de error o éxito
  if (valido) {
    input.classList.remove('input-error');
    input.classList.add('input-success');
    msg.textContent = '✓';
    msg.style.color = 'green';
  } else {
    input.classList.remove('input-success');
    input.classList.add('input-error');
    msg.textContent = error;
    msg.style.color = 'red';
  }
  return valido;
}

// --- Valida que la fecha de vencimiento de la tarjeta sea futura ---
function vencimientoFuturo(valor) {
  const [mes, anio] = valor.split('/');
  if (!mes || !anio) return false;
  const hoy = new Date();
  const fecha = new Date(2000 + parseInt(anio, 10), parseInt(mes, 10) - 1);
  return fecha > hoy;
}

// --- Valida todo el formulario y muestra advertencias si hay errores ---
function validarFormulario() {
  let valido = true;
  for (const id of campos) {
    if (!validarCampo(id)) valido = false;
  }
  document.getElementById('btn-comprar').disabled = false;
  document.getElementById('form-error').textContent = valido ? '' : 'Completá todos los campos correctamente para continuar.';
  return valido;
}

// --- Validación en tiempo real y feedback visual ---
let mostrarErrores = false;
for (const id of campos) {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', () => {
      if (mostrarErrores) {
        validarCampo(id);
        validarFormulario();
      } else {
        if (id === 'numeroTarjeta') mostrarTipoTarjeta();
        if (id === 'cantidadEntradas' || id === 'evento' || id === 'tipoEntrada') actualizarPrecioTotal();
      }
    });
    input.addEventListener('blur', () => {
      if (mostrarErrores) {
        validarCampo(id);
        validarFormulario();
      }
    });
  }
}

document.getElementById('evento').addEventListener('change', () => {
  actualizarDatosEvento();
  validarCampo('evento');
  validarFormulario();
  actualizarPrecioTotal();
});
document.getElementById('tipoEntrada').addEventListener('change', actualizarPrecioTotal);
document.getElementById('cantidadEntradas').addEventListener('input', actualizarPrecioTotal);

// --- Muestra el tipo de tarjeta con imagen/logo ---
function mostrarTipoTarjeta() {
  const num = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
  const tipo = detectarTipoTarjeta(num);
  const tipoDiv = document.getElementById('tipoTarjeta');
  let img = '';
  if (tipo === 'Visa') img = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style="height:22px;vertical-align:middle;margin-right:6px;">';
  if (tipo === 'MasterCard') img = '<img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MasterCard" style="height:22px;vertical-align:middle;margin-right:6px;">';
  if (tipo === 'American Express') img = '<img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg" alt="Amex" style="height:22px;vertical-align:middle;margin-right:6px;">';
  tipoDiv.innerHTML = tipo ? img + 'Tipo: ' + tipo : '';
}

// --- Calcula y muestra el precio total en tiempo real ---
function actualizarPrecioTotal() {
  const idx = document.getElementById('evento').value;
  const tipo = document.getElementById('tipoEntrada').value;
  const cant = Number(document.getElementById('cantidadEntradas').value);
  let precio = 0;
  if (idx !== '' && eventos[idx]) {
    precio = eventos[idx].precio;
    if (tipo === 'VIP') precio *= 2;
    if (tipo === 'Palco') precio *= 3;
    if (cant >= 1 && cant <= 6) precio *= cant; else precio = 0;
  }
  document.getElementById('precioTotal').textContent = precio ? 'Total: $' + precio : '';
}

// --- Muestra el resumen de compra tras una compra exitosa ---
function mostrarResumenCompra() {
  const idx = document.getElementById('evento').value;
  const tipo = document.getElementById('tipoEntrada').value;
  const cant = document.getElementById('cantidadEntradas').value;
  const total = document.getElementById('precioTotal').textContent;
  const resumen = document.getElementById('resumenCompra');
  if (idx !== '' && eventos[idx]) {
    resumen.innerHTML = `<h3>Resumen de compra</h3>
      <ul>
        <li><b>Evento:</b> ${eventos[idx].evento}</li>
        <li><b>Artista:</b> ${eventos[idx].artista}</li>
        <li><b>Fecha:</b> ${eventos[idx].fecha} ${eventos[idx].horario}</li>
        <li><b>Ubicación:</b> ${eventos[idx].lugar}, ${eventos[idx].ciudad}</li>
        <li><b>Tipo de entrada:</b> ${tipo}</li>
        <li><b>Cantidad:</b> ${cant}</li>
        <li><b>${total}</b></li>
      </ul>`;
  } else {
    resumen.innerHTML = '';
    resumen.style.display = 'none';
  }
}

// --- Envío del formulario: muestra errores o el resumen y resetea el form ---
form.addEventListener('submit', function(e) {
  e.preventDefault();
  mostrarErrores = true;
  if (validarFormulario()) {
    mostrarResumenCompra();
    document.getElementById('resumenCompra').style.display = 'block';
    form.reset();
    document.getElementById('btn-comprar').disabled = true;
    document.querySelectorAll('.input-success').forEach(el => el.classList.remove('input-success'));
    document.querySelectorAll('.form-msg').forEach(el => el.textContent = '');
    document.getElementById('precioTotal').textContent = '';
    mostrarErrores = false;
  } else {
    for (const id of campos) validarCampo(id);
    document.getElementById('form-error').textContent = 'Completá todos los campos correctamente para continuar.';
  }
});

// --- Temporizador regresivo de 10 minutos para la compra ---
let timerInterval = null;
let tiempoRestante = 600; // 10 minutos en segundos

function iniciarTemporizador() {
  clearInterval(timerInterval);
  tiempoRestante = 600;
  mostrarTiempo();
  timerInterval = setInterval(() => {
    tiempoRestante--;
    mostrarTiempo();
    if (tiempoRestante <= 0) {
      clearInterval(timerInterval);
      document.getElementById('form-error').textContent = '¡Tiempo agotado! Volvé a iniciar la compra.';
      document.getElementById('btn-comprar').disabled = true;
    }
  }, 1000);
}

// --- Muestra el tiempo restante en el formulario ---
function mostrarTiempo() {
  let min = Math.floor(tiempoRestante / 60);
  let seg = tiempoRestante % 60;
  let timerDiv = document.getElementById('timer-compra');
  if (!timerDiv) {
    timerDiv = document.createElement('div');
    timerDiv.id = 'timer-compra';
    timerDiv.style = 'text-align:center;font-weight:bold;color:#FF206E;margin-bottom:10px;';
    document.getElementById('form-tickets').insertBefore(timerDiv, document.getElementById('form-tickets').firstChild);
  }
  timerDiv.textContent = `Tiempo restante para completar la compra: ${min.toString().padStart(2,'0')}:${seg.toString().padStart(2,'0')}`;
}

// --- Inicia y reinicia el temporizador según interacción ---
form.addEventListener('input', function() {
  if (!timerInterval) iniciarTemporizador();
});
form.addEventListener('submit', function() {
  clearInterval(timerInterval);
  document.getElementById('timer-compra').textContent = '';
  timerInterval = null;
});
form.addEventListener('reset', function() {
  clearInterval(timerInterval);
  document.getElementById('timer-compra').textContent = '';
  timerInterval = null;
});
