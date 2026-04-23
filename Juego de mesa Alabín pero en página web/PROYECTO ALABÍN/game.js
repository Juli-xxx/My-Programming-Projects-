/* game.js */
const board = document.getElementById("game-board");
const playerInfo = document.getElementById("player-info");
const turnInfo = document.getElementById("turn-info");

const peonesPreview = document.getElementById("peones-preview");

const colorResult = document.getElementById("color-result");
const numberResult = document.getElementById("number-result");

const configDiv = document.getElementById("config");

// ===== CONFIG JUGADORES =====
let jugadores = [];
let turnoActual = 0;
let elecciones = {};

let esperandoSeleccionPeon = false;
let puedeGirarLoseta = false;
let colorActual = null;
let numeroActual = null;
let bloqueado = false;

let reliquias = ["relic1.png","relic2.png","relic3.png","relic4.png"];
let tablero = [];

// peones 
let peones = [
  { id: 0, color: "red"}, // despues cambiar a que se vea el color
  { id: 1, color: "blue"}, 
  { id: 2, color: "green"},
  { id: 3, color: "yellow"} // antes había puesto { id: 1, color: "blue", posicion: 0 },
];


// ===== CONFIG INICIAL =====
function elegirReliquia(numJugador, reliquia, imgElement) {
  elecciones[numJugador] = reliquia;

  // quitar selección anterior
  let contenedor = document.querySelector(`.player-config[data-player="${numJugador}"] .relics`);
  let imgs = contenedor.querySelectorAll("img");
  imgs.forEach(img => img.classList.remove("selected"));

  imgElement.classList.add("selected");
}

function iniciarJuego() {
  jugadores = [];
  turnoActual = 0; 

  for (let i = 1; i <= 4; i++) {
    let nombre = document.getElementById("name" + i).value;
    let reliquia = elecciones[i];

    if (nombre && reliquia) {
      jugadores.push({
        nombre: nombre,
        reliquia: reliquia,
        encontrados: 0
      });
    }
  }
  // por las dudas 
  if (jugadores.length < 2) {
    alert("Debe haber al menos 2 jugadores");
    return;
  }

  configDiv.style.display = "none";
  document.getElementById("zones").style.display = "grid";
  document.getElementById("main-title").style.display = "none";

  crearPeonesJugables();
  prepararTablero();
  crearTablero();
  actualizarInfo();
}

// ===== PEONES =====
function crearPeonesJugables() {
  peonesPreview.innerHTML = "";

  peones.forEach((p, i) => {
    const div = document.createElement("div");
    div.classList.add("peon", "color-" + p.color); // color visible
    div.dataset.id = p.id;

    hacerArrastrable(div);
    peonesPreview.appendChild(div);
  });
  // después de 10 segundos se ocultan
  setTimeout(ocultarColoresPeones, 20000);
}

function ocultarColoresPeones() {
  document.querySelectorAll(".peon").forEach(div => {
    div.classList.remove("color-red", "color-blue", "color-green", "color-yellow");
    div.classList.add("hidden-color");
  });
}

// ===== DADOS =====
function tirarDadoNumero() {
  numeroActual = Math.floor(Math.random() * 4) + 1;
  numberResult.innerText = "Salió: " + numeroActual;
}

function tirarDadoColor() {
  if (esperandoSeleccionPeon || puedeGirarLoseta) {
    console.log("⏳ Espere");
    return;
  }

  const colores = ["red", "blue", "green", "yellow"];
  colorActual = colores[Math.floor(Math.random() * 4)];

  colorResult.innerText = "Color: " + colorActual.toUpperCase();
  esperandoSeleccionPeon = true;
  console.log("🎨 Color:", colorActual);
}

// ===== ARRASTRAR PEÓN =====
function hacerArrastrable(div) {
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  div.addEventListener("mousedown", (e) => {
    if (!esperandoSeleccionPeon) return;

    const peon = peones.find(p => p.id == div.dataset.id);
    if (!peon) return;

    // mostrar color real 1 segundo
    div.classList.remove("hidden-color");
    div.classList.add("color-" + peon.color);

    setTimeout(() => {
      div.classList.add("hidden-color");
      div.classList.remove("color-" + peon.color);

      if (peon.color !== colorActual) {
        alert("❌ Ese no es el color correcto, pierdes tu turno");
        //esperandoSeleccionPeon = false;
        finalizarTurno();
        return;
      }
      // correcto
      if (peon.color === colorActual) {
        alert("✅ Correcto, ahora podés mover el peón y girar una loseta");
        esperandoSeleccionPeon = false;
        puedeGirarLoseta = true;
      }
    },800);
  });

  // ===== DRAG REAL (solo cuando ya se validó) =====
  div.addEventListener("mousedown", (e) => {
    if (!puedeGirarLoseta) return;

    dragging = true;
    offsetX = e.clientX - div.getBoundingClientRect().left;
    offsetY = e.clientY - div.getBoundingClientRect().top;
    div.style.position = "absolute";
    div.style.zIndex = 1000;
  });
  /////

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    div.style.left = (e.pageX - offsetX) + "px";
    div.style.top = (e.pageY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    //div.style.cursor = "grab";
  });
}

// ===== TABLERO DE RELIQUIAS =====
function prepararTablero() {
  tablero = [];

  reliquias.forEach(r => {
    for (let i = 0; i < 4; i++) tablero.push(r);
  });
  
  tablero.sort(() => Math.random() - 0.5);  // mezclar
}

function crearTablero() {
  board.innerHTML = "";

  tablero.forEach(reliquia => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.reliquia = reliquia;
    tile.addEventListener("click", flipTile);
    board.appendChild(tile);
  });
}

function flipTile() {
  if (!puedeGirarLoseta) return;
  if (bloqueado) return;
  if (this.classList.contains("revealed")) return;

  bloqueado = true;
  this.classList.add("revealed");
  this.innerHTML = `<img src="${this.dataset.reliquia}">`;

  let jugador = jugadores[turnoActual];

  //¿es su reliquia?
  if (this.dataset.reliquia === jugador.reliquia) {
    jugador.encontrados++;
    actualizarInfo();

    // ¿ganó?
    if (jugador.encontrados >= 3) {
      setTimeout(() => {
        alert("🏆 " + jugador.nombre + " ganó la partida!");
        document.querySelectorAll(".tile").forEach(t => t.style.pointerEvents = "none");
    }, 200);
    return;
}
    // aunque acierte, pasa el turno
    setTimeout(() => {
      finalizarTurno();
    }, 5000);
  }
  else {
    // no es su reliquia → se tapa y pasa turno
    setTimeout(() => {
      this.classList.remove("revealed");
      this.innerHTML = "";
      finalizarTurno();
    }, 3000); 
  }
}

// ===== TURNOS =====
function finalizarTurno() {
  bloqueado = false;
  esperandoSeleccionPeon = false;
  puedeGirarLoseta = false;
  colorActual = null;

  console.log("🔄 Turno finalizado, estados limpiados");
  cambiarTurno();
}

function cambiarTurno() {
  turnoActual++;
  if (turnoActual >= jugadores.length) turnoActual = 0;
  actualizarInfo();
}

function actualizarInfo() {
  let texto = "";
  jugadores.forEach(j => {
    texto += `${j.nombre} (${j.encontrados}/3)   |   `;
  });
  playerInfo.innerText = texto;
  turnInfo.innerText = "Turno de: " + jugadores[turnoActual].nombre;
}

// ===== NUEVA PARTIDA =====
function nuevaPartida() {
  // reset estados
  esperandoSeleccionPeon = false;
  puedeGirarLoseta = false;
  colorActual = null;
  numeroActual = null;
  bloqueado = false;

  // reset jugadores
  jugadores.forEach(j => j.encontrados = 0);

  // limpiar dados
  colorResult.innerText = "";
  numberResult.innerText = "";

  // recrear todo
  crearPeonesJugables();
  prepararTablero();
  crearTablero();
  actualizarInfo();
}
