
const IMAGEN_PUZZLE = "../img/Foto_rompecabezas.jpeg";
document.documentElement.style.setProperty('--imagen-puzzle', `url("${IMAGEN_PUZZLE}")`);

/* =========================================================
   CORAZONES DE FONDO
========================================================= */
const contenedorCorazones = document.getElementById('fondo-corazones');
const coloresCorazon = ['#f15bb5', '#b794f4', '#ffc2e2', '#c084fc'];

function crearCorazon(){
  const cor = document.createElement('div');
  cor.className = 'corazon';
  const tam = 14 + Math.random()*22;
  const color = coloresCorazon[Math.floor(Math.random()*coloresCorazon.length)];
  cor.innerHTML = `
    <svg width="${tam}" height="${tam}" viewBox="0 0 32 29.6" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" d="M23.6,0c-3,0-5.8,1.7-7.6,4.4C14.2,1.7,11.4,0,8.4,0C3.8,0,0,3.9,0,8.8
      c0,7.1,7.6,12.4,16,20.8c8.4-8.4,16-13.7,16-20.8C32,3.9,28.2,0,23.6,0z"/>
    </svg>`;
  cor.style.left = Math.random()*100 + 'vw';
  const duracion = 9 + Math.random()*10;
  cor.style.animationDuration = duracion + 's';
  cor.style.animationDelay = (Math.random()*6) + 's';
  contenedorCorazones.appendChild(cor);
  setTimeout(()=>cor.remove(), (duracion+6)*1000);
}

for(let i=0;i<14;i++) setTimeout(crearCorazon, i*400);
setInterval(crearCorazon, 900);

/* =========================================================
   ROMPECABEZAS (3x3, arrastrar y soltar para intercambiar)
========================================================= */
const TAMANO = 3;
const tablero = document.getElementById('tablero');
let orden = [...Array(TAMANO*TAMANO).keys()];

function mezclar(arr){
  let mezclado;
  do{
    mezclado = [...arr].sort(()=>Math.random()-0.5);
  } while(mezclado.every((v,i)=>v===arr[i])); // evita que salga ya resuelto
  return mezclado;
}

orden = mezclar(orden);

function posicionFondo(indiceOriginal){
  const fila = Math.floor(indiceOriginal / TAMANO);
  const col = indiceOriginal % TAMANO;
  const paso = 100 / (TAMANO - 1);
  return `${col*paso}% ${fila*paso}%`;
}

function dibujarTablero(){
  tablero.innerHTML = '';
  orden.forEach((valorOriginal, posicionActual) => {
    const pieza = document.createElement('div');
    pieza.className = 'pieza';
    pieza.draggable = true;
    pieza.dataset.pos = posicionActual;
    pieza.style.backgroundPosition = posicionFondo(valorOriginal);

    pieza.addEventListener('dragstart', e=>{
      pieza.classList.add('arrastrando');
      e.dataTransfer.setData('text/plain', posicionActual);
    });
    pieza.addEventListener('dragend', ()=> pieza.classList.remove('arrastrando'));
    pieza.addEventListener('dragover', e=>{
      e.preventDefault();
      pieza.classList.add('resaltada');
    });
    pieza.addEventListener('dragleave', ()=> pieza.classList.remove('resaltada'));
    pieza.addEventListener('drop', e=>{
      e.preventDefault();
      pieza.classList.remove('resaltada');
      const origen = parseInt(e.dataTransfer.getData('text/plain'));
      const destino = posicionActual;
      if(origen === destino) return;
      [orden[origen], orden[destino]] = [orden[destino], orden[origen]];
      dibujarTablero();
      verificarSolucion();
    });

    // soporte táctil básico (tap para seleccionar, tap para intercambiar)
    pieza.addEventListener('click', ()=> manejarTap(pieza, posicionActual));

    tablero.appendChild(pieza);
  });
}

let piezaSeleccionada = null;
function manejarTap(pieza, posicion){
  if(piezaSeleccionada === null){
    piezaSeleccionada = posicion;
    pieza.classList.add('resaltada');
  } else if(piezaSeleccionada === posicion){
    pieza.classList.remove('resaltada');
    piezaSeleccionada = null;
  } else {
    [orden[piezaSeleccionada], orden[posicion]] = [orden[posicion], orden[piezaSeleccionada]];
    piezaSeleccionada = null;
    dibujarTablero();
    verificarSolucion();
  }
}

function verificarSolucion(){
  const resuelto = orden.every((v,i)=> v===i);
  if(resuelto){
    tablero.classList.add('resuelto');
    setTimeout(mostrarCarta, 900);
  }
}

function mostrarCarta(){
  document.getElementById('escena-puzzle').classList.add('oculto');
  document.getElementById('escena-carta').classList.remove('oculto');
  configurarAvisoScroll();
}

/* Muestra "desliza para seguir leyendo" solo si el poema no entra
   completo en el espacio visible, y lo oculta cuando ya llegaste al final */
function configurarAvisoScroll(){
  const cuerpo = document.querySelector('.carta-cuerpo');
  const aviso = document.querySelector('.desliza-aviso');
  if(!cuerpo || !aviso) return;

  function actualizar(){
    const hayMasTexto = cuerpo.scrollHeight - cuerpo.scrollTop - cuerpo.clientHeight > 10;
    aviso.style.visibility = hayMasTexto ? 'visible' : 'hidden';
  }

  // se ejecuta tras el pequeño delay del cambio de escena para medir bien
  setTimeout(actualizar, 50);
  cuerpo.addEventListener('scroll', actualizar);
  window.addEventListener('resize', actualizar);
}

dibujarTablero();
/* =========================================================
   VENTANA EMERGENTE: ¿SALIMOS?
========================================================= */
const modalSalir = document.getElementById('modal-salir');
const btnSalir = document.getElementById('btn-salir');
const btnSi = document.getElementById('btn-si');
const btnNo = document.getElementById('btn-no');
const contenedorBotonesModal = document.querySelector('.modal-botones');
const modalRespuesta = document.getElementById('modal-respuesta');

btnSalir.addEventListener('click', ()=>{
  modalSalir.classList.remove('oculto');
  // reinicia el estado cada vez que se abre
  btnNo.style.transform = 'translate(0,0)';
  btnSi.classList.remove('oculto');
  btnNo.classList.remove('oculto');
  modalRespuesta.classList.add('oculto');
});

modalSalir.addEventListener('click', (e)=>{
  if(e.target === modalSalir) modalSalir.classList.add('oculto');
});

btnSi.addEventListener('click', ()=>{
  btnSi.classList.add('oculto');
  btnNo.classList.add('oculto');
  modalRespuesta.classList.remove('oculto');
});

// el botón "No" se escapa del cursor/dedo dentro de su contenedor
function escaparBotonNo(){
  const limites = contenedorBotonesModal.getBoundingClientRect();
  const anchoBoton = btnNo.offsetWidth;
  const maxX = Math.max(limites.width - anchoBoton, 0);
  const maxY = 80; // rango vertical de escape
  const nuevoX = (Math.random() - 0.5) * maxX;
  const nuevoY = (Math.random() - 0.5) * maxY;
  btnNo.style.transform = `translate(${nuevoX}px, ${nuevoY}px)`;
}

btnNo.addEventListener('mouseover', escaparBotonNo);
btnNo.addEventListener('touchstart', (e)=>{
  e.preventDefault();
  escaparBotonNo();
}, {passive:false});