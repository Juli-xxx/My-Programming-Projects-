const btnNo = document.getElementById("no");
const btnSi = document.getElementById("si");
const sobre = document.getElementById("sobre");
const carta = sobre.querySelector(".carta");
const musica = document.getElementById("musica");
const tipNo = document.getElementById("tipNo");

const sonidoSi = document.getElementById("sonidoSi");
const sonidoNo = document.getElementById("sonidoNo");

// ===============================
// BOTÓN NO ESCAPA
// ===============================
let tipOculto = false;
function ocultarTip() {
    if (!tipOculto && tipNo) {
        tipOculto = true;
        tipNo.classList.add("ocultar");
    }
}

function moverBoton() {
    ocultarTip();

    const maxX = window.innerWidth - btnNo.offsetWidth - 20;
    const maxY = window.innerHeight - btnNo.offsetHeight - 20;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    btnNo.style.position = "absolute";
    btnNo.style.left = x + "px";
    btnNo.style.top = y + "px";
}

btnNo.addEventListener("mouseenter", moverBoton);
btnNo.addEventListener("click", moverBoton);

/* boton tiembla */
document.addEventListener("mousemove", (e) => {
    const rect = btnNo.getBoundingClientRect();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    const distancia = Math.hypot(mouseX - centroX, mouseY - centroY);

    if (distancia < 55) { // 🔥 distancia de amenaza
        if (!btnNo.classList.contains("tiembla")) {
            btnNo.classList.add("tiembla");

            // quitar la clase para que pueda volver a animarse
            setTimeout(() => {
                btnNo.classList.remove("tiembla");
            }, 250);
        }
    }
});

// ===============================
// CORAZONES DESDE LA CARTA
function lanzarCorazones() {
    const cuerpo = sobre.querySelector(".cuerpo");
    const rect = cuerpo.getBoundingClientRect();

    for (let i = 0; i < 50; i++) {
        const corazon = document.createElement("div");
        corazon.className = "corazon";
        corazon.innerHTML = "❤️";

        // salen desde el interior del sobre rosa
        const startX = rect.left + 30 + Math.random() * (rect.width - 60);
        const startY = rect.top + 25 + Math.random() * 20;

        corazon.style.left = startX + "px";
        corazon.style.top = startY + "px";
        corazon.style.fontSize = 16 + Math.random() * 20 + "px";

        document.body.appendChild(corazon);

        // algunos llegan más alto, otros menos
        const alturaExtra = Math.random() * 300; // diferencia entre corazones
        const destinoY = startY + window.scrollY - window.innerHeight - alturaExtra;

        const driftX = 0 + Math.random() * 20; // un poco a la izquierda

        corazon.animate([
            { transform: "translate(-1, 0)", opacity: 1 },
            { transform: `translate(${driftX}px, ${destinoY}px)`, opacity: 0 }
        ], {
            duration: 7000,
            easing: "ease-out"
        });
    }
}


// ===============================
// BOTÓN SÍ — SECUENCIA
// ===============================
btnSi.addEventListener("click", () => {
    ocultarTip();

    // 1️⃣ Se abre la tapa
    sobre.classList.add("tapa-abierta", "abierto");

    // 2️⃣ Sale la carta
    setTimeout(() => {
        sobre.classList.add("carta-sale");
    }, 600);

    // 3️⃣ Corazones desde el interior
    setTimeout(() => {
        lanzarCorazones();
    }, 1000);

    musica.play();
    btnNo.classList.add("desaparecer");

    setTimeout(() => {
        mostrarReapretar();
    }, 4000);
});

/* 777777 */
let reapretarVisible = false;

function mostrarReapretar() {
    if (reapretarVisible) return; // no crear más de uno
    reapretarVisible = true;

    const cartel = document.createElement("div");
    cartel.className = "reapretar";
    cartel.id = "reapretarCartel";
    cartel.textContent = "Volvé a tocar 'Sí' 💖";

    document.body.appendChild(cartel);

    // Después de 2 minutos desaparece suavemente
    setTimeout(() => {
        cartel.classList.add("mostrar");
    }, 1000); // un pequeño delay para que el navegador registre el estilo inicial

    // Después de 2 minutos desaparece suavemente
    setTimeout(() => {
        cartel.classList.add("ocultar");

        // Eliminar del DOM después de la transición (0.8s)
        setTimeout(() => {
            cartel.remove();
        }, 1000);
    }, 10000); // unos segundos
}

/* 7777777777777 */
// Al pasar el mouse por "Sí"
btnSi.addEventListener("mouseenter", () => {
    sonidoSi.currentTime = 0; // reinicia si estaba sonando
    sonidoSi.play().catch(() => {}); // previene errores en mobile
});

// Al pasar el mouse por "No"
btnNo.addEventListener("mouseenter", () => {
    sonidoNo.currentTime = 0;
    sonidoNo.play().catch(() => {});
});

sonidoSi.volume = 5;
sonidoNo.volume = 5;