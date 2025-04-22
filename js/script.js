const MAXIMOS_INTENTOS = 8, // Intentos máximos que tiene el jugador
    COLUMNAS = 4, // Columnas del memorama
    SEGUNDOS_ESPERA_VOLTEAR_IMAGEN = 1, // Por cuántos segundos mostrar ambas imágenes
    NOMBRE_IMAGEN_OCULTA = "./img/lps.jpg"; // La imagen que se muestra cuando la real está oculta
    var nombre = ''
    var email = ''
    var telefono = ''
new Vue({
    el: "#app",
    data: () => ({
        // La ruta de las imágenes. Puede ser relativa o absoluta
        imagenes: [
            //"./img/accidentes-personales.svg",
            "./img/ViviendaProtegida.jpg",
            "./img/Camiones-AP.jpg",
            "./img/GarantiasAduaneras1.jpg",
            "./img/MobilidadUrbana.jpg",
            "./img/IntegralEscuelas.jpg",
            "./img/lpsmascerca.jpg",
            //"./img/1.jpg",
            //"./img/2.jpg"
            //"./img/3.jpg",
            //"./img/incendio.svg"
            //"./img/motovehiculos.svg",
        ],
        memorama: [],
        // Útiles para saber cuál fue la carta anteriormente seleccionada
        ultimasCoordenadas: {
            indiceFila: null,
            indiceImagen: null,
        },
        NOMBRE_IMAGEN_OCULTA: NOMBRE_IMAGEN_OCULTA,
        MAXIMOS_INTENTOS: MAXIMOS_INTENTOS,
        intentos: 0,
        aciertos: 0,
        esperandoTimeout: false,
    }),
    methods: {
        // Método que muestra la alerta indicando que el jugador ha perdido; después
        // de mostrarla, se reinicia el juego
        indicarFracaso() {
            Swal.fire({
                        title: "Perdiste",
                    html: `
                <img class="img-fluid" src="./img/perdiste.png" alt="Perdiste">
                <p class="h4">Agotaste tus intentos</p>`,
                    confirmButtonText: "Jugar de nuevo",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                })
                .then(this.reiniciarJuego)
        },
        // Mostrar alerta de victoria y reiniciar juego
        indicarVictoria() {
            Swal.fire({
                    title: "¡Ganaste!",
                    html: `
                <img class="img-fluid" src="./img/ganaste.png" alt="Ganaste">
                <p class="h4">Muy bien hecho</p>`,
                //<br>` + 
                //'<input id="nombre" class="swal2-input" placeholder="Nombre">' +
                //'<input id="email" class="swal2-input" placeholder="Email">' +
                //'<input id="telefono" class="swal2-input" placeholder="Teléfono">',
                    confirmButtonAriaLabel: "Jugar de nuevo",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                //    preConfirm: () => {
                //        // Obtener los valores de los inputs
                //    nombre = Swal.getPopup().querySelector("#nombre").value;
                //    email = Swal.getPopup().querySelector("#email").value;
                //    telefono = Swal.getPopup().querySelector("#telefono").value;
                //    }
                })
                .then(resultado => {
                //        GuardarGanador(nombre, email, telefono);
                })
                .then(this.reiniciarJuego);
        },
        // Método que indica si el jugador ha ganado
        haGanado() {
            return this.memorama.every(arreglo => arreglo.every(imagen => imagen.acertada));
        },
        // Ayudante para mezclar un arreglo
        mezclarArreglo(a) {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            }
            return a;
        },
        // Aumenta un intento y verifica si el jugador ha perdido
        aumentarIntento() {
            this.intentos++;
            if (this.intentos >= MAXIMOS_INTENTOS) {
                this.indicarFracaso();
            }
        },
        // Se desencadena cuando se hace click en la imagen
        voltear(indiceFila, indiceImagen) {
            // Si se está regresando una imagen a su estado original, detener flujo
            if (this.esperandoTimeout) {
                return;
            }
            // Si es una imagen acertada, no nos importa que la intenten voltear
            if (this.memorama[indiceFila][indiceImagen].acertada) {
                return;
            }
            // Si es la primera vez que la selecciona
            if (this.ultimasCoordenadas.indiceFila === null && this.ultimasCoordenadas.indiceImagen === null) {
                this.memorama[indiceFila][indiceImagen].mostrar = true;
                this.ultimasCoordenadas.indiceFila = indiceFila;
                this.ultimasCoordenadas.indiceImagen = indiceImagen;
                return;
            }
            // Si es el que estaba mostrada, lo ocultamos de nuevo
            let imagenSeleccionada = this.memorama[indiceFila][indiceImagen];
            let ultimaImagenSeleccionada = this.memorama[this.ultimasCoordenadas.indiceFila][this.ultimasCoordenadas.indiceImagen];
            if (indiceFila === this.ultimasCoordenadas.indiceFila &&
                indiceImagen === this.ultimasCoordenadas.indiceImagen) {
                this.memorama[indiceFila][indiceImagen].mostrar = false;
                this.ultimasCoordenadas.indiceFila = null;
                this.ultimasCoordenadas.indiceImagen = null;
                this.aumentarIntento();
                return;
            }

            // En caso de que la haya encontrado, ¡acierta!
            // Se basta en ultimaImagenSeleccionada
            this.memorama[indiceFila][indiceImagen].mostrar = true;
            if (imagenSeleccionada.ruta === ultimaImagenSeleccionada.ruta) {
                this.aciertos++;
                this.memorama[indiceFila][indiceImagen].acertada = true;
                this.memorama[this.ultimasCoordenadas.indiceFila][this.ultimasCoordenadas.indiceImagen].acertada = true;
                this.ultimasCoordenadas.indiceFila = null;
                this.ultimasCoordenadas.indiceImagen = null;
                // Cada que acierta comprobamos si ha ganado
                if (this.haGanado()) {
                    this.indicarVictoria();
                }
            } else {
                // Si no acierta, entonces giramos ambas imágenes
                this.esperandoTimeout = true;
                setTimeout(() => {
                    this.memorama[indiceFila][indiceImagen].mostrar = false;
                    this.memorama[indiceFila][indiceImagen].animacion = false;
                    this.memorama[this.ultimasCoordenadas.indiceFila][this.ultimasCoordenadas.indiceImagen].mostrar = false;
                    this.ultimasCoordenadas.indiceFila = null;
                    this.ultimasCoordenadas.indiceImagen = null;
                    this.esperandoTimeout = false;
                }, SEGUNDOS_ESPERA_VOLTEAR_IMAGEN * 1000);
                this.aumentarIntento();
            }
        },
        reiniciarJuego() {
            let memorama = [];
            this.imagenes.forEach((imagen, indice) => {
                let imagenDeMemorama = {
                    ruta: imagen,
                    mostrar: false, // No se muestra la original
                    acertada: false, // No es acertada al inicio
                };
                // Poner dos veces la misma imagen
                memorama.push(imagenDeMemorama, Object.assign({}, imagenDeMemorama));
            });

            // Sacudir o mover arreglo; es decir, hacerlo aleatorio
            this.mezclarArreglo(memorama);

            // Dividirlo en subarreglos o columnas
            let memoramaDividido = [];
            for (let i = 0; i < memorama.length; i += COLUMNAS) {
                memoramaDividido.push(memorama.slice(i, i + COLUMNAS));
            }
            // Reiniciar intentos
            this.intentos = 0;
            this.aciertos = 0;
            // Asignar a instancia de Vue para que lo dibuje
            this.memorama = memoramaDividido;
        },
        // Método que precarga las imágenes para que las mismas ya estén cargadas
        // cuando el usuario gire la tarjeta
        precargarImagenes() {
            // Mostrar la alerta
            Swal.fire({
                    title: "Cargando",
                    html: `Cargando imágenes...`,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                })
                .then(this.reiniciarJuego)
                // Ponerla en modo carga
            Swal.showLoading();


            let total = this.imagenes.length,
                contador = 0;
            let imagenesPrecarga = Array.from(this.imagenes);
            // También vamos a precargar la "espalda" de la tarjeta
            imagenesPrecarga.push(NOMBRE_IMAGEN_OCULTA);
            // Cargamos cada imagen y en el evento load aumentamos el contador
            imagenesPrecarga.forEach(ruta => {
                const imagen = document.createElement("img");
                imagen.src = ruta;
                imagen.addEventListener("load", () => {
                    contador++;
                    if (contador >= total) {
                        // Si el contador >= total entonces se ha terminado la carga de todas
                        this.reiniciarJuego();
                        Swal.close();
                    }
                });
                // Agregamos la imagen y la removemos instantáneamente, así no se muestra
                // pero sí se carga
                document.body.appendChild(imagen);
                document.body.removeChild(imagen);
            });
        },
    },
    mounted() {
        this.precargarImagenes();
    },
});

function GuardarGanador(nom, email, telefono){

    // Obtener la fecha y hora actual
    const fechaActual = new Date();

    // Formatear la fecha y hora
    const dia = fechaActual.getDate().toString().padStart(2, "0");
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
    const anio = fechaActual.getFullYear().toString();
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    
    const hora = fechaActual.getHours().toString().padStart(2, "0");
    const minutos = fechaActual.getMinutes().toString().padStart(2, "0");
    const horaFormateada = `${hora}:${minutos}`;

    const winner = {
        fecha : fechaFormateada,
        hora : horaFormateada,
        nombre : nom,
        mail : email,
        tel : telefono
    }

    if (nombre != ''){
        // Recuperar el arreglo del localStorage
        var Ganadores = JSON.parse(localStorage.getItem('Ganadores')) || [];

        // Agregar el nuevo elemento al arreglo
        Ganadores.push(winner);

        // Guardar el arreglo actualizado en el localStorage
        localStorage.setItem('Ganadores', JSON.stringify(Ganadores));
    }

}
