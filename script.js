// --- Obtener Elementos del DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const nextRewardDisplay = document.getElementById('nextRewardDisplay');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const viewRewardsButton = document.getElementById('viewRewardsButton');
const rewardModal = document.getElementById('rewardModal');
const rewardDescription = document.getElementById('rewardDescription');
const closeRewardButton = document.getElementById('closeRewardButton');
const rewardsListModal = document.getElementById('rewardsListModal');
const rewardsList = document.getElementById('rewardsList');
const closeRewardsListButton = document.getElementById('closeRewardsListButton');
const closeButtons = document.querySelectorAll('.close-button');

// --- Constantes del Juego ---
const GRID_SIZE = 20; // Tamaño de cada celda de la cuadrícula
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const ROWS = CANVAS_HEIGHT / GRID_SIZE;
const COLS = CANVAS_WIDTH / GRID_SIZE;
const FOOD_COLOR = '#9933ff';  // Púrpura para la comida
const GAME_SPEED = 150; // Milisegundos base entre actualizaciones (menor = más rápido)
const MAX_SCORE = 10000; // Puntuación máxima posible
const POINTS_PER_FOOD = 10; // Puntos ganados por cada comida

// --- Temas de Color para la Serpiente ---
const SNAKE_THEMES = {
    rosa: {
        name: 'Rosa',
        headColor: '#ff1493', // Rosa intenso para la cabeza
        bodyColor: '#ff66b3', // Rosa para el cuerpo
        patternColor: '#ffb6c1', // Color para patrones decorativos
        eyeColor: '#ffffff', // Color de los ojos
        style: 'flower', // Estilo decorativo mejorado
        shape: 'caterpillar', // Forma de oruga
        animation: 'bounce' // Animación de rebote
    },
    pastel: {
        name: 'Pastel',
        headColor: '#ffb6c1', // Rosa pastel para la cabeza
        bodyColor: '#ffcce6', // Rosa pastel claro para el cuerpo
        patternColor: '#ffffff', // Blanco para patrones
        eyeColor: '#ffffff', // Color de los ojos
        style: 'butterfly', // Estilo decorativo mejorado
        shape: 'caterpillar', // Forma de oruga
        animation: 'wiggle' // Animación de movimiento ondulante
    },
    arcoiris: {
        name: 'Arcoíris',
        headColor: '#ff66b3', // Rosa para la cabeza
        bodyColor: '#ff9999', // Base para el cuerpo (se aplicará gradiente)
        patternColor: '#ffffff', // Blanco para patrones
        eyeColor: '#ffffff', // Color de los ojos
        style: 'rainbow', // Estilo decorativo (mantenido como está)
        shape: 'caterpillar', // Forma de oruga
        animation: 'pulse' // Animación de pulso
    },
    unicornio: {
        name: 'Unicornio',
        headColor: '#cc99ff', // Lila para la cabeza
        bodyColor: '#ccccff', // Lila claro para el cuerpo
        patternColor: '#ffccff', // Rosa claro para patrones
        eyeColor: '#ffffff', // Color de los ojos
        style: 'magical', // Estilo decorativo mejorado
        shape: 'caterpillar', // Forma de oruga
        animation: 'sparkle' // Animación de destellos
    },
    sirena: {
        name: 'Sirena',
        headColor: '#66ccff', // Azul claro para la cabeza
        bodyColor: '#99ffff', // Turquesa claro para el cuerpo
        patternColor: '#ccffff', // Celeste muy claro para patrones
        eyeColor: '#ffffff', // Color de los ojos
        style: 'mermaid', // Estilo decorativo mejorado
        shape: 'caterpillar', // Forma de oruga
        animation: 'wave' // Animación de onda
    },
    purpurina: {
        name: 'Purpurina',
        headColor: '#ff66ff', // Rosa brillante para la cabeza
        bodyColor: '#ff99ff', // Rosa claro para el cuerpo
        patternColor: '#ffccff', // Rosa muy claro para patrones
        eyeColor: '#ffffff', // Color de los ojos
        style: 'glitter', // Estilo decorativo (mantenido como está)
        shape: 'caterpillar', // Forma de oruga
        animation: 'glimmer' // Animación de brillo
    }
};

// Tema actual (por defecto: rosa)
let currentSnakeTheme = SNAKE_THEMES.rosa;

// --- Variables del Estado del Juego ---
let snake = []; // Array de segmentos {x, y}
let food = { x: 0, y: 0 };
let dx = GRID_SIZE; // Desplazamiento horizontal inicial (derecha)
let dy = 0;         // Desplazamiento vertical inicial
let score = 0;
let changingDirection = false; // Previene cambios rápidos de dirección opuesta
let isGameOver = false;
let animationFrameId; // ID para requestAnimationFrame
let lastFrameTime = 0;
let gameUpdateTime = 0; // Acumulador de tiempo para controlar la velocidad
let dailyAttemptsUsed = 0; // Contador de intentos usados hoy (máximo 3)
let MAX_DAILY_ATTEMPTS = 3; // Número máximo de intentos por día
let hasPlayedToday = false; // Controla si ya se ha jugado hoy
let pendingRewards = []; // Premios ganados en la partida actual pero aún no mostrados
let nextRewardPoints = 100; // Puntos necesarios para el próximo premio
let gameDate = new Date().toLocaleDateString(); // Fecha actual para control de juego diario

// --- Variables para Efectos Visuales ---
let foodParticles = []; // Partículas para el efecto cuando se come la comida
let foodPulseSize = 0; // Tamaño del pulso de la comida
let foodPulseGrowing = true; // Dirección del pulso
let screenTransition = { active: false, type: '', progress: 0 }; // Estado de transición de pantalla
let snakeTrail = []; // Rastro temporal detrás de la serpiente
let trailLifespan = 10; // Duración del rastro en frames

// --- Variables para Decoraciones Laterales ---
let butterflies = []; // Mariposas animadas en los laterales
let flowers = []; // Flores decorativas
let stars = []; // Estrellas brillantes
let rainbows = []; // Pequeños arcoíris
let clouds = []; // Nubes esponjosas
let sparkles = []; // Destellos brillantes

// --- Base de Datos de Premios ---
const REWARDS_DATABASE = [
    // NIVEL 1: Pequeños Logros, Grandes Detalles (150-500 puntos)
    { points: 150, description: "¡Teresa, con tus 150 puntos has desbloqueado un delicioso café o té preparado justo como te gusta por tu querido Hori, listo para ti en el momento que elijas! Disfruta." },
    { points: 200, description: "¡Felicidades, Elizabeth! Por tus 200 puntos, aquí tienes ese pequeño snack que tanto te gusta para celebrar tu victoria." },
    { points: 250, description: "Querida Teresa, por tus 250 puntos he escrito para ti una pequeña nota sincera sobre algo que admiro de ti. Léela y recuerda lo especial que eres para tu Hori." },
    { points: 300, description: "¡Bien jugado, Elizabeth! Tus 300 puntos te otorgan control absoluto del mando de la tele (o de la música) por la próxima hora. ¡Hori hará lo que digas!" },
    { points: 350, description: "Con tus 350 puntos, Hori te regala esta bonita flor para recordarte lo hermosa que eres, Teresa." },
    { points: 400, description: "¡Teresa, tus manos se merecen un descanso! Por tus 400 puntos, tu Hori te ofrece un masaje de manos de 10 minutos para relajarlas." },
    { points: 450, description: "¡Increíble puntuación, Elizabeth! Como recompensa por tus 450 puntos, dime una cosa pequeña que necesites que haga justo ahora, y tu Hori la hará sin preguntar." },
    { points: 500, description: "Relájate, Teresa. Por tus 500 puntos, tu Hori te preparará un baño caliente perfecto, listo para que disfrutes en cuanto te apetezca." },

    // NIVEL 2: Metas Más Grandes, Premios Más Dulces (600-1000 puntos)
    { points: 600, description: "¡Oh là là, Elizabeth! Con 600 puntos, te espera una notita de amor de tu Hori en algún lugar donde menos te lo esperas. ¡Descúbrela!" },
    { points: 650, description: "¡Qué dulce victoria, Teresa! Por tus 650 puntos, aquí tienes un delicioso bombón artesano solo para ti." },
    { points: 700, description: "¡Genial, Elizabeth! Con tus 700 puntos, ganaste el derecho a ver UN capítulo más de esa serie. ¡Hori está de acuerdo, prométido!" },
    { points: 750, description: "¡Que suene la victoria, Teresa! Por tus 750 puntos, la música en casa (o donde estemos) es TÚ decisión por las próximas 2 horas." },
    { points: 800, description: "Con tus 800 puntos, tu Hori te preparará tu snack casero sencillo favorito (ej. palomitas, un sándwich gourmet rápido). ¡Hecho con cariño!" },
    { points: 850, description: "Elizabeth, por tus 850 puntos, te daré un cumplido verbal sincero y elaborado para recordarte lo maravillosa que eres." },
    { points: 900, description: "Para mi campeona, Teresa. Por tus 900 puntos, tu Hori se asegurará de que tu vaso (de agua, refresco, lo que bebas) esté siempre lleno discretamente por un tiempo. ¡Siéntate y disfruta!" },
    { points: 950, description: "¡Ahhh, tus pies! Se merecen un descanso, Teresa. Por tus 950 puntos, Hori te dará un masaje relajante de pies de 10 minutos." },
    { points: 1000, description: "Elizabeth, por tus 1000 puntos, tu Hori se encarga de esa pequeña tarea doméstica que tanto odias... por una vez. ¡Considera hecho!" },

    // NIVEL 3: Dominando el Tablero (1200-2000 puntos)
    { points: 1200, description: "¡Felicidades, Teresa! Por tus 1200 puntos, Hori te compra un pequeño paquete de ese café o té especial que tanto te gusta para que lo disfrutes en casa." },
    { points: 1300, description: "Elizabeth, con tus 1300 puntos, tienes derecho a 30 minutos de tiempo con Hori sin móviles ni otras distracciones. ¡Solo tú y yo!" },
    { points: 1400, description: "Relájate, Teresa. Por tus 1400 puntos, Hori te dará un masaje de 15 minutos en el cuello y los hombros para liberar toda esa tensión." },
    { points: 1500, description: "¡Buenos días, Elizabeth! Por tus 1500 puntos, Hori te prepara un delicioso desayuno casero listo a la hora que indiques, para que no tengas que preocuparte por nada." },
    { points: 1600, description: "¡Victoria deliciosa, Teresa! Por tus 1600 puntos, Hori te compra ese postre individual de tu pastelería favorita. ¡A disfrutar cada bocado!" },
    { points: 1700, description: "Elizabeth, por tus 1700 puntos, tienes 30 minutos para preguntar a Hori lo que quieras. ¡Preparado para responder! 😉" },
    { points: 1800, description: "Con tus 1800 puntos, Teresa, tú decides qué cenamos (dentro de lo razonable) y qué hacemos después por una noche. ¡Hori sigue tus órdenes!" },
    { points: 1900, description: "Elizabeth, por tus 1900 puntos, Hori te regala un pequeño y bonito ramo de flores para alegrar tu día." },
    { points: 2000, description: "¡Ahhh, descanso para Elizabeth! Por tus 2000 puntos, Hori te ofrece un masaje completo de espalda de 25 minutos para dejarte como nueva." },

    // NIVEL 4: Conquistas el Tablero (2500-5000 puntos)
    { points: 2500, description: "¡Productividad lograda, Teresa! Por tus 2500 puntos, Hori va al supermercado y se encarga de comprar hasta 10 artículos de tu lista. ¡Tú quédate en casa!" },
    { points: 2750, description: "Elizabeth, por tus 2750 puntos, Hori organiza una noche temática de pelis/series con snacks especiales relacionados. ¡Prepárate para una inmersión divertida!" },
    { points: 3000, description: "Para cuidarte, Teresa. Por tus 3000 puntos, Hori te compra un producto de cuidado personal que te guste (una mascarilla, loción pequeña, etc.)." },
    { points: 3250, description: "¡Teresa Elizabeth de Grotewold García, tus 3250 puntos te dan un set de accesorios para el cabello super lindos! ¡Brillante victoria!" },
    { points: 3500, description: "Elizabeth, con tus 3500 puntos, Hori te compra ese libro o revista que mencionaste que querías leer. ¡Disfrútalo!" },
    { points: 3750, description: "Teresa, por tus 3750 puntos, tienes un vale para pedirle a Hori que te ayude con una pequeña cosa que necesites en el momento que elijas. ¡Solo activa el vale!" },
    { points: 4000, description: "¡Ambiente romántico y delicioso, Elizabeth! Con tus 4000 puntos, Hori te prepara un picnic en casa con todo lo necesario (manta, comida rica, música). ¡Sin mosquitos!" },
    { points: 4500, description: "Teresa, por tus 4500 puntos, Hori te regala una vela aromática o ambientador que sabes que te encanta para perfumar tu espacio." },
    { points: 5000, description: "¡Elizabeth, celebra tus 5000 puntos! Hoy, después de la cena, toda la limpieza de la cocina (platos, encimera, todo) es 100% responsabilidad de Hori. ¡Relájate!" },

    // NIVEL 5: Leyenda Absoluta de Snake (6000-10000 puntos)
    { points: 6000, description: "¡Teresa Elizabeth, con tus 6000 puntos, pides el menú! Tu Hori cocina tu plato favorito (¡el que tú elijas!) para la cena, y él se encarga de toda la limpieza. ¡Noche libre de cocina para ti!" },
    { points: 6500, description: "¡Compras con Victoria, Elizabeth! Tus 6500 puntos te otorgan una tarjeta de regalo para que te des un gusto en tu tienda o cafetería favorita." },
    { points: 7000, description: "Hori ha preparado una selección especial de música solo para ti, Teresa, con tus 7000 puntos. Escúchala y que te alegre el día." },
    { points: 7500, description: "Elizabeth, por tus 7500 puntos, dile a Hori esos 1 o 2 mandados importantes que necesitas hacer fuera, ¡y él se encarga! Tú quédate a ganar más puntos." },
    { points: 8000, description: "¡Hora de Película, Teresa! Tus 8000 puntos te dan dos entradas de cine (o la peli en casa con sistema casero) y Hori se encarga de las palomitas y bebidas. ¡A disfrutar!" },
    { points: 8500, description: "¡Para que fluyas, Elizabeth! Por tus 8500 puntos, tienes 4-5 horas de tiempo ininterrumpido para dedicarte a tu hobby sin ninguna interrupción de Hori (a menos que sea emergencia 😉)." },
    { points: 9000, description: "Descubre y relájate, Teresa. Con tus 9000 puntos, Hori te lleva a pasar la tarde explorando un pueblo, parque o zona nueva que te apetezca." },
    { points: 9500, description: "¡Elizabeth, a posar! Por tus 9500 puntos, Hori monta una divertida sesión de fotos casera contigo como estrella principal, con un tema o estilo que te guste. ¡Creando recuerdos!" },
    { points: 10000, description: "TERESA ELIZABETH DE GROTEWOLD GARCIA, ¡HAS LOGRADO LA PUNTUACIÓN MÁXIMA! ¡LOS 10000 PUNTOS! ¡Eres una leyenda absoluta del Snake! Como recompensa por esta hazaña monumental, tu Hori hará lo posible para que viajemos a Argentina a ver a C.R.O. cantar en vivo y tener la oportunidad de verlo de cerca. ¡Prepárate para la aventura musical de tu vida!" }
];

// --- Funciones para el Sistema de Recompensas ---

// Encuentra el próximo premio disponible según la puntuación actual
function findNextReward(currentScore) {
    for (const reward of REWARDS_DATABASE) {
        if (reward.points > currentScore) {
            return reward;
        }
    }
    return null; // No hay más premios disponibles
}

// Verifica si se ha alcanzado un premio
function checkForReward(currentScore) {
    for (const reward of REWARDS_DATABASE) {
        if (reward.points === currentScore) {
            // Añadir a la lista de premios pendientes para mostrar al final
            pendingRewards.push(reward);

            // Mostrar un pequeño indicador no intrusivo
            showRewardIndicator(reward.points);

            return reward;
        }
    }
    return null;
}

// Muestra un pequeño indicador no intrusivo de premio ganado
function showRewardIndicator(points) {
    // Actualizar el texto del próximo premio para indicar que se ha ganado algo
    if (nextRewardDisplay) {
        nextRewardDisplay.textContent = `¡Premio de ${points} puntos desbloqueado!`;
        nextRewardDisplay.classList.add('reward-unlocked');

        // Restaurar el texto después de unos segundos
        setTimeout(() => {
            nextRewardDisplay.classList.remove('reward-unlocked');
            updateNextRewardDisplay(); // Actualizar al próximo premio
        }, 3000);
    }
}

// Actualiza el indicador del próximo premio y la barra de progreso
function updateNextRewardDisplay() {
    const nextReward = findNextReward(score);

    // Actualizar texto del próximo premio
    if (nextRewardDisplay) {
        if (nextReward) {
            nextRewardDisplay.textContent = `${nextReward.points} puntos`;
            nextRewardPoints = nextReward.points;
        } else {
            nextRewardDisplay.textContent = "¡Máximo alcanzado!";
        }
    }

    // Verificar si los elementos de la barra de progreso existen
    const progressBar = document.getElementById('rewardProgressBar');
    const currentScoreDisplay = document.getElementById('currentScoreDisplay');
    const targetScoreDisplay = document.getElementById('targetScoreDisplay');

    // Solo actualizar la barra de progreso si los elementos existen
    if (progressBar && currentScoreDisplay && targetScoreDisplay) {
        if (nextReward) {
            // Actualizar barra de progreso
            const previousReward = findPreviousReward(score);
            const previousPoints = previousReward ? previousReward.points : 0;
            const totalPointsNeeded = nextReward.points - previousPoints;
            const currentProgress = score - previousPoints;
            const progressPercentage = Math.min(100, (currentProgress / totalPointsNeeded) * 100);

            // Animar la barra de progreso
            progressBar.style.width = `${progressPercentage}%`;

            // Actualizar los números de progreso
            currentScoreDisplay.textContent = score;
            targetScoreDisplay.textContent = nextReward.points;
        } else {
            // Si ya se alcanzó el máximo
            progressBar.style.width = '100%';
            currentScoreDisplay.textContent = score;
            targetScoreDisplay.textContent = MAX_SCORE;
        }
    }
}

// Encuentra el premio anterior al puntaje actual
function findPreviousReward(currentScore) {
    let previousReward = null;

    for (const reward of REWARDS_DATABASE) {
        if (reward.points <= currentScore) {
            previousReward = reward;
        } else {
            break; // Salir del bucle cuando encontramos un premio mayor que el puntaje actual
        }
    }

    return previousReward;
}

// Muestra el modal de premio con animación
function showRewardModal(reward) {
    // Actualizar el contenido del modal
    rewardDescription.textContent = reward.description;

    // Establecer el texto del botón
    const closeButton = document.getElementById('closeRewardButton');
    closeButton.textContent = '¡Genial!';

    // Mostrar el modal
    rewardModal.classList.remove('hidden');
    rewardModal.classList.add('visible');
    rewardModal.querySelector('.modal-content').classList.add('scale-in');
}

// Genera la lista de premios para el modal
function generateRewardsList() {
    rewardsList.innerHTML = '';

    let currentLevel = 1;
    let levelStarted = false;

    REWARDS_DATABASE.forEach(reward => {
        // Determinar el nivel basado en los puntos
        let level;
        if (reward.points <= 500) level = 1;
        else if (reward.points <= 1000) level = 2;
        else if (reward.points <= 2000) level = 3;
        else if (reward.points <= 5000) level = 4;
        else level = 5;

        // Si cambiamos de nivel, añadir un encabezado
        if (level !== currentLevel) {
            currentLevel = level;
            levelStarted = false;
        }

        if (!levelStarted) {
            const levelHeader = document.createElement('h3');
            levelHeader.textContent = `NIVEL ${level}: ${getLevelTitle(level)}`;
            levelHeader.style.color = getLevelColor(level);
            levelHeader.style.borderBottom = `2px solid ${getLevelColor(level)}`;
            levelHeader.style.paddingBottom = '5px';
            levelHeader.style.marginTop = '20px';
            rewardsList.appendChild(levelHeader);
            levelStarted = true;
        }

        // Crear el elemento del premio
        const rewardItem = document.createElement('div');
        rewardItem.className = 'reward-item';

        // Añadir clase si el premio está desbloqueado
        if (unlockedRewards.includes(reward.points)) {
            rewardItem.classList.add('unlocked');
            rewardItem.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        }

        // Puntos del premio
        const pointsElement = document.createElement('div');
        pointsElement.className = 'reward-points';
        pointsElement.textContent = `${reward.points} puntos`;
        rewardItem.appendChild(pointsElement);

        // Descripción del premio
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'reward-description';
        descriptionElement.textContent = reward.description;
        rewardItem.appendChild(descriptionElement);

        rewardsList.appendChild(rewardItem);
    });
}

// Obtiene el título del nivel según su número
function getLevelTitle(level) {
    switch(level) {
        case 1: return "¡Pequeños Logros, Grandes Detalles!";
        case 2: return "¡Metas Más Grandes, Premios Más Dulces!";
        case 3: return "¡Dominando el Tablero!";
        case 4: return "¡Conquistas el Tablero!";
        case 5: return "¡Leyenda Absoluta de Snake!";
        default: return "";
    }
}

// Obtiene el color del nivel según su número
function getLevelColor(level) {
    switch(level) {
        case 1: return "#00ff00"; // Verde
        case 2: return "#00ffff"; // Cian
        case 3: return "#ffff00"; // Amarillo
        case 4: return "#ff00ff"; // Magenta
        case 5: return "#ff0000"; // Rojo
        default: return "#ffffff";
    }
}

// --- Inicialización del Juego ---
function initializeGame() {
    try {
        // Verificar si ya se han usado todos los intentos del día
        const today = new Date().toLocaleDateString();

        // Si es un nuevo día, reiniciar el contador de intentos
        if (gameDate !== today) {
            dailyAttemptsUsed = 0;
            gameDate = today;
            hasPlayedToday = false;
        }

        // Verificar si se han agotado los intentos diarios
        if (dailyAttemptsUsed >= MAX_DAILY_ATTEMPTS) {
            alert(`¡Ya has usado tus ${MAX_DAILY_ATTEMPTS} intentos de hoy, Teresa Elizabeth! Vuelve mañana para nuevas oportunidades de ganar premios.`);
            return;
        }

        // Incrementar el contador de intentos
        dailyAttemptsUsed++;

        // Guardar el estado actualizado
        saveGameData();

        // Detener cualquier animación anterior
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        // Reiniciar variables básicas
        snake = [
            { x: Math.floor(COLS / 2) * GRID_SIZE, y: Math.floor(ROWS / 2) * GRID_SIZE }, // Cabeza
            { x: (Math.floor(COLS / 2) - 1) * GRID_SIZE, y: Math.floor(ROWS / 2) * GRID_SIZE }, // Segmento 1
            { x: (Math.floor(COLS / 2) - 2) * GRID_SIZE, y: Math.floor(ROWS / 2) * GRID_SIZE }  // Segmento 2
        ];
        dx = GRID_SIZE; // Derecha
        dy = 0;
        score = 0;

        // Actualizar puntuación en la interfaz
        if (scoreDisplay) {
            scoreDisplay.textContent = score;
        }

        // Reiniciar estado del juego
        isGameOver = false;
        changingDirection = false;
        foodParticles = [];
        snakeTrail = [];
        pendingRewards = []; // Reiniciar premios pendientes para esta partida
        window.rewardAlreadyShown = false; // Reiniciar el control de premio mostrado

        // Actualizar interfaz
        if (startButton) {
            startButton.style.display = 'none';
        }
        if (restartButton) {
            restartButton.style.display = 'none';
        }

        // Actualizar el próximo premio
        updateNextRewardDisplay();

        // Reiniciar tiempos
        lastFrameTime = performance.now();
        gameUpdateTime = 0;

        // Generar comida inicial
        generateFood();

        // Marcar que se ha jugado hoy
        hasPlayedToday = true;
        gameDate = today;

        console.log("Juego inicializado correctamente");
    } catch (error) {
        console.error("Error al inicializar el juego:", error);
    }
}

// Función para inicializar las decoraciones laterales (ahora vacía ya que las decoraciones se crean en el DOM)
function initializeSideDecorations() {
    // Esta función ahora está vacía porque las decoraciones se crean en el DOM
    // y no dentro del canvas
}

// Función para iniciar una transición de pantalla
function startScreenTransition(type, callback) {
    screenTransition.active = true;
    screenTransition.type = type;
    screenTransition.progress = 0;

    // Función para animar la transición
    function animateTransition() {
        clearCanvas();

        // Incrementar progreso
        screenTransition.progress += 0.05;

        // Dibujar efecto de transición según el tipo
        if (type === 'fade') {
            // Efecto de fade out/in
            if (screenTransition.progress < 1) {
                // Fase de fade out
                ctx.fillStyle = `rgba(255, 255, 255, ${screenTransition.progress})`;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                requestAnimationFrame(animateTransition);
            } else {
                // Transición completa
                screenTransition.active = false;
                if (callback) callback();
            }
        } else if (type === 'wipe') {
            // Efecto de barrido horizontal
            const width = CANVAS_WIDTH * screenTransition.progress;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, CANVAS_HEIGHT);

            if (screenTransition.progress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                screenTransition.active = false;
                if (callback) callback();
            }
        }
    }

    // Iniciar la animación
    animateTransition();
}

// --- Bucle de Animación Principal (usando requestAnimationFrame) ---
function animationLoop(currentTime) {
    try {
        // Solicitar el próximo frame primero para asegurar animación fluida
        animationFrameId = requestAnimationFrame(animationLoop);

        // Limpiar el canvas con un color de fondo simple
        ctx.fillStyle = '#ffffff'; // Fondo blanco
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Si el juego ha terminado, mostrar pantalla de Game Over y salir
        if (isGameOver) {
            // Usar la función completa de Game Over
            drawGameOver();
            return;
        }

        // Calcular el tiempo delta desde el último frame
        const deltaTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
        gameUpdateTime += deltaTime;

        // Actualizar el juego solo si ha pasado suficiente tiempo
        if (gameUpdateTime >= GAME_SPEED) {
            gameUpdateTime = 0;
            changingDirection = false;

            moveSnake();
            checkCollision();
        }

        // Dibujar el fondo con patrón
        drawBackground();

        // Dibujar animaciones de perritos y gatitos alrededor del área de juego
        drawPetsAnimations();

        // Dibujar el rastro de partículas de comida
        drawFoodParticles();

        // Dibujar la comida y la serpiente
        drawFood();
        drawSnake();

        // Dibujar un borde decorativo para el área de juego
        const borderGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        borderGradient.addColorStop(0, currentSnakeTheme.headColor);
        borderGradient.addColorStop(1, currentSnakeTheme.bodyColor);

        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4, 10);
        ctx.stroke();
    } catch (error) {
        console.error("Error en animationLoop:", error);
    }
}


// --- Funciones de Dibujo ---
function clearCanvas() {
    // Fondo lavender blush consistente con el CSS
    ctx.fillStyle = '#fff0f5';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dibujar un patrón de fondo lindo
    drawBackground();
}

// Función para dibujar un fondo bonito con patrones y animaciones
function drawBackground() {
    // Crear un fondo con degradado pastel similar al de Game Over
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#ffcce6'); // Rosa pastel claro
    gradient.addColorStop(1, '#ff99cc'); // Rosa pastel más intenso
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Obtener el tiempo actual para animaciones
    const time = Date.now() * 0.001;

    // Dibujar corazones decorativos con animación sutil
    for (let i = 0; i < 15; i++) {
        // Posición con movimiento suave basado en el tiempo
        const angle = (i / 15) * Math.PI * 2;
        const wobble = Math.sin(time + i * 0.5) * 5;
        const distance = 50 + Math.sin(time * 0.5 + i) * 20;

        // Distribuir los corazones por los bordes del área de juego
        let x, y;

        if (i < 4) { // Parte superior
            x = CANVAS_WIDTH * (0.2 + (i / 4) * 0.6) + wobble;
            y = distance;
        } else if (i < 8) { // Parte derecha
            x = CANVAS_WIDTH - distance;
            y = CANVAS_HEIGHT * (0.2 + ((i - 4) / 4) * 0.6) + wobble;
        } else if (i < 12) { // Parte inferior
            x = CANVAS_WIDTH * (0.8 - ((i - 8) / 4) * 0.6) + wobble;
            y = CANVAS_HEIGHT - distance;
        } else { // Parte izquierda
            x = distance;
            y = CANVAS_HEIGHT * (0.8 - ((i - 12) / 4) * 0.6) + wobble;
        }

        const size = 8 + Math.sin(time + i) * 3;
        const opacity = 0.2 + Math.sin(time * 0.5 + i) * 0.1;

        ctx.fillStyle = `rgba(255, 102, 179, ${opacity})`;
        drawHeart(x, y, size);
    }

    // Dibujar estrellas decorativas
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const wobble = Math.sin(time * 0.7 + i * 0.5) * 10;
        const distance = 40 + Math.sin(time * 0.3 + i) * 15;

        // Distribuir las estrellas en un patrón circular
        const x = CANVAS_WIDTH / 2 + Math.cos(angle + time * 0.1) * (CANVAS_WIDTH / 3) + wobble;
        const y = CANVAS_HEIGHT / 2 + Math.sin(angle + time * 0.1) * (CANVAS_HEIGHT / 3) + wobble;

        const size = 5 + Math.sin(time + i) * 2;
        const opacity = 0.2 + Math.sin(time * 0.5 + i) * 0.1;

        ctx.fillStyle = `rgba(255, 255, 102, ${opacity})`;
        drawStar(x, y, 5, size, size/2);

        // Añadir un brillo alrededor de algunas estrellas
        if (i % 3 === 0) {
            const glowSize = size * 2;
            const glowOpacity = opacity * 0.5;

            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            glowGradient.addColorStop(0, `rgba(255, 255, 102, ${glowOpacity})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 102, 0)');

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Dibujar círculos decorativos
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const wobble = Math.sin(time * 0.5 + i * 0.7) * 5;

        // Distribuir los círculos en un patrón espiral
        const spiralR = 10 + i * 8;
        const spiralAngle = angle + time * 0.1;
        const x = CANVAS_WIDTH / 2 + Math.cos(spiralAngle) * spiralR + wobble;
        const y = CANVAS_HEIGHT / 2 + Math.sin(spiralAngle) * spiralR + wobble;

        const radius = 2 + Math.sin(time + i) * 1;
        const opacity = 0.15 + Math.sin(time * 0.5 + i) * 0.05;

        ctx.fillStyle = `rgba(204, 51, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Función para dibujar un corazón
function drawHeart(x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
        x - size/2, y - size/2,
        x - size, y + size/3,
        x, y + size
    );
    ctx.bezierCurveTo(
        x + size, y + size/3,
        x + size/2, y - size/2,
        x, y
    );
    ctx.fill();
    ctx.restore();
}

// Función para dibujar animaciones de perritos y gatitos alrededor del área de juego
function drawPetsAnimations() {
    // Obtener el tiempo actual para animaciones
    const time = Date.now() * 0.001;

    // Definir las posiciones de los perritos y gatitos (asomándose desde los bordes del canvas)
    const petPositions = [
        // Lado izquierdo - asomándose desde el borde izquierdo
        { x: -15, y: CANVAS_HEIGHT * 0.2, type: 'dog', direction: 1 },
        { x: -20, y: CANVAS_HEIGHT * 0.5, type: 'cat', direction: 1 },
        { x: -18, y: CANVAS_HEIGHT * 0.8, type: 'dog', direction: 1 },

        // Lado derecho - asomándose desde el borde derecho
        { x: CANVAS_WIDTH - 5, y: CANVAS_HEIGHT * 0.3, type: 'cat', direction: -1 },
        { x: CANVAS_WIDTH - 10, y: CANVAS_HEIGHT * 0.6, type: 'dog', direction: -1 },
        { x: CANVAS_WIDTH - 8, y: CANVAS_HEIGHT * 0.9, type: 'cat', direction: -1 },

        // Parte superior - asomándose desde el borde superior
        { x: CANVAS_WIDTH * 0.25, y: -15, type: 'dog', direction: 1, vertical: true },
        { x: CANVAS_WIDTH * 0.75, y: -20, type: 'cat', direction: 1, vertical: true },

        // Parte inferior - asomándose desde el borde inferior
        { x: CANVAS_WIDTH * 0.4, y: CANVAS_HEIGHT - 5, type: 'cat', direction: -1, vertical: true },
        { x: CANVAS_WIDTH * 0.6, y: CANVAS_HEIGHT - 10, type: 'dog', direction: -1, vertical: true }
    ];

    // Dibujar cada mascota con animación
    petPositions.forEach((pet, index) => {
        // Calcular posición animada
        let animX = pet.x;
        let animY = pet.y;

        if (pet.vertical) {
            // Movimiento vertical - asomarse más hacia el área de juego
            animY += Math.sin(time * 0.5 + index) * 15 * pet.direction;
        } else {
            // Movimiento horizontal - asomarse más hacia el área de juego
            animX += Math.sin(time * 0.5 + index) * 15 * pet.direction;
        }

        // Dibujar la mascota según su tipo con un tamaño mayor para mejor visibilidad
        if (pet.type === 'dog') {
            drawDog(animX, animY, 30, pet.direction, time + index);
        } else {
            drawCat(animX, animY, 30, pet.direction, time + index);
        }
    });
}

// Función para dibujar un perrito
function drawDog(x, y, size, direction, time) {
    ctx.save();

    // Aplicar dirección (voltear horizontalmente si es necesario)
    ctx.translate(x, y);
    if (direction < 0) {
        ctx.scale(-1, 1);
        x = 0;
        y = 0;
    } else {
        x = 0;
        y = 0;
    }

    // Calcular animaciones
    const earWobble = Math.sin(time * 3) * 2;
    const tailWag = Math.sin(time * 5) * 15;

    // Cuerpo (óvalo)
    ctx.fillStyle = '#f9d5a9'; // Color beige claro
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza (círculo)
    ctx.beginPath();
    ctx.arc(x + size * 0.7, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Orejas
    ctx.fillStyle = '#e6b27e'; // Color beige más oscuro

    // Oreja izquierda
    ctx.beginPath();
    ctx.ellipse(
        x + size * 0.5,
        y - size * 0.5 + earWobble,
        size * 0.2,
        size * 0.3,
        Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Oreja derecha
    ctx.beginPath();
    ctx.ellipse(
        x + size * 0.9,
        y - size * 0.5 - earWobble,
        size * 0.2,
        size * 0.3,
        -Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Cola
    ctx.beginPath();
    ctx.moveTo(x - size * 0.7, y);
    ctx.quadraticCurveTo(
        x - size * 0.9,
        y - size * 0.5 + tailWag / 30,
        x - size * 1.1,
        y - size * 0.3 + tailWag / 20
    );
    ctx.lineTo(x - size * 1.2, y - size * 0.4 + tailWag / 10);
    ctx.lineTo(x - size * 1.1, y - size * 0.2 + tailWag / 15);
    ctx.quadraticCurveTo(
        x - size * 0.9,
        y - size * 0.3 + tailWag / 25,
        x - size * 0.7,
        y
    );
    ctx.fill();

    // Patas
    ctx.fillStyle = '#f9d5a9';

    // Pata delantera
    ctx.beginPath();
    ctx.roundRect(x + size * 0.4, y + size * 0.3, size * 0.2, size * 0.4, 5);
    ctx.fill();

    // Pata trasera
    ctx.beginPath();
    ctx.roundRect(x - size * 0.4, y + size * 0.3, size * 0.2, size * 0.4, 5);
    ctx.fill();

    // Ojos
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + size * 0.8, y - size * 0.25, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Nariz
    ctx.fillStyle = '#ff9999';
    ctx.beginPath();
    ctx.ellipse(x + size * 1.1, y - size * 0.15, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Función para dibujar un gatito
function drawCat(x, y, size, direction, time) {
    ctx.save();

    // Aplicar dirección (voltear horizontalmente si es necesario)
    ctx.translate(x, y);
    if (direction < 0) {
        ctx.scale(-1, 1);
        x = 0;
        y = 0;
    } else {
        x = 0;
        y = 0;
    }

    // Calcular animaciones
    const earWobble = Math.sin(time * 2) * 1.5;
    const tailWave = Math.sin(time * 3) * 10;

    // Cuerpo (óvalo)
    ctx.fillStyle = '#b3b3b3'; // Color gris
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.7, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza (círculo)
    ctx.beginPath();
    ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Orejas (triángulos)
    ctx.fillStyle = '#999999'; // Gris más oscuro

    // Oreja izquierda
    ctx.beginPath();
    ctx.moveTo(x + size * 0.45, y - size * 0.4);
    ctx.lineTo(x + size * 0.35, y - size * 0.7 + earWobble);
    ctx.lineTo(x + size * 0.55, y - size * 0.45);
    ctx.closePath();
    ctx.fill();

    // Oreja derecha
    ctx.beginPath();
    ctx.moveTo(x + size * 0.75, y - size * 0.4);
    ctx.lineTo(x + size * 0.85, y - size * 0.7 - earWobble);
    ctx.lineTo(x + size * 0.65, y - size * 0.45);
    ctx.closePath();
    ctx.fill();

    // Cola (curva)
    ctx.beginPath();
    ctx.moveTo(x - size * 0.7, y);
    ctx.bezierCurveTo(
        x - size * 1,
        y - size * 0.2,
        x - size * 1.2,
        y - size * 0.5 + tailWave / 10,
        x - size * 1.3,
        y - size * 0.7 + tailWave / 5
    );
    ctx.lineWidth = size * 0.12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#b3b3b3';
    ctx.stroke();

    // Patas
    ctx.fillStyle = '#b3b3b3';

    // Pata delantera
    ctx.beginPath();
    ctx.roundRect(x + size * 0.3, y + size * 0.2, size * 0.15, size * 0.3, 4);
    ctx.fill();

    // Pata trasera
    ctx.beginPath();
    ctx.roundRect(x - size * 0.3, y + size * 0.2, size * 0.15, size * 0.3, 4);
    ctx.fill();

    // Ojos (almendrados)
    ctx.fillStyle = '#ffcc00'; // Amarillo para los ojos

    // Ojo izquierdo
    ctx.beginPath();
    ctx.ellipse(
        x + size * 0.5,
        y - size * 0.2,
        size * 0.08,
        size * 0.12,
        Math.PI / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Ojo derecho
    ctx.beginPath();
    ctx.ellipse(
        x + size * 0.7,
        y - size * 0.2,
        size * 0.08,
        size * 0.12,
        -Math.PI / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#000000';

    // Pupila izquierda (vertical)
    ctx.beginPath();
    ctx.ellipse(
        x + size * 0.5,
        y - size * 0.2,
        size * 0.02,
        size * 0.08,
        Math.PI / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Pupila derecha (vertical)
    ctx.beginPath();
    ctx.ellipse(
        x + size * 0.7,
        y - size * 0.2,
        size * 0.02,
        size * 0.08,
        Math.PI / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Nariz
    ctx.fillStyle = '#ff9999';
    ctx.beginPath();
    ctx.moveTo(x + size * 0.6, y - size * 0.1);
    ctx.lineTo(x + size * 0.55, y - size * 0.05);
    ctx.lineTo(x + size * 0.65, y - size * 0.05);
    ctx.closePath();
    ctx.fill();

    // Bigotes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Bigotes izquierdos
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y - size * 0.05);
    ctx.lineTo(x + size * 0.2, y - size * 0.1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y);
    ctx.lineTo(x + size * 0.2, y);
    ctx.stroke();

    // Bigotes derechos
    ctx.beginPath();
    ctx.moveTo(x + size * 0.7, y - size * 0.05);
    ctx.lineTo(x + size * 1, y - size * 0.1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + size * 0.7, y);
    ctx.lineTo(x + size * 1, y);
    ctx.stroke();

    ctx.restore();
}

// Función mejorada para dibujar la serpiente con efectos visuales y decoraciones
function drawSnake() {
    try {
        // Primero dibujar el rastro de la serpiente si existe
        if (snakeTrail.length > 0) {
            drawSnakeTrail();
        }

        // Obtener el tiempo actual para animaciones
        const time = Date.now() * 0.001;

        // Aplicar animaciones según el tema actual
        let animationOffsets = [];

        // Calcular offsets de animación para cada segmento
        snake.forEach((segment, index) => {
            let offsetX = 0;
            let offsetY = 0;

            // Aplicar diferentes animaciones según el tema
            switch(currentSnakeTheme.animation) {
                case 'bounce':
                    // Efecto de rebote suave, más pronunciado en la cabeza
                    offsetY = Math.sin(time * 3 + index * 0.3) * (index === 0 ? 3 : 2);
                    break;

                case 'wiggle':
                    // Movimiento ondulante lateral
                    offsetX = Math.sin(time * 2 + index * 0.5) * (index === 0 ? 2 : 3);
                    break;

                case 'pulse':
                    // El pulso se maneja en el tamaño, no en el offset
                    break;

                case 'sparkle':
                    // Pequeño movimiento aleatorio para efecto de destello
                    offsetX = Math.sin(time * 4 + index) * (index === 0 ? 1 : 1.5);
                    offsetY = Math.cos(time * 3 + index) * (index === 0 ? 1 : 1.5);
                    break;

                case 'wave':
                    // Movimiento ondulante más pronunciado
                    offsetX = Math.sin(time * 2 + index * 0.4) * 3;
                    offsetY = Math.cos(time * 1.5 + index * 0.4) * 2;
                    break;

                case 'glimmer':
                    // Movimiento sutil para el efecto de brillo
                    offsetX = Math.sin(time * 3 + index * 0.2) * 1.5;
                    offsetY = Math.cos(time * 2.5 + index * 0.2) * 1.5;
                    break;
            }

            animationOffsets.push({ x: offsetX, y: offsetY });
        });

        // Dibujar cada segmento de la serpiente
        snake.forEach((segment, index) => {
            // Determinar si es la cabeza o el cuerpo
            const isHead = index === 0;

            // Aplicar offsets de animación
            const animatedX = segment.x + animationOffsets[index].x;
            const animatedY = segment.y + animationOffsets[index].y;

            // Calcular el tamaño del segmento con posible efecto de pulso
            let segmentSize = GRID_SIZE - 2;

            // Efecto de pulso para la animación 'pulse'
            if (currentSnakeTheme.animation === 'pulse') {
                const pulseFactor = 1 + Math.sin(time * 3 + index * 0.2) * 0.1; // Factor entre 0.9 y 1.1
                segmentSize *= pulseFactor;
            }

            // Establecer colores según el tema actual
            let fillColor, strokeColor;

            if (isHead) {
                // Colores para la cabeza
                fillColor = currentSnakeTheme.headColor;
                strokeColor = '#ffffff'; // Borde blanco para la cabeza
            } else {
                // Colores para el cuerpo según el estilo
                if (currentSnakeTheme.style === 'rainbow') {
                    // Para el tema arcoíris, usar colores basados en la posición
                    const hue = (index * 15 + time * 50) % 360; // Cambio de color suave
                    fillColor = `hsl(${hue}, 80%, 70%)`;
                    strokeColor = `hsl(${hue}, 90%, 60%)`;
                } else {
                    // Para otros temas, usar gradiente basado en la posición
                    const gradientFactor = 1 - (index / snake.length) * 0.3; // Factor entre 0.7 y 1

                    // Convertir el color hexadecimal a componentes RGB
                    const r = parseInt(currentSnakeTheme.bodyColor.slice(1, 3), 16);
                    const g = parseInt(currentSnakeTheme.bodyColor.slice(3, 5), 16);
                    const b = parseInt(currentSnakeTheme.bodyColor.slice(5, 7), 16);

                    // Aplicar el factor de gradiente
                    fillColor = `rgb(${Math.floor(r * gradientFactor)}, ${Math.floor(g * gradientFactor)}, ${Math.floor(b * gradientFactor)})`;
                    strokeColor = currentSnakeTheme.bodyColor;
                }
            }

            // Dibujar el segmento según la forma seleccionada
            if (currentSnakeTheme.shape === 'caterpillar') {
                // Forma de oruga: círculos para el cuerpo, forma especial para la cabeza
                ctx.fillStyle = fillColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;

                if (isHead) {
                    // Cabeza más grande y ovalada
                    ctx.save();
                    ctx.translate(animatedX + GRID_SIZE/2, animatedY + GRID_SIZE/2);

                    // Rotar según la dirección
                    let rotation = 0;
                    if (dx > 0) rotation = 0; // Derecha
                    else if (dx < 0) rotation = Math.PI; // Izquierda
                    else if (dy > 0) rotation = Math.PI/2; // Abajo
                    else rotation = -Math.PI/2; // Arriba

                    ctx.rotate(rotation);

                    // Dibujar cabeza ovalada
                    ctx.beginPath();
                    ctx.ellipse(0, 0, segmentSize/1.5, segmentSize/1.8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    ctx.restore();

                    // Dibujar detalles de la cabeza
                    drawSnakeHead(segment, segmentSize, time, animationOffsets[index]);
                } else {
                    // Cuerpo: círculos con tamaño variable según la posición
                    const sizeVariation = 1 - Math.sin(index * 0.5) * 0.1; // Variación sutil
                    const bodySize = segmentSize * sizeVariation;

                    ctx.beginPath();
                    ctx.arc(
                        animatedX + GRID_SIZE/2,
                        animatedY + GRID_SIZE/2,
                        bodySize/2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.stroke();

                    // Añadir decoraciones según el estilo del tema
                    drawSnakeSegmentDecoration(
                        {x: animatedX, y: animatedY},
                        index,
                        bodySize,
                        time
                    );
                }
            } else {
                // Forma original (rectángulos redondeados) como respaldo
                ctx.fillStyle = fillColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.roundRect(
                    animatedX + 1,
                    animatedY + 1,
                    segmentSize,
                    segmentSize,
                    isHead ? 8 : 4
                );
                ctx.fill();
                ctx.stroke();

                // Añadir decoraciones según el estilo del tema
                if (!isHead) {
                    drawSnakeSegmentDecoration(
                        {x: animatedX, y: animatedY},
                        index,
                        segmentSize,
                        time
                    );
                }

                // Si es la cabeza, añadir detalles especiales
                if (isHead) {
                    drawSnakeHead(segment, segmentSize, time, animationOffsets[index]);
                }
            }
        });
    } catch (error) {
        console.error("Error en drawSnake:", error);

        // Versión de respaldo simple en caso de error
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? currentSnakeTheme.headColor : currentSnakeTheme.bodyColor;
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        });
    }
}

// Función para dibujar la cabeza de la serpiente con detalles
function drawSnakeHead(segment, segmentSize, time, offset = {x: 0, y: 0}) {
    // Aplicar offset de animación si se proporciona
    const x = segment.x + (offset ? offset.x : 0);
    const y = segment.y + (offset ? offset.y : 0);

    // Centro de la cabeza
    const centerX = x + GRID_SIZE/2;
    const centerY = y + GRID_SIZE/2;

    // Determinar la dirección de la cabeza para posicionar los ojos y la boca
    let eyeAngle1, eyeAngle2, mouthAngle;
    let eyeDistance = segmentSize/3;

    if (dx > 0) { // Derecha
        eyeAngle1 = -Math.PI/4; // Arriba derecha
        eyeAngle2 = Math.PI/4;  // Abajo derecha
        mouthAngle = 0;         // Derecha
    } else if (dx < 0) { // Izquierda
        eyeAngle1 = 3*Math.PI/4;  // Arriba izquierda
        eyeAngle2 = -3*Math.PI/4; // Abajo izquierda
        mouthAngle = Math.PI;     // Izquierda
    } else if (dy > 0) { // Abajo
        eyeAngle1 = Math.PI/4;     // Abajo derecha
        eyeAngle2 = 3*Math.PI/4;   // Abajo izquierda
        mouthAngle = Math.PI/2;    // Abajo
    } else { // Arriba
        eyeAngle1 = -Math.PI/4;    // Arriba derecha
        eyeAngle2 = -3*Math.PI/4;  // Arriba izquierda
        mouthAngle = -Math.PI/2;   // Arriba
    }

    // Calcular posiciones de los ojos
    const eyeX1 = centerX + Math.cos(eyeAngle1) * eyeDistance;
    const eyeY1 = centerY + Math.sin(eyeAngle1) * eyeDistance;
    const eyeX2 = centerX + Math.cos(eyeAngle2) * eyeDistance;
    const eyeY2 = centerY + Math.sin(eyeAngle2) * eyeDistance;

    // Calcular posición de la boca
    const mouthDistance = segmentSize/2;
    const mouthX = centerX + Math.cos(mouthAngle) * mouthDistance;
    const mouthY = centerY + Math.sin(mouthAngle) * mouthDistance;

    // Dibujar antenas (para la forma de oruga)
    if (currentSnakeTheme.shape === 'caterpillar') {
        ctx.strokeStyle = currentSnakeTheme.patternColor;
        ctx.lineWidth = 1.5;

        // Ángulo base para las antenas según la dirección
        let antennaBaseAngle;
        if (dx > 0) antennaBaseAngle = -Math.PI/2; // Derecha -> antenas hacia arriba
        else if (dx < 0) antennaBaseAngle = Math.PI/2; // Izquierda -> antenas hacia arriba
        else if (dy > 0) antennaBaseAngle = 0; // Abajo -> antenas hacia los lados
        else antennaBaseAngle = Math.PI; // Arriba -> antenas hacia los lados

        // Antena 1
        const antenna1Angle = antennaBaseAngle - Math.PI/6;
        const antenna1Length = segmentSize * 0.8;
        const antenna1EndX = centerX + Math.cos(antenna1Angle) * antenna1Length;
        const antenna1EndY = centerY + Math.sin(antenna1Angle) * antenna1Length;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(antenna1EndX, antenna1EndY);
        ctx.stroke();

        // Pequeña bola al final de la antena 1
        ctx.fillStyle = currentSnakeTheme.patternColor;
        ctx.beginPath();
        ctx.arc(antenna1EndX, antenna1EndY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Antena 2
        const antenna2Angle = antennaBaseAngle + Math.PI/6;
        const antenna2Length = segmentSize * 0.8;
        const antenna2EndX = centerX + Math.cos(antenna2Angle) * antenna2Length;
        const antenna2EndY = centerY + Math.sin(antenna2Angle) * antenna2Length;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(antenna2EndX, antenna2EndY);
        ctx.stroke();

        // Pequeña bola al final de la antena 2
        ctx.beginPath();
        ctx.arc(antenna2EndX, antenna2EndY, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dibujar ojos con brillo
    const eyeSize = 4; // Ojos más grandes
    const pupilSize = 2;
    const blinkFactor = Math.sin(time * 3) > 0.95 ? 0.2 : 1; // Parpadeo ocasional

    // Fondo del ojo (blanco)
    ctx.fillStyle = currentSnakeTheme.eyeColor;

    // Ojo 1
    ctx.beginPath();
    ctx.ellipse(
        eyeX1,
        eyeY1,
        eyeSize,
        eyeSize * blinkFactor,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Ojo 2
    ctx.beginPath();
    ctx.ellipse(
        eyeX2,
        eyeY2,
        eyeSize,
        eyeSize * blinkFactor,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Pupilas (solo si no está parpadeando)
    if (blinkFactor > 0.5) {
        ctx.fillStyle = '#000000';

        // Pupila 1 con movimiento suave
        const pupilOffsetX = Math.sin(time) * 1;
        const pupilOffsetY = Math.cos(time * 1.2) * 1;

        ctx.beginPath();
        ctx.arc(
            eyeX1 + pupilOffsetX,
            eyeY1 + pupilOffsetY,
            pupilSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Pupila 2 con el mismo movimiento
        ctx.beginPath();
        ctx.arc(
            eyeX2 + pupilOffsetX,
            eyeY2 + pupilOffsetY,
            pupilSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Brillo en los ojos
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.7;

        // Brillo ojo 1
        ctx.beginPath();
        ctx.arc(
            eyeX1 - 1,
            eyeY1 - 1,
            pupilSize * 0.6,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Brillo ojo 2
        ctx.beginPath();
        ctx.arc(
            eyeX2 - 1,
            eyeY2 - 1,
            pupilSize * 0.6,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    // Dibujar boca según la forma
    if (currentSnakeTheme.shape === 'caterpillar') {
        // Para la oruga, dibujar una sonrisa curva
        ctx.strokeStyle = '#ff3366'; // Color rosa para la boca
        ctx.lineWidth = 2;

        // Ángulo para la sonrisa según la dirección
        let smileStartAngle, smileEndAngle;

        if (dx > 0) { // Derecha
            smileStartAngle = -Math.PI/4;
            smileEndAngle = Math.PI/4;
        } else if (dx < 0) { // Izquierda
            smileStartAngle = 3*Math.PI/4;
            smileEndAngle = 5*Math.PI/4;
        } else if (dy > 0) { // Abajo
            smileStartAngle = Math.PI/4;
            smileEndAngle = 3*Math.PI/4;
        } else { // Arriba
            smileStartAngle = -3*Math.PI/4;
            smileEndAngle = -Math.PI/4;
        }

        // Dibujar sonrisa como un arco
        ctx.beginPath();
        ctx.arc(
            centerX + Math.cos(mouthAngle) * (segmentSize/4),
            centerY + Math.sin(mouthAngle) * (segmentSize/4),
            segmentSize/4,
            smileStartAngle,
            smileEndAngle
        );
        ctx.stroke();
    } else {
        // Boca rectangular para la forma original
        ctx.fillStyle = '#ff3366'; // Color rosa para la boca

        // Tamaño y posición según la dirección
        let mouthWidth, mouthHeight;
        if (dx !== 0) { // Horizontal
            mouthWidth = 2;
            mouthHeight = 4;
        } else { // Vertical
            mouthWidth = 4;
            mouthHeight = 2;
        }

        ctx.beginPath();
        ctx.roundRect(
            mouthX - mouthWidth/2,
            mouthY - mouthHeight/2,
            mouthWidth,
            mouthHeight,
            1
        );
        ctx.fill();
    }

    // Añadir detalles según el tema
    if (currentSnakeTheme.style === 'magical') {
        // Dibujar un pequeño cuerno para el tema unicornio mejorado
        ctx.save();

        // Posición del cuerno según la dirección
        let hornX, hornY, hornAngle;

        if (dx > 0) { // Derecha
            hornX = centerX;
            hornY = centerY - segmentSize/2;
            hornAngle = -Math.PI/2;
        } else if (dx < 0) { // Izquierda
            hornX = centerX;
            hornY = centerY - segmentSize/2;
            hornAngle = -Math.PI/2;
        } else if (dy > 0) { // Abajo
            hornX = centerX + segmentSize/2;
            hornY = centerY;
            hornAngle = 0;
        } else { // Arriba
            hornX = centerX - segmentSize/2;
            hornY = centerY;
            hornAngle = Math.PI;
        }

        ctx.translate(hornX, hornY);
        ctx.rotate(hornAngle);

        // Gradiente para el cuerno
        const hornGradient = ctx.createLinearGradient(0, 0, 0, -10);
        hornGradient.addColorStop(0, '#ffccff');
        hornGradient.addColorStop(0.5, '#ff66ff');
        hornGradient.addColorStop(1, '#cc99ff');

        // Dibujar cuerno más elaborado
        ctx.fillStyle = hornGradient;
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(0, -12);
        ctx.lineTo(3, 0);
        ctx.closePath();
        ctx.fill();

        // Brillo en el cuerno
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);
        ctx.stroke();

        // Destellos alrededor del cuerno
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
            const starAngle = time * 2 + (i * Math.PI * 2 / 3);
            const starX = Math.cos(starAngle) * 8;
            const starY = Math.sin(starAngle) * 8 - 6;
            const starSize = 1 + Math.sin(time * 3 + i) * 0.5;

            ctx.globalAlpha = 0.6 + Math.sin(time * 4 + i) * 0.4;
            ctx.beginPath();
            ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.restore();
    }

    // Añadir mejillas rosadas para la forma de oruga
    if (currentSnakeTheme.shape === 'caterpillar') {
        ctx.fillStyle = 'rgba(255, 150, 150, 0.6)';

        // Posición de las mejillas según la dirección
        let cheekAngle1, cheekAngle2;

        if (dx > 0) { // Derecha
            cheekAngle1 = -Math.PI/2.5;
            cheekAngle2 = Math.PI/2.5;
        } else if (dx < 0) { // Izquierda
            cheekAngle1 = Math.PI - Math.PI/2.5;
            cheekAngle2 = Math.PI + Math.PI/2.5;
        } else if (dy > 0) { // Abajo
            cheekAngle1 = 0 - Math.PI/2.5;
            cheekAngle2 = Math.PI + Math.PI/2.5;
        } else { // Arriba
            cheekAngle1 = 0 + Math.PI/2.5;
            cheekAngle2 = Math.PI - Math.PI/2.5;
        }

        const cheekDistance = segmentSize/2.2;
        const cheekSize = 3;

        // Mejilla 1
        ctx.beginPath();
        ctx.arc(
            centerX + Math.cos(cheekAngle1) * cheekDistance,
            centerY + Math.sin(cheekAngle1) * cheekDistance,
            cheekSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Mejilla 2
        ctx.beginPath();
        ctx.arc(
            centerX + Math.cos(cheekAngle2) * cheekDistance,
            centerY + Math.sin(cheekAngle2) * cheekDistance,
            cheekSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Función para dibujar decoraciones en los segmentos del cuerpo según el estilo
function drawSnakeSegmentDecoration(segment, index, segmentSize, time) {
    const x = segment.x + segmentSize / 2;
    const y = segment.y + segmentSize / 2;

    // Aplicar decoraciones según el estilo del tema
    switch(currentSnakeTheme.style) {
        case 'flower':
            // Dibujar pequeñas flores en segmentos alternos
            if (index % 3 === 1) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(time * 0.5 + index * 0.1); // Rotación suave

                // Pétalos de la flor
                const petalCount = 5;
                const petalSize = segmentSize * 0.3;

                for (let i = 0; i < petalCount; i++) {
                    const angle = (i / petalCount) * Math.PI * 2;
                    const petalX = Math.cos(angle) * (segmentSize * 0.25);
                    const petalY = Math.sin(angle) * (segmentSize * 0.25);

                    // Color del pétalo con variación
                    const hue = (index * 30 + i * 20 + time * 10) % 360;
                    ctx.fillStyle = `hsl(${hue}, 80%, 80%)`;

                    // Dibujar pétalo
                    ctx.beginPath();
                    ctx.ellipse(
                        petalX,
                        petalY,
                        petalSize * 0.4,
                        petalSize * 0.6,
                        angle,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                // Centro de la flor
                ctx.fillStyle = '#ffff66'; // Amarillo para el centro
                ctx.beginPath();
                ctx.arc(0, 0, segmentSize * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // Detalles en el centro
                ctx.fillStyle = '#ff9933'; // Naranja para los detalles
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const dotX = Math.cos(angle) * (segmentSize * 0.08);
                    const dotY = Math.sin(angle) * (segmentSize * 0.08);

                    ctx.beginPath();
                    ctx.arc(dotX, dotY, segmentSize * 0.03, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
            break;

        case 'butterfly':
            // Dibujar pequeñas mariposas en segmentos específicos
            if (index % 4 === 2) {
                ctx.save();
                ctx.translate(x, y);

                // Rotación suave con oscilación
                const rotationAngle = Math.sin(time + index * 0.2) * 0.3;
                ctx.rotate(rotationAngle);

                // Factor de aleteo
                const wingFlapFactor = Math.sin(time * 5 + index) * 0.5 + 0.5; // Entre 0 y 1

                // Colores para las alas
                const wingGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, segmentSize * 0.4);
                wingGradient.addColorStop(0, currentSnakeTheme.patternColor);
                wingGradient.addColorStop(1, currentSnakeTheme.bodyColor);

                // Dibujar alas superiores
                ctx.fillStyle = wingGradient;

                // Ala superior izquierda
                ctx.beginPath();
                ctx.ellipse(
                    -segmentSize * 0.15,
                    -segmentSize * 0.1,
                    segmentSize * 0.25 * wingFlapFactor,
                    segmentSize * 0.3,
                    -Math.PI/4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Ala superior derecha
                ctx.beginPath();
                ctx.ellipse(
                    segmentSize * 0.15,
                    -segmentSize * 0.1,
                    segmentSize * 0.25 * wingFlapFactor,
                    segmentSize * 0.3,
                    Math.PI/4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Alas inferiores con color ligeramente diferente
                ctx.fillStyle = currentSnakeTheme.patternColor;

                // Ala inferior izquierda
                ctx.beginPath();
                ctx.ellipse(
                    -segmentSize * 0.12,
                    segmentSize * 0.1,
                    segmentSize * 0.2 * wingFlapFactor,
                    segmentSize * 0.25,
                    Math.PI/6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Ala inferior derecha
                ctx.beginPath();
                ctx.ellipse(
                    segmentSize * 0.12,
                    segmentSize * 0.1,
                    segmentSize * 0.2 * wingFlapFactor,
                    segmentSize * 0.25,
                    -Math.PI/6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Cuerpo de la mariposa
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.ellipse(0, 0, segmentSize * 0.05, segmentSize * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Antenas
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1;

                // Antena izquierda
                ctx.beginPath();
                ctx.moveTo(0, -segmentSize * 0.15);
                ctx.lineTo(-segmentSize * 0.15, -segmentSize * 0.25);
                ctx.stroke();

                // Antena derecha
                ctx.beginPath();
                ctx.moveTo(0, -segmentSize * 0.15);
                ctx.lineTo(segmentSize * 0.15, -segmentSize * 0.25);
                ctx.stroke();

                // Pequeñas bolas en las puntas de las antenas
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(-segmentSize * 0.15, -segmentSize * 0.25, segmentSize * 0.03, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(segmentSize * 0.15, -segmentSize * 0.25, segmentSize * 0.03, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
            break;

        case 'rainbow':
            // Mantener el efecto arcoíris como está (ya es muy bonito)
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.3 + Math.sin(time * 3 + index * 0.5) * 0.1;

            ctx.beginPath();
            ctx.arc(x, y, segmentSize / 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
            break;

        case 'magical':
            // Efecto mágico con estrellas y destellos
            // Dibujar pequeñas estrellas en segmentos específicos
            if (index % 3 === 1) {
                ctx.fillStyle = '#ffffff';
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(time + index * 0.1); // Rotación suave

                // Dibujar estrella pequeña
                const starSize = segmentSize * 0.3;
                const innerRadius = starSize * 0.4;

                // Estrella con color cambiante
                const hue = (index * 20 + time * 30) % 360;
                ctx.fillStyle = `hsl(${hue}, 80%, 75%)`;

                drawStar(0, 0, 5, starSize, innerRadius);

                // Borde blanco para la estrella
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.restore();
            }

            // Añadir destellos mágicos en todos los segmentos
            const sparkleCount = 2;
            ctx.fillStyle = '#ffffff';

            for (let i = 0; i < sparkleCount; i++) {
                const sparkleAngle = time * 2 + (i * Math.PI * 2 / sparkleCount) + index * 0.5;
                const distance = segmentSize * 0.3;
                const sparkleX = x + Math.cos(sparkleAngle) * distance;
                const sparkleY = y + Math.sin(sparkleAngle) * distance;
                const sparkleSize = 1 + Math.sin(time * 3 + i + index) * 0.5;

                ctx.globalAlpha = 0.6 + Math.sin(time * 4 + i + index) * 0.4;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            break;

        case 'mermaid':
            // Patrón de escamas mejorado para el tema sirena
            ctx.save();
            ctx.translate(x, y);

            // Escama principal con brillo
            const scaleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, segmentSize * 0.4);
            scaleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            scaleGradient.addColorStop(0.5, currentSnakeTheme.patternColor);
            scaleGradient.addColorStop(1, currentSnakeTheme.bodyColor);

            ctx.fillStyle = scaleGradient;

            // Dibujar escama con forma de abanico
            ctx.beginPath();
            ctx.arc(0, 0, segmentSize * 0.4, Math.PI * 0.8, Math.PI * 2.2, false);
            ctx.lineTo(0, segmentSize * 0.1);
            ctx.closePath();
            ctx.fill();

            // Borde de la escama
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Detalles internos de la escama
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 0.5;

            // Líneas curvas dentro de la escama
            for (let i = 1; i <= 2; i++) {
                const radius = segmentSize * 0.4 * (i / 3);
                ctx.beginPath();
                ctx.arc(0, 0, radius, Math.PI * 0.8, Math.PI * 2.2, false);
                ctx.stroke();
            }

            // Pequeñas burbujas alrededor (efecto submarino)
            if (index % 4 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

                for (let i = 0; i < 3; i++) {
                    const bubbleAngle = time * 1.5 + (i * Math.PI * 2 / 3) + index * 0.2;
                    const bubbleDistance = segmentSize * 0.5;
                    const bubbleX = Math.cos(bubbleAngle) * bubbleDistance;
                    const bubbleY = Math.sin(bubbleAngle) * bubbleDistance;
                    const bubbleSize = 1 + Math.sin(time * 2 + i) * 0.5;

                    ctx.globalAlpha = 0.4 + Math.sin(time * 3 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            }

            ctx.restore();
            break;

        case 'glitter':
            // Mantener el efecto de purpurina como está (ya es muy bonito)
            const glitterCount = 3;
            ctx.fillStyle = '#ffffff';

            for (let i = 0; i < glitterCount; i++) {
                // Posición basada en el tiempo y el índice para que parezca que brilla
                const glitterX = x + Math.cos(time * 3 + i * Math.PI * 2 / glitterCount + index) * (segmentSize / 3);
                const glitterY = y + Math.sin(time * 2 + i * Math.PI * 2 / glitterCount + index) * (segmentSize / 3);

                // Opacidad pulsante
                ctx.globalAlpha = 0.2 + Math.sin(time * 5 + i + index) * 0.3;

                // Tamaño variable
                const glitterSize = 1 + Math.sin(time * 4 + i + index) * 0.5;

                // Dibujar punto brillante
                ctx.beginPath();
                ctx.arc(glitterX, glitterY, glitterSize, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            break;

        default:
            // Efecto de brillo simple para temas sin decoración específica
            const pulseIntensity = Math.sin(time * 2 + index * 0.2) * 0.5 + 0.5; // Valor entre 0 y 1

            ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, segmentSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
    }
}

// Función para dibujar el rastro de la serpiente
function drawSnakeTrail() {
    // Actualizar y dibujar cada segmento del rastro
    for (let i = snakeTrail.length - 1; i >= 0; i--) {
        const trail = snakeTrail[i];

        // Reducir la vida del rastro
        trail.life--;

        // Eliminar rastros que ya no son visibles
        if (trail.life <= 0) {
            snakeTrail.splice(i, 1);
            continue;
        }

        // Calcular la opacidad basada en la vida restante
        const opacity = trail.life / trailLifespan;
        const size = GRID_SIZE * (0.5 + opacity * 0.5); // Tamaño que se reduce con el tiempo

        // Dibujar el rastro como un círculo semitransparente
        ctx.fillStyle = `rgba(${parseInt(currentSnakeTheme.bodyColor.slice(1, 3), 16)},
                              ${parseInt(currentSnakeTheme.bodyColor.slice(3, 5), 16)},
                              ${parseInt(currentSnakeTheme.bodyColor.slice(5, 7), 16)},
                              ${opacity * 0.3})`;

        ctx.beginPath();
        ctx.arc(
            trail.x + GRID_SIZE / 2,
            trail.y + GRID_SIZE / 2,
            size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function drawFood() {
    try {
        // Calcular el tiempo para las animaciones
        const time = Date.now() * 0.001; // Tiempo en segundos para la animación
        const pulseFactor = 1 + Math.sin(time * 2) * 0.3; // Factor de pulso aumentado entre 0.7 y 1.3
        const rotationFactor = time * 1.5; // Rotación constante

        // Aplicar brillo variable más intenso
        const brightness = 1.5 + Math.sin(time * 2.5) * 0.5; // Brillo entre 1.0 y 2.0

        // Decidir aleatoriamente qué tipo de comida dibujar (8 tipos diferentes)
        // Usamos el tiempo para cambiar periódicamente, pero mantenemos la misma comida durante un tiempo
        const foodType = Math.floor((time / 8) % 8); // Cambia cada ~8 segundos, 8 tipos diferentes

        // Configurar sombra más intensa para todos los tipos
        ctx.shadowColor = `rgba(255, 255, 255, ${0.9 + Math.sin(time * 3) * 0.1})`; // Sombra blanca para mejor contraste
        ctx.shadowBlur = 25 * brightness; // Sombra más grande

        // Centro de la comida
        const centerX = food.x + GRID_SIZE / 2;
        const centerY = food.y + GRID_SIZE / 2;

        // Tamaño base aumentado para todas las comidas
        const baseSize = GRID_SIZE * 1.2; // 120% del tamaño de la celda para mayor visibilidad

        // Dibujar un resplandor de fondo para todas las comidas
        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, baseSize * 1.5
        );
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseSize * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar según el tipo de comida
        switch(foodType) {
            case 0: // Diamante azul brillante
                ctx.fillStyle = '#00FFFF'; // Cian brillante (más visible que el azul)
                ctx.strokeStyle = '#FFFFFF'; // Borde blanco
                ctx.lineWidth = 3; // Borde más grueso

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(rotationFactor * 0.5);
                ctx.scale(pulseFactor * 1.3, pulseFactor * 1.3); // Escala aumentada

                // Dibujar diamante
                ctx.beginPath();
                ctx.moveTo(0, -baseSize/2);
                ctx.lineTo(baseSize/2, 0);
                ctx.lineTo(0, baseSize/2);
                ctx.lineTo(-baseSize/2, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Añadir brillo interior
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, -baseSize/6);
                ctx.lineTo(baseSize/6, 0);
                ctx.lineTo(0, baseSize/6);
                ctx.lineTo(-baseSize/6, 0);
                ctx.closePath();
                ctx.fill();

                // Añadir destellos alrededor del diamante
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2 + time;
                    const sparkleX = Math.cos(angle) * (baseSize/1.5);
                    const sparkleY = Math.sin(angle) * (baseSize/1.5);
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.restore();
                break;

            case 1: // Estrella brillante
                // Gradiente para la estrella con colores más intensos
                const starGradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, baseSize / 1.5 * pulseFactor
                );
                starGradient.addColorStop(0, '#FFFFFF');
                starGradient.addColorStop(0.3, '#FFFF00'); // Amarillo más intenso
                starGradient.addColorStop(1, '#FFA500'); // Naranja para mejor contraste

                // Borde para la estrella
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;

                ctx.fillStyle = starGradient;

                // Dibujar la estrella principal con tamaño variable (más grande)
                drawStar(
                    centerX,
                    centerY,
                    5,
                    baseSize / 1.5 * pulseFactor,
                    baseSize / 3 * pulseFactor
                );

                // Añadir borde a la estrella principal
                ctx.stroke();

                // Añadir un resplandor adicional rotando
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(time * 1.5); // Rotación más rápida
                ctx.globalAlpha = 0.6; // Más visible

                // Estrella exterior rotando
                ctx.fillStyle = '#FFFF33'; // Amarillo más brillante
                drawStar(
                    0,
                    0,
                    5,
                    baseSize / 1.3 * pulseFactor,
                    baseSize / 2.6 * pulseFactor
                );

                // Añadir destellos alrededor de la estrella
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 + time * 2;
                    const distance = baseSize / 1.2 + Math.sin(time * 3 + i) * 5;
                    const sparkleSize = 3 + Math.sin(time * 5 + i) * 2;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.8 + Math.sin(time * 4 + i) * 0.2;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.restore();
                break;

            case 2: // Flor colorida con colores más brillantes
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(pulseFactor * 1.3, pulseFactor * 1.3); // Escala aumentada
                ctx.rotate(time * 0.3); // Rotación lenta de toda la flor

                // Dibujar pétalos con colores más brillantes y contrastantes
                const petalColors = ['#FF3366', '#33CCFF', '#FFCC00', '#66FF66', '#FF66FF', '#FF9900'];
                const petalCount = 6; // Más pétalos
                const petalLength = baseSize/3;
                const petalWidth = baseSize/5;

                // Borde blanco para todos los pétalos
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;

                for (let i = 0; i < petalCount; i++) {
                    ctx.fillStyle = petalColors[i % petalColors.length];
                    ctx.save();
                    ctx.rotate((Math.PI * 2 / petalCount) * i + time * 0.5); // Rotación suave

                    // Dibujar pétalo más grande
                    ctx.beginPath();
                    ctx.ellipse(0, -petalLength/1.5, petalWidth, petalLength, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke(); // Añadir borde blanco

                    // Añadir brillo al pétalo
                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();
                    ctx.ellipse(0, -petalLength/1.5, petalWidth/2, petalLength/2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    ctx.restore();
                }

                // Centro de la flor más grande y brillante
                ctx.fillStyle = '#FFCC00'; // Amarillo más brillante
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke(); // Añadir borde blanco

                // Detalles en el centro
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = baseSize/10;

                    ctx.fillStyle = '#FF6600'; // Naranja
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        baseSize/20,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                // Brillo en el centro
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/10, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // Añadir destellos alrededor de la flor
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + time * 2;
                    const distance = baseSize/1.2 + Math.sin(time * 3 + i) * 3;
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.globalAlpha = 1;

                ctx.restore();
                break;

            case 3: // Emoji con brillo mejorado
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(pulseFactor * 1.5, pulseFactor * 1.5); // Escala aumentada significativamente

                // Seleccionar un emoji juvenil (solo los más visibles)
                const emojis = ['🌟', '💖', '🦄', '🌈', '✨', '💎', '🎀'];
                const emojiIndex = Math.floor((time / 5) % emojis.length); // Cambiar cada ~5 segundos

                // Dibujar fondo brillante más grande e intenso
                const glowGradient = ctx.createRadialGradient(0, 0, 2, 0, 0, baseSize/2);
                glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                glowGradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)'); // Amarillo para mejor contraste
                glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/2, 0, Math.PI * 2);
                ctx.fill();

                // Dibujar círculo de fondo para el emoji
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/4, 0, Math.PI * 2);
                ctx.fill();

                // Borde para el círculo
                ctx.strokeStyle = '#FFCC00';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Dibujar el emoji más grande
                ctx.font = 'bold 20px Arial'; // Fuente más grande y en negrita
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emojis[emojiIndex], 0, 0);

                // Añadir destellos orbitando alrededor del emoji
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + time * 2;
                    const distance = baseSize/2 + Math.sin(time * 3 + i) * 5;
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.8 + Math.sin(time * 4 + i) * 0.2;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                // Añadir un efecto de rotación de pequeñas estrellas
                ctx.save();
                ctx.rotate(time * 3);

                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const starX = Math.cos(angle) * (baseSize/3);
                    const starY = Math.sin(angle) * (baseSize/3);

                    ctx.fillStyle = '#FFFF00';
                    ctx.globalAlpha = 0.7;
                    drawStar(starX, starY, 5, 3, 1.5);
                }

                ctx.restore();
                ctx.globalAlpha = 1;
                ctx.restore();
                break;
            case 4: // Corazón verde brillante
                ctx.fillStyle = '#00FF66'; // Verde brillante
                ctx.strokeStyle = '#FFFFFF'; // Borde blanco
                ctx.lineWidth = 3;

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(pulseFactor * 1.4, pulseFactor * 1.4); // Escala aumentada
                ctx.rotate(Math.sin(time) * 0.3); // Balanceo suave

                // Dibujar corazón
                ctx.beginPath();
                ctx.moveTo(0, baseSize/4);
                ctx.bezierCurveTo(-baseSize/2, -baseSize/4, -baseSize/2, -baseSize/2, 0, -baseSize/2);
                ctx.bezierCurveTo(baseSize/2, -baseSize/2, baseSize/2, -baseSize/4, 0, baseSize/4);
                ctx.fill();
                ctx.stroke();

                // Añadir brillo interior
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(0, baseSize/8);
                ctx.bezierCurveTo(-baseSize/4, -baseSize/8, -baseSize/4, -baseSize/4, 0, -baseSize/4);
                ctx.bezierCurveTo(baseSize/4, -baseSize/4, baseSize/4, -baseSize/8, 0, baseSize/8);
                ctx.fill();

                // Añadir destellos alrededor
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + time * 2;
                    const distance = baseSize/1.5 + Math.sin(time * 3 + i) * 5;
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.restore();
                break;

            case 5: // Corona dorada
                ctx.fillStyle = '#FFD700'; // Dorado
                ctx.strokeStyle = '#FFFFFF'; // Borde blanco
                ctx.lineWidth = 3;

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(pulseFactor * 1.3, pulseFactor * 1.3);
                ctx.rotate(Math.sin(time * 0.5) * 0.2); // Balanceo lento

                // Dibujar base de la corona
                ctx.beginPath();
                ctx.moveTo(-baseSize/2, baseSize/4);
                ctx.lineTo(baseSize/2, baseSize/4);
                ctx.lineTo(baseSize/2, 0);
                ctx.lineTo(baseSize/3, -baseSize/4);
                ctx.lineTo(baseSize/6, 0);
                ctx.lineTo(0, -baseSize/2);
                ctx.lineTo(-baseSize/6, 0);
                ctx.lineTo(-baseSize/3, -baseSize/4);
                ctx.lineTo(-baseSize/2, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Añadir joyas a la corona
                const jewelColors = ['#FF3366', '#33CCFF', '#66FF66'];
                const jewelPositions = [
                    {x: -baseSize/3, y: -baseSize/8},
                    {x: 0, y: -baseSize/3},
                    {x: baseSize/3, y: -baseSize/8}
                ];

                jewelPositions.forEach((pos, i) => {
                    ctx.fillStyle = jewelColors[i % jewelColors.length];
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, baseSize/8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Brillo en las joyas
                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.arc(pos.x - baseSize/20, pos.y - baseSize/20, baseSize/20, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Añadir destellos alrededor
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + time * 2;
                    const distance = baseSize/1.2 + Math.sin(time * 3 + i) * 5;
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.restore();
                break;

            case 6: // Caramelo multicolor giratorio
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(pulseFactor * 1.3, pulseFactor * 1.3);
                ctx.rotate(time * 1.2); // Rotación rápida

                // Dibujar caramelo con rayas
                const candyColors = ['#FF3366', '#33CCFF', '#FFCC00', '#66FF66'];
                const stripeCount = 4;

                for (let i = 0; i < stripeCount; i++) {
                    const startAngle = (i / stripeCount) * Math.PI * 2;
                    const endAngle = ((i + 1) / stripeCount) * Math.PI * 2;

                    ctx.fillStyle = candyColors[i % candyColors.length];
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, baseSize/2, startAngle, endAngle);
                    ctx.closePath();
                    ctx.fill();
                }

                // Borde blanco
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/2, 0, Math.PI * 2);
                ctx.stroke();

                // Centro brillante
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/6, 0, Math.PI * 2);
                ctx.fill();

                // Añadir destellos alrededor
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + time * 2;
                    const distance = baseSize/1.2 + Math.sin(time * 3 + i) * 5;
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.restore();
                break;

            case 7: // Cristal púrpura brillante
                ctx.fillStyle = '#9933FF'; // Púrpura brillante
                ctx.strokeStyle = '#FFFFFF'; // Borde blanco
                ctx.lineWidth = 3;

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(pulseFactor * 1.4, pulseFactor * 1.4);
                ctx.rotate(time * 0.6 + Math.sin(time) * 0.3); // Rotación con oscilación

                // Dibujar cristal hexagonal
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * baseSize/2;
                    const y = Math.sin(angle) * baseSize/2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Añadir facetas internas
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2;

                for (let i = 0; i < 3; i++) {
                    const angle1 = (i / 3) * Math.PI * 2;
                    const angle2 = ((i + 1.5) / 3) * Math.PI * 2;

                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle1) * baseSize/2, Math.sin(angle1) * baseSize/2);
                    ctx.lineTo(Math.cos(angle2) * baseSize/2, Math.sin(angle2) * baseSize/2);
                    ctx.stroke();
                }

                // Brillo central
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(0, 0, baseSize/6, 0, Math.PI * 2);
                ctx.fill();

                // Añadir destellos alrededor
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + time * 2;
                    const distance = baseSize/1.2 + Math.sin(time * 3 + i) * 5;
                    const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * distance,
                        Math.sin(angle) * distance,
                        sparkleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.restore();
                break;
        }

        // Añadir pequeñas estrellas alrededor (para todos los tipos)
        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.2; // Opacidad pulsante más visible

        // Dibujar 5 pequeñas estrellas orbitando (más estrellas)
        for (let i = 0; i < 5; i++) {
            const angle = time * 2 + (i * Math.PI * 2 / 5);
            const orbitRadius = baseSize * 1.2; // Órbita más grande
            const starX = centerX + Math.cos(angle) * orbitRadius;
            const starY = centerY + Math.sin(angle) * orbitRadius;

            // Estrellas más grandes y brillantes
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(starX, starY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Restaurar configuración
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // Resetear sombra
    } catch (error) {
        console.error("Error en drawFood:", error);

        // Versión de respaldo simple en caso de error
        ctx.fillStyle = '#ff66b3'; // Rosa
        ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    }
}

// Función para crear partículas cuando la serpiente come la comida
function createFoodParticles() {
    // Limpiar partículas anteriores
    foodParticles = [];

    // Crear partículas de colores
    const colors = ['#ffcc00', '#ff66b3', '#66ff66', '#66ccff', '#cc99ff'];

    // Crear partículas circulares
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const size = 3 + Math.random() * 5;

        foodParticles.push({
            x: food.x + GRID_SIZE / 2,
            y: food.y + GRID_SIZE / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 30 + Math.random() * 20,
            type: 'circle'
        });
    }

    // Crear partículas de estrellas
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;
        const size = 8 + Math.random() * 8;

        foodParticles.push({
            x: food.x + GRID_SIZE / 2,
            y: food.y + GRID_SIZE / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: '#ffcc00',
            life: 40 + Math.random() * 20,
            type: 'star'
        });
    }

    // Crear partículas de texto (emojis)
    const emojis = ['✨', '⭐', '💫', '🌟', '💖'];
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;

        foodParticles.push({
            x: food.x + GRID_SIZE / 2,
            y: food.y + GRID_SIZE / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 16,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            life: 50 + Math.random() * 30,
            type: 'emoji',
            rotation: Math.random() * 360,
            rotationSpeed: -2 + Math.random() * 4
        });
    }
}

// Función para dibujar y actualizar partículas
function drawFoodParticles() {
    // Si no hay partículas, salir
    if (foodParticles.length === 0) return;

    // Actualizar y dibujar cada partícula
    for (let i = foodParticles.length - 1; i >= 0; i--) {
        const p = foodParticles[i];

        // Actualizar posición
        p.x += p.vx;
        p.y += p.vy;

        // Reducir vida
        p.life -= 1;

        // Eliminar partículas muertas
        if (p.life <= 0) {
            foodParticles.splice(i, 1);
            continue;
        }

        // Calcular opacidad basada en la vida restante
        const opacity = p.life / 50;

        // Dibujar según el tipo de partícula
        if (p.type === 'circle') {
            // Partícula circular
            ctx.fillStyle = p.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (opacity * 0.8 + 0.2), 0, Math.PI * 2);
            ctx.fill();

            // Añadir brillo
            ctx.globalAlpha = opacity * 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5 * (opacity * 0.8 + 0.2), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        else if (p.type === 'star') {
            // Partícula de estrella
            ctx.fillStyle = p.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            drawStar(p.x, p.y, 5, p.size * (opacity * 0.8 + 0.2), p.size * 0.5 * (opacity * 0.8 + 0.2));
        }
        else if (p.type === 'emoji') {
            // Partícula de emoji
            ctx.save();
            ctx.translate(p.x, p.y);

            // Actualizar y aplicar rotación
            p.rotation += p.rotationSpeed;
            ctx.rotate(p.rotation * Math.PI / 180);

            ctx.font = `${p.size * (opacity * 0.8 + 0.2)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.emoji, 0, 0);
            ctx.restore();
        }
    }
}

// Función para dibujar una estrella
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawGameOver() {
    try {
        // Crear un fondo con degradado pastel
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#ffcce6'); // Rosa pastel claro
        gradient.addColorStop(1, '#ff99cc'); // Rosa pastel más intenso
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Dibujar patrón de fondo con corazones y estrellas
        drawGameOverBackground();

        // Dibujar un marco decorativo con bordes redondeados
        ctx.strokeStyle = '#ff66b3'; // Rosa más intenso
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60, 20);
        ctx.stroke();

        // Añadir un segundo marco interior con otro color
        ctx.strokeStyle = '#cc33ff'; // Morado
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(45, 45, CANVAS_WIDTH - 90, CANVAS_HEIGHT - 90, 15);
        ctx.stroke();

        ctx.textAlign = 'center'; // Asegurar alineación central

        // Título Game Over con efecto de sombra y brillo
        ctx.font = 'bold 60px "Pacifico", cursive';
        // Sombra para el texto
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff1493'; // Rosa intenso
        ctx.fillText('¡Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120);
        ctx.shadowBlur = 0;

        // Nombre personalizado con estilo juvenil
        ctx.font = 'bold 40px "Pacifico", cursive';
        ctx.fillStyle = '#9400d3'; // Morado
        ctx.fillText('Teresa Elizabeth', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        // Puntuación con fondo decorativo
        const scoreText = `Puntuación Final: ${score}`;
        ctx.font = 'bold 32px "Poppins", sans-serif';

        // Medir el texto para crear un fondo
        const scoreWidth = ctx.measureText(scoreText).width;

        // Dibujar un fondo para la puntuación
        const scoreGradient = ctx.createLinearGradient(
            CANVAS_WIDTH / 2 - scoreWidth / 2 - 20,
            CANVAS_HEIGHT / 2 - 20,
            CANVAS_WIDTH / 2 + scoreWidth / 2 + 20,
            CANVAS_HEIGHT / 2 + 20
        );
        scoreGradient.addColorStop(0, '#ff66b3');
        scoreGradient.addColorStop(1, '#ff1493');

        ctx.fillStyle = scoreGradient;
        ctx.beginPath();
        ctx.roundRect(
            CANVAS_WIDTH / 2 - scoreWidth / 2 - 20,
            CANVAS_HEIGHT / 2 - 20,
            scoreWidth + 40,
            40,
            20
        );
        ctx.fill();

        // Texto de puntuación
        ctx.fillStyle = '#ffffff'; // Blanco
        ctx.fillText(scoreText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

        // Información sobre premios ganados en esta partida
        const allRewardsEarned = checkAllRewardsEarned();
        const rewardsInThisGame = allRewardsEarned.filter(r =>
            pendingRewards.some(pr => pr.points === r.points)
        );

        if (rewardsInThisGame.length > 0) {
            // Dibujar un fondo decorativo para la sección de premios
            const rewardsSectionY = CANVAS_HEIGHT / 2 + 40;
            const rewardsSectionHeight = 150;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.roundRect(
                50,
                rewardsSectionY,
                CANVAS_WIDTH - 100,
                rewardsSectionHeight,
                15
            );
            ctx.fill();

            // Borde decorativo para la sección de premios
            ctx.strokeStyle = '#ff66b3';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(
                50,
                rewardsSectionY,
                CANVAS_WIDTH - 100,
                rewardsSectionHeight,
                15
            );
            ctx.stroke();

            // Mostrar mensaje de premios ganados con estilo juvenil
            ctx.font = 'bold 28px "Poppins", sans-serif';
            ctx.fillStyle = '#ff1493'; // Rosa intenso
            ctx.fillText(`¡Has ganado ${rewardsInThisGame.length} premio(s)!`,
                CANVAS_WIDTH / 2, rewardsSectionY + 35);

            // Mostrar el nombre del último premio ganado
            const lastReward = rewardsInThisGame[rewardsInThisGame.length - 1];
            ctx.font = '22px "Poppins", sans-serif';
            ctx.fillStyle = '#9400d3'; // Morado

            // Dividir la descripción en dos líneas si es muy larga
            const maxWidth = CANVAS_WIDTH - 150;
            const description = lastReward.description;

            if (ctx.measureText(description).width > maxWidth) {
                const words = description.split(' ');
                let line1 = '';
                let line2 = '';
                let i = 0;

                // Construir primera línea
                while (i < words.length && ctx.measureText(line1 + ' ' + words[i]).width <= maxWidth) {
                    line1 += (line1 ? ' ' : '') + words[i];
                    i++;
                }

                // Construir segunda línea con el resto
                while (i < words.length) {
                    line2 += (line2 ? ' ' : '') + words[i];
                    i++;
                }

                // Truncar segunda línea si sigue siendo muy larga
                if (ctx.measureText(line2).width > maxWidth) {
                    line2 = line2.substring(0, 50) + '...';
                }

                // Dibujar las dos líneas
                ctx.fillText(line1, CANVAS_WIDTH / 2, rewardsSectionY + 70);
                if (line2) {
                    ctx.fillText(line2, CANVAS_WIDTH / 2, rewardsSectionY + 100);
                }
            } else {
                // Si cabe en una línea
                ctx.fillText(description, CANVAS_WIDTH / 2, rewardsSectionY + 70);
            }

            // Instrucciones para ver todos los premios con estilo juvenil
            ctx.font = '20px "Poppins", sans-serif';
            ctx.fillStyle = '#0066ff'; // Azul
            ctx.fillText('Haz clic en "Ver Premios" para ver todas tus recompensas',
                CANVAS_WIDTH / 2, rewardsSectionY + 130);

            // Dibujar estrellas decorativas alrededor del mensaje
            drawDecorativeStars();

            // Mostrar el botón para ver premios
            if (viewRewardsButton) {
                viewRewardsButton.style.display = 'block';
            }

            // Mostrar solo el premio más cercano obtenido después de un breve retraso
            // Usamos una variable global para controlar si ya se mostró el premio
            if (!window.rewardAlreadyShown) {
                setTimeout(() => {
                    // Obtener el premio más cercano (el de mayor puntuación)
                    if (rewardsInThisGame.length > 0) {
                        // Ordenar los premios por puntos y obtener el de mayor puntuación
                        const highestReward = rewardsInThisGame.reduce((highest, current) =>
                            current.points > highest.points ? current : highest, rewardsInThisGame[0]);

                        // Mostrar solo este premio si el modal no está ya visible
                        if (!document.getElementById('rewardModal').classList.contains('visible')) {
                            // Marcar que ya se mostró el premio para evitar bucles
                            window.rewardAlreadyShown = true;
                            showRewardModal(highestReward);
                        }
                    }
                }, 1500);
            }
        } else {
            // Mensaje si no se ganaron premios en esta partida
            const noRewardY = CANVAS_HEIGHT / 2 + 60;

            // Fondo para el mensaje
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.roundRect(50, noRewardY - 30, CANVAS_WIDTH - 100, 100, 15);
            ctx.fill();

            // Borde decorativo
            ctx.strokeStyle = '#ff66b3';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(50, noRewardY - 30, CANVAS_WIDTH - 100, 100, 15);
            ctx.stroke();

            ctx.font = 'bold 24px "Poppins", sans-serif';
            ctx.fillStyle = '#9400d3'; // Morado
            ctx.fillText('No has desbloqueado ningún premio en esta partida.',
                CANVAS_WIDTH / 2, noRewardY + 10);

            ctx.font = '22px "Poppins", sans-serif';
            ctx.fillStyle = '#ff1493'; // Rosa intenso
            ctx.fillText('¡Sigue intentándolo para ganar premios!',
                CANVAS_WIDTH / 2, noRewardY + 50);
        }

        // Recordatorio de juego diario con estilo juvenil
        const reminderY = CANVAS_HEIGHT - 60;
        ctx.font = 'italic 18px "Poppins", sans-serif';
        ctx.fillStyle = '#9400d3'; // Morado
        ctx.fillText('Recuerda que solo puedes jugar una vez al día',
            CANVAS_WIDTH / 2, reminderY);

        // Mostrar botones de reinicio y ver premios
        if (restartButton) {
            restartButton.style.display = 'block';
        }
        if (viewRewardsButton) {
            viewRewardsButton.style.display = 'block';
        }
    } catch (error) {
        console.error("Error en drawGameOver:", error);

        // Versión de respaldo simple en caso de error
        ctx.fillStyle = '#ffcce6'; // Rosa pastel
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#ff1493'; // Rosa intenso
        ctx.font = 'bold 30px "Pacifico", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('¡Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
        ctx.fillText(`Puntuación: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText('Gracias por jugar, Teresa Elizabeth', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
}

// Función para dibujar el fondo decorativo de Game Over
function drawGameOverBackground() {
    // Crear un fondo con degradado pastel similar al de Game Over
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#ffcce6'); // Rosa pastel claro
    gradient.addColorStop(1, '#ff99cc'); // Rosa pastel más intenso
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dibujar corazones decorativos
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const size = 5 + Math.random() * 10;
        ctx.fillStyle = `rgba(255, 102, 179, ${Math.random() * 0.2 + 0.1})`;
        drawHeart(x, y, size);
    }

    // Dibujar estrellas decorativas
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const size = 5 + Math.random() * 8;
        ctx.fillStyle = `rgba(255, 255, 102, ${Math.random() * 0.3 + 0.1})`;
        drawStar(x, y, 5, size, size/2);
    }

    // Dibujar círculos decorativos
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const radius = 2 + Math.random() * 5;
        ctx.fillStyle = `rgba(204, 51, 255, ${Math.random() * 0.2 + 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dibujar animaciones de perritos y gatitos alrededor del área de juego
    drawPetsAnimations();
}

// Función para dibujar estrellas decorativas alrededor del mensaje de premio
function drawDecorativeStars() {
    const centerY = CANVAS_HEIGHT / 2 + 85;

    // Dibujar estrellas a los lados del mensaje
    for (let i = 0; i < 5; i++) {
        // Estrella izquierda
        ctx.fillStyle = '#ffcc00'; // Amarillo dorado
        drawStar(
            100 + i * 20,
            centerY - 10 + i * 5,
            5,
            10,
            5
        );

        // Estrella derecha
        drawStar(
            CANVAS_WIDTH - 100 - i * 20,
            centerY - 10 + i * 5,
            5,
            10,
            5
        );
    }
}

// Función para verificar todos los premios ganados en la partida actual
function checkAllRewardsEarned() {
    const earnedRewards = [];

    // Verificar cada premio
    for (const reward of REWARDS_DATABASE) {
        if (score >= reward.points) {
            earnedRewards.push(reward);
        }
    }

    return earnedRewards;
}


// --- Lógica del Juego ---
function moveSnake() {
    try {
        // Crear la nueva cabeza en la dirección del movimiento
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head); // Añadir la nueva cabeza al inicio del array

        // Añadir el último segmento al rastro (la cola que se va a eliminar si no come)
        if (snake.length > 1) {
            const lastSegment = snake[snake.length - 1];
            snakeTrail.push({
                x: lastSegment.x,
                y: lastSegment.y,
                life: trailLifespan
            });
        }

        // Comprobar si el snake ha comido la comida
        const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
        if (hasEatenFood) {
            // Crear efecto de partículas
            createFoodParticles();

            // Incrementar puntuación con animación
            score += POINTS_PER_FOOD;

            // Actualizar y animar el marcador de puntuación principal
            if (scoreDisplay) {
                scoreDisplay.textContent = score;
                scoreDisplay.classList.add('score-increase');
                setTimeout(() => {
                    scoreDisplay.classList.remove('score-increase');
                }, 500);
            }

            // También animar el marcador de progreso actual si existe
            const currentScoreDisplay = document.getElementById('currentScoreDisplay');
            if (currentScoreDisplay) {
                currentScoreDisplay.textContent = score;
                currentScoreDisplay.classList.add('score-increase');
                setTimeout(() => {
                    currentScoreDisplay.classList.remove('score-increase');
                }, 500);
            }

            // Verificar si se ha alcanzado un premio
            checkForReward(score);

            // Actualizar el próximo premio
            updateNextRewardDisplay();

            // Generar nueva comida
            generateFood();

            // Ajustar velocidad según la puntuación
            adjustGameSpeed();
        } else {
            // Si no comió, quitar el último segmento (la cola)
            snake.pop();
        }
    } catch (error) {
        console.error("Error en moveSnake:", error);
        // Asegurar que la serpiente siempre tenga al menos 3 segmentos
        if (snake.length < 3) {
            snake = [
                { x: Math.floor(COLS / 2) * GRID_SIZE, y: Math.floor(ROWS / 2) * GRID_SIZE },
                { x: (Math.floor(COLS / 2) - 1) * GRID_SIZE, y: Math.floor(ROWS / 2) * GRID_SIZE },
                { x: (Math.floor(COLS / 2) - 2) * GRID_SIZE, y: Math.floor(ROWS / 2) * GRID_SIZE }
            ];
            dx = GRID_SIZE;
            dy = 0;
        }
    }
}

// Ajusta la velocidad del juego según la puntuación
function adjustGameSpeed() {
    // Calcular la velocidad basada en la puntuación
    // Más puntos = más rápido (menor tiempo entre actualizaciones)
    const baseSpeed = 150; // Velocidad inicial
    const minSpeed = 50;   // Velocidad máxima (tiempo mínimo entre actualizaciones)

    // Reducir 1ms por cada 100 puntos, hasta un mínimo de minSpeed
    const speedReduction = Math.floor(score / 100);
    const newSpeed = Math.max(baseSpeed - speedReduction, minSpeed);

    // Solo actualizar si la velocidad ha cambiado
    if (newSpeed !== GAME_SPEED) {
        GAME_SPEED = newSpeed;
    }
}

function changeDirection(event) {
    // Si el juego no está activo o ya se cambió la dirección en este ciclo, ignorar
    if (changingDirection || isGameOver) return;

    const keyPressed = event.key;
    const goingUp = dy === -GRID_SIZE;
    const goingDown = dy === GRID_SIZE;
    const goingRight = dx === GRID_SIZE;
    const goingLeft = dx === -GRID_SIZE;

    let directionChanged = false;
    // Cambiar dirección basado en la tecla presionada, evitando la reversa inmediata
    if (keyPressed === 'ArrowLeft' && !goingRight) {
        dx = -GRID_SIZE;
        dy = 0;
        directionChanged = true;
    } else if (keyPressed === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -GRID_SIZE;
        directionChanged = true;
    } else if (keyPressed === 'ArrowRight' && !goingLeft) {
        dx = GRID_SIZE;
        dy = 0;
        directionChanged = true;
    } else if (keyPressed === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = GRID_SIZE;
        directionChanged = true;
    }

    if (directionChanged) {
        changingDirection = true; // Marcar que la dirección cambió en esta actualización
    }
}

function generateFood() {
    let newFoodX, newFoodY, foodOnSnake;
    // Usar do...while para asegurar que la comida no aparezca sobre el snake
    do {
        foodOnSnake = false;
        newFoodX = Math.floor(Math.random() * COLS) * GRID_SIZE;
        newFoodY = Math.floor(Math.random() * ROWS) * GRID_SIZE;

        // Comprobar si las coordenadas generadas coinciden con algún segmento del snake
        for (const segment of snake) {
            if (segment.x === newFoodX && segment.y === newFoodY) {
                foodOnSnake = true;
                break; // Salir del bucle for si se encuentra coincidencia
            }
        }
    } while (foodOnSnake); // Repetir si la comida apareció sobre el snake

    food.x = newFoodX;
    food.y = newFoodY;
}


function checkCollision() {
    const head = snake[0];

    // Colisión con los bordes del canvas
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= CANVAS_WIDTH;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= CANVAS_HEIGHT;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        handleGameOver();
        return true; // Indica que hubo colisión
    }

    // Colisión consigo mismo (empezar a comprobar desde el cuarto segmento, la cabeza no puede chocar con los 2 primeros)
    for (let i = 3; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            handleGameOver();
            return true; // Indica que hubo colisión
        }
    }

    return false; // No hubo colisión
}

// Función para manejar el fin del juego
function handleGameOver() {
    if (!isGameOver) {
        isGameOver = true;

        try {
            // Mostrar botones de reinicio y ver premios
            if (restartButton) {
                restartButton.style.display = 'block';
            }
            if (viewRewardsButton) {
                viewRewardsButton.style.display = 'block';
            }

            // Guardar datos del juego si existe la función
            if (typeof saveGameData === 'function') {
                saveGameData();
            }

            // Verificar los premios ganados
            const rewardsEarned = checkAllRewardsEarned();
            console.log(`Juego terminado. Puntuación: ${score}. Premios ganados: ${rewardsEarned.length}`);

            // Forzar redibujado de la pantalla de Game Over
            drawGameOver();
        } catch (error) {
            console.error("Error en handleGameOver:", error);
        }
    }
}

// --- Event Listeners ---
// Prevenir el scroll de la ventana con las teclas de flecha en todo momento
document.addEventListener('keydown', function(event) {
    // Prevenir el comportamiento predeterminado de las teclas de flecha
    // para evitar que la ventana del navegador haga scroll en cualquier momento
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
    }
});

// Manejar cambios de dirección durante el juego
document.addEventListener('keydown', changeDirection);

// Selector de temas
const themeOptions = document.querySelectorAll('.theme-option');
themeOptions.forEach(option => {
    // Marcar el tema rosa como activo por defecto
    if (option.getAttribute('data-theme') === 'rosa') {
        option.classList.add('active');
    }

    option.addEventListener('click', function() {
        // Obtener el tema seleccionado
        const themeName = this.getAttribute('data-theme');

        // Actualizar el tema actual
        currentSnakeTheme = SNAKE_THEMES[themeName];

        // Actualizar clases de los botones
        themeOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');

        // Guardar preferencia en localStorage
        try {
            localStorage.setItem('snakeTheme', themeName);
        } catch (e) {
            console.error('Error al guardar el tema:', e);
        }
    });
});

// Botón de inicio
startButton.addEventListener('click', function() {
    // Ocultar el botón de inicio
    startButton.style.display = 'none';
    // Iniciar el juego
    initializeGame();

    // Iniciar el bucle de animación si no está ya en ejecución
    if (!animationFrameId) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(animationLoop);
    }
});

// Botón de reinicio
restartButton.addEventListener('click', function() {
    // Ocultar el botón de reinicio
    restartButton.style.display = 'none';
    // Iniciar el juego
    initializeGame();

    // Iniciar el bucle de animación si no está ya en ejecución
    if (!animationFrameId) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(animationLoop);
    }
});

// Botón para ver premios con animación
viewRewardsButton.addEventListener('click', function() {
    // Generar la lista de premios
    generateRewardsList();
    // Mostrar el modal con animación
    rewardsListModal.classList.remove('hidden');
    rewardsListModal.querySelector('.modal-content').classList.add('scale-in');

    // Animar cada elemento de la lista con un retraso progresivo
    const rewardItems = document.querySelectorAll('.reward-item');
    rewardItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        // Aplicar un retraso progresivo para crear un efecto cascada
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + index * 50);
    });
});

// El botón para reiniciar el límite diario ha sido eliminado
// Esta funcionalidad ahora solo está disponible a través del archivo .bat

// Función para reiniciar el límite diario
function resetDailyLimit() {
    try {
        // Obtener los datos guardados
        const savedData = localStorage.getItem('snakeGameData');

        if (savedData) {
            // Parsear los datos
            const gameData = JSON.parse(savedData);

            // Mantener los premios desbloqueados
            const unlockedRewards = gameData.unlockedRewards || [];

            // Crear nuevos datos con el límite reiniciado
            const newGameData = {
                hasPlayedToday: false,
                gameDate: new Date().toLocaleDateString(),
                dailyAttemptsUsed: 0, // Reiniciar el contador de intentos
                unlockedRewards: unlockedRewards
            };

            // Guardar los nuevos datos
            localStorage.setItem('snakeGameData', JSON.stringify(newGameData));

            // Actualizar variables en memoria
            hasPlayedToday = false;
            gameDate = new Date().toLocaleDateString();
            dailyAttemptsUsed = 0; // Reiniciar el contador de intentos en memoria

            // Mostrar mensaje de éxito
            alert('¡Límite diario reiniciado con éxito! Ahora puedes jugar nuevamente.');
        } else {
            alert('No hay datos de juego para reiniciar. Puedes jugar normalmente.');
        }
    } catch (e) {
        console.error('Error al reiniciar el límite diario:', e);
        alert('Error al reiniciar el límite diario. Por favor, intenta de nuevo.');
    }
}

// Botones para cerrar modales con animación
closeRewardButton.addEventListener('click', function() {
    const modalContent = rewardModal.querySelector('.modal-content');
    modalContent.classList.remove('scale-in');
    modalContent.classList.add('scale-out');

    // Esperar a que termine la animación antes de ocultar el modal
    setTimeout(() => {
        rewardModal.classList.add('hidden');
        rewardModal.classList.remove('visible');
        modalContent.classList.remove('scale-out');
    }, 500);
});

closeRewardsListButton.addEventListener('click', function() {
    const modalContent = rewardsListModal.querySelector('.modal-content');
    modalContent.classList.remove('scale-in');
    modalContent.classList.add('scale-out');

    // Esperar a que termine la animación antes de ocultar el modal
    setTimeout(() => {
        rewardsListModal.classList.add('hidden');
        modalContent.classList.remove('scale-out');
    }, 500);
});

// Botones de cierre (X) en los modales con animación
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Encontrar el modal padre
        const modal = this.closest('.modal');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('scale-in');
            modalContent.classList.add('scale-out');

            // Esperar a que termine la animación antes de ocultar el modal
            setTimeout(() => {
                modal.classList.add('hidden');
                modalContent.classList.remove('scale-out');
            }, 500);
        }
    });
});

// --- Mostrar pantalla de inicio al cargar la página ---
function showWelcomeScreen() {
    // Limpiar el canvas y dibujar fondo
    clearCanvas();

    // Dibujar un fondo con degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#ffcce6'); // Rosa pastel claro
    gradient.addColorStop(1, '#ff99cc'); // Rosa pastel más intenso
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dibujar animaciones de perritos y gatitos alrededor del área de juego
    drawPetsAnimations();

    // Dibujar burbujas decorativas (menos opacas y evitando el área de instrucciones)
    for (let i = 0; i < 20; i++) {
        // Generar posición aleatoria
        let x = Math.random() * CANVAS_WIDTH;
        let y = Math.random() * CANVAS_HEIGHT;

        // Evitar el área central donde estarán las instrucciones
        const instructionsArea = {
            minX: CANVAS_WIDTH / 2 - 320,
            maxX: CANVAS_WIDTH / 2 + 320,
            minY: CANVAS_HEIGHT / 2 + 40,
            maxY: CANVAS_HEIGHT / 2 + 210
        };

        // Si la burbuja está en el área de instrucciones, moverla a otra parte
        if (x > instructionsArea.minX && x < instructionsArea.maxX &&
            y > instructionsArea.minY && y < instructionsArea.maxY) {
            // Mover a la parte superior o inferior
            y = Math.random() < 0.5 ? Math.random() * instructionsArea.minY :
                                      instructionsArea.maxY + Math.random() * (CANVAS_HEIGHT - instructionsArea.maxY);
        }

        const radius = 5 + Math.random() * 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
        ctx.fill();
    }

    // Dibujar corazones decorativos (menos opacas y evitando el área de instrucciones)
    for (let i = 0; i < 10; i++) {
        // Generar posición aleatoria
        let x = Math.random() * CANVAS_WIDTH;
        let y = Math.random() * CANVAS_HEIGHT;

        // Evitar el área central donde estarán las instrucciones
        const instructionsArea = {
            minX: CANVAS_WIDTH / 2 - 320,
            maxX: CANVAS_WIDTH / 2 + 320,
            minY: CANVAS_HEIGHT / 2 + 40,
            maxY: CANVAS_HEIGHT / 2 + 210
        };

        // Si el corazón está en el área de instrucciones, moverlo a otra parte
        if (x > instructionsArea.minX && x < instructionsArea.maxX &&
            y > instructionsArea.minY && y < instructionsArea.maxY) {
            // Mover a la parte superior o inferior
            y = Math.random() < 0.5 ? Math.random() * instructionsArea.minY :
                                      instructionsArea.maxY + Math.random() * (CANVAS_HEIGHT - instructionsArea.maxY);
        }

        const size = 5 + Math.random() * 12;
        ctx.fillStyle = `rgba(255, 102, 179, ${Math.random() * 0.15 + 0.05})`;
        drawHeart(x, y, size);
    }

    // Dibujar mensaje de bienvenida
    ctx.textAlign = 'center';

    // Título "SNAKE" con efecto de brillo mejorado
    ctx.font = 'bold 80px "Pacifico", cursive';
    const titleGradient = ctx.createLinearGradient(
        CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 - 100,
        CANVAS_WIDTH / 2 + 150, CANVAS_HEIGHT / 2 - 100
    );
    titleGradient.addColorStop(0, '#ff66b3');
    titleGradient.addColorStop(0.5, '#ff1493');
    titleGradient.addColorStop(1, '#ff66b3');

    // Primero dibujamos un contorno para mejorar la legibilidad
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.strokeText('SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);

    // Luego dibujamos el texto con el gradiente
    ctx.fillStyle = titleGradient;
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 20; // Aumentamos el brillo
    ctx.fillText('SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    ctx.shadowBlur = 0;

    // Nombre personalizado con mejor legibilidad
    ctx.font = 'bold 40px "Poppins", sans-serif';

    // Primero dibujamos un contorno para mejorar la legibilidad
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.strokeText('para Teresa Elizabeth', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    // Luego dibujamos el texto con color
    ctx.fillStyle = '#9933ff'; // Púrpura
    ctx.shadowColor = '#9933ff';
    ctx.shadowBlur = 12;
    ctx.fillText('para Teresa Elizabeth', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.shadowBlur = 0;

    // Dibujar un marco decorativo alrededor del título
    ctx.strokeStyle = '#ff66b3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Ampliamos el ancho y alto del marco para que cubra bien la palabra SNAKE
    // Movemos el marco más arriba y lo hacemos más alto
    ctx.roundRect(CANVAS_WIDTH / 2 - 280, CANVAS_HEIGHT / 2 - 180, 560, 170, 20);
    ctx.stroke();

    // Dibujar estrellas decorativas alrededor del título
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 270;
        const x = CANVAS_WIDTH / 2 + Math.cos(angle) * distance;
        const y = CANVAS_HEIGHT / 2 - 85 + Math.sin(angle) * 50;
        drawStar(x, y, 5, 10, 5);
    }

    // Subtítulo con mejor legibilidad
    ctx.font = 'bold 30px "Poppins", sans-serif';

    // Primero dibujamos un contorno para mejorar la legibilidad
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeText('¡Juega y gana premios increíbles!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

    // Luego dibujamos el texto con color
    ctx.fillStyle = '#ff1493'; // Rosa intenso
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 10;
    ctx.fillText('¡Juega y gana premios increíbles!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.shadowBlur = 0;

    // Instrucciones en un cuadro bonito
    const instructionsX = CANVAS_WIDTH / 2 - 300;
    const instructionsY = CANVAS_HEIGHT / 2 + 60;
    const instructionsWidth = 600;
    const instructionsHeight = 190; // Altura aumentada para acomodar el texto dividido en dos líneas

    // Fondo para instrucciones con mayor opacidad y borde
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; // Mayor opacidad para mejor contraste
    ctx.beginPath();
    ctx.roundRect(instructionsX, instructionsY, instructionsWidth, instructionsHeight, 15);
    ctx.fill();

    // Añadir borde al cuadro de instrucciones
    ctx.strokeStyle = '#ff66b3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Borde para instrucciones más visible
    ctx.strokeStyle = '#ff1493'; // Rosa más intenso para el borde
    ctx.lineWidth = 3; // Borde más grueso
    ctx.stroke();

    // Instrucciones con mejor legibilidad
    ctx.font = 'bold 22px "Poppins", sans-serif'; // Texto más grande y en negrita
    ctx.fillStyle = '#000000'; // Negro puro para máximo contraste
    ctx.textAlign = 'left';

    // Añadir un resplandor blanco más pronunciado alrededor del texto
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Dibujar las instrucciones con mejor espaciado
    ctx.fillText('• Usa las flechas del teclado para moverte', instructionsX + 30, instructionsY + 35);
    ctx.fillText('• Come la comida para crecer y ganar puntos', instructionsX + 30, instructionsY + 75);
    // Dividimos la tercera instrucción en dos líneas para que entre bien en el recuadro
    ctx.fillText('• ¡Desbloquea premios al alcanzar', instructionsX + 30, instructionsY + 115);
    ctx.fillText('   puntuaciones específicas!', instructionsX + 30, instructionsY + 145);

    // Resetear sombra
    ctx.shadowBlur = 0;

    // Volver a centrar el texto
    ctx.textAlign = 'center';

    // Mensaje de intentos diarios con mejor visibilidad
    ctx.font = 'bold 18px "Poppins", sans-serif';
    ctx.fillStyle = '#9933ff';
    // Añadir un resplandor blanco para mejor legibilidad
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 3;

    // Calcular intentos restantes
    const remainingAttempts = MAX_DAILY_ATTEMPTS - dailyAttemptsUsed;
    const attemptsText = remainingAttempts > 0
        ? `Te quedan ${remainingAttempts} ${remainingAttempts === 1 ? 'intento' : 'intentos'} hoy`
        : 'Has agotado tus intentos de hoy';

    ctx.fillText(`Recuerda que solo tienes ${MAX_DAILY_ATTEMPTS} intentos al día. ${attemptsText}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
    ctx.shadowBlur = 0; // Resetear sombra

    // Dibujar una serpiente decorativa en la pantalla de inicio
    drawWelcomeSnake();
}

// Dibujar una serpiente decorativa en la pantalla de inicio
function drawWelcomeSnake() {
    // Crear un camino horizontal para la serpiente en la parte inferior
    const pathPoints = [];

    // Posicionamos la serpiente en la esquina inferior derecha, lejos del texto
    const startX = CANVAS_WIDTH - 50;
    const startY = CANVAS_HEIGHT - 80;

    // Creamos un camino ondulado vertical
    for (let i = 0; i < 10; i++) {
        const x = startX + Math.sin(i * 0.5) * 15;
        const y = startY - i * 15;
        pathPoints.push({x, y});
    }

    // Dibujar cada segmento con degradado de color
    pathPoints.forEach((point, index) => {
        // Calcular color con degradado
        const hue = 320 + (index / pathPoints.length) * 40; // Degradado de rosa a púrpura
        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
        ctx.shadowBlur = 10;

        // Dibujar círculo para cada segmento (tamaño reducido)
        ctx.beginPath();
        ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
        ctx.fill();
    });

    // Dibujar cabeza (corazón)
    const head = pathPoints[pathPoints.length - 1]; // Ahora la cabeza está al final del array (arriba)
    ctx.fillStyle = '#ff1493';
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 15;
    drawHeart(head.x, head.y - 15, 15);

    // Dibujar comida (estrella)
    ctx.fillStyle = '#9933ff';
    ctx.shadowColor = '#9933ff';
    ctx.shadowBlur = 15;
    drawStar(head.x + 30, head.y - 20, 5, 15, 7);

    ctx.shadowBlur = 0; // Resetear sombra
}

// Cargar datos guardados y mostrar la pantalla de bienvenida al cargar la página
window.onload = function() {
    // Intentar cargar datos guardados (si existen)
    loadGameData();

    // Crear decoraciones laterales en la página
    createSideDecorations();

    // Mostrar la pantalla de bienvenida
    showWelcomeScreen();
};

// Guardar datos del juego
function saveGameData() {
    const gameData = {
        hasPlayedToday: hasPlayedToday,
        gameDate: gameDate,
        dailyAttemptsUsed: dailyAttemptsUsed,
        unlockedRewards: unlockedRewards
    };

    try {
        localStorage.setItem('snakeGameData', JSON.stringify(gameData));
    } catch (e) {
        console.error('Error al guardar datos del juego:', e);
    }
}

// Cargar datos del juego
function loadGameData() {
    try {
        // Cargar datos del juego
        const savedData = localStorage.getItem('snakeGameData');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            const today = new Date().toLocaleDateString();

            // Verificar si es un nuevo día
            if (gameData.gameDate === today) {
                // Si es el mismo día, cargar el contador de intentos
                dailyAttemptsUsed = gameData.dailyAttemptsUsed || 0;
                hasPlayedToday = gameData.hasPlayedToday || false;
                gameDate = gameData.gameDate;
            } else {
                // Si es un nuevo día, reiniciar el contador de intentos
                dailyAttemptsUsed = 0;
                hasPlayedToday = false;
                gameDate = today;
            }

            // Cargar premios desbloqueados (estos persisten entre días)
            if (gameData.unlockedRewards) {
                unlockedRewards = gameData.unlockedRewards;
            }
        }

        // Cargar tema guardado
        const savedTheme = localStorage.getItem('snakeTheme');
        if (savedTheme && SNAKE_THEMES[savedTheme]) {
            currentSnakeTheme = SNAKE_THEMES[savedTheme];

            // Actualizar la UI para mostrar el tema activo
            setTimeout(() => {
                const themeOptions = document.querySelectorAll('.theme-option');
                themeOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.getAttribute('data-theme') === savedTheme) {
                        option.classList.add('active');
                    }
                });
            }, 100); // Pequeño retraso para asegurar que los elementos DOM estén cargados
        }
    } catch (e) {
        console.error('Error al cargar datos del juego:', e);
    }
}

// --- Funciones para Decoraciones Laterales ---

// Función para crear todas las decoraciones laterales
function createSideDecorations() {
    const leftDecoration = document.getElementById('leftDecoration');
    const rightDecoration = document.getElementById('rightDecoration');

    // Limpiar contenedores
    leftDecoration.innerHTML = '';
    rightDecoration.innerHTML = '';

    // Crear mariposas
    createButterflies(leftDecoration, rightDecoration);

    // Crear flores
    createFlowers(leftDecoration, rightDecoration);

    // Crear estrellas
    createStars(leftDecoration, rightDecoration);

    // Crear arcoíris
    createRainbows(leftDecoration, rightDecoration);

    // Crear nubes
    createClouds(leftDecoration, rightDecoration);

    // Crear destellos
    createSparkles(leftDecoration, rightDecoration);

    // Crear texto decorativo
    createDecorativeText(leftDecoration, rightDecoration);

    // Crear corazones
    createHearts(leftDecoration, rightDecoration);
}

// Función para crear mariposas
function createButterflies(leftContainer, rightContainer) {
    // Colores para las mariposas
    const butterflyColors = [
        '#ff99cc', // Rosa claro
        '#ffccff', // Lavanda claro
        '#cc99ff', // Púrpura claro
        '#99ccff', // Azul claro
        '#ffcccc'  // Coral claro
    ];

    // Crear 6-8 mariposas (3-4 en cada lado)
    const butterflyCount = 8;

    for (let i = 0; i < butterflyCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de mariposa
        const butterfly = document.createElement('div');
        butterfly.className = 'butterfly';

        // Posición aleatoria dentro del contenedor
        const top = 10 + Math.random() * 80; // % desde arriba
        butterfly.style.top = `${top}vh`;
        butterfly.style.left = i % 2 === 0 ? `${Math.random() * 70}px` : `${Math.random() * 70}px`;

        // Color aleatorio
        const color = butterflyColors[Math.floor(Math.random() * butterflyColors.length)];

        // Duración aleatoria para la animación
        const duration = 10 + Math.random() * 15; // Entre 10 y 25 segundos
        butterfly.style.animation = `butterfly-float ${duration}s infinite ease-in-out`;

        // Crear cuerpo
        const body = document.createElement('div');
        body.className = 'butterfly-body';
        butterfly.appendChild(body);

        // Crear alas
        const leftWing = document.createElement('div');
        leftWing.className = 'butterfly-wing left';
        leftWing.style.backgroundColor = color;
        butterfly.appendChild(leftWing);

        const rightWing = document.createElement('div');
        rightWing.className = 'butterfly-wing right';
        rightWing.style.backgroundColor = color;
        butterfly.appendChild(rightWing);

        // Crear antenas
        const leftAntenna = document.createElement('div');
        leftAntenna.className = 'butterfly-antenna left';
        butterfly.appendChild(leftAntenna);

        const rightAntenna = document.createElement('div');
        rightAntenna.className = 'butterfly-antenna right';
        butterfly.appendChild(rightAntenna);

        // Añadir al contenedor
        container.appendChild(butterfly);
    }
}

// Función para crear flores
function createFlowers(leftContainer, rightContainer) {
    // Colores para los pétalos
    const petalColors = [
        '#ff66b3', // Rosa
        '#ff99cc', // Rosa claro
        '#cc99ff', // Púrpura claro
        '#ff6666', // Rojo claro
        '#ffcc99'  // Melocotón
    ];

    // Colores para los centros
    const centerColors = [
        '#ffcc00', // Amarillo
        '#ffff66', // Amarillo claro
        '#ff9933'  // Naranja
    ];

    // Crear 6-8 flores (3-4 en cada lado)
    const flowerCount = 8;

    for (let i = 0; i < flowerCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de flor
        const flower = document.createElement('div');
        flower.className = 'flower';

        // Posición aleatoria dentro del contenedor (principalmente en la parte inferior)
        const top = 50 + Math.random() * 45; // % desde arriba (50-95%)
        flower.style.top = `${top}vh`;
        flower.style.left = i % 2 === 0 ? `${20 + Math.random() * 80}px` : `${Math.random() * 80}px`;

        // Duración aleatoria para la animación
        const duration = 5 + Math.random() * 5; // Entre 5 y 10 segundos
        flower.style.animation = `flower-sway ${duration}s infinite ease-in-out`;

        // Tamaño aleatorio
        const size = 30 + Math.random() * 20; // Entre 30 y 50px
        flower.style.width = `${size}px`;
        flower.style.height = `${size}px`;

        // Crear tallo
        const stem = document.createElement('div');
        stem.className = 'flower-stem';
        stem.style.height = `${size * 2}px`;
        flower.appendChild(stem);

        // Crear hojas (1-2 hojas)
        const leafCount = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < leafCount; j++) {
            const leaf = document.createElement('div');
            leaf.className = 'flower-leaf';
            leaf.style.bottom = `${20 + j * 30}px`;
            leaf.style.left = j % 2 === 0 ? '-15px' : '15px';
            leaf.style.transform = j % 2 === 0 ? 'rotate(-30deg)' : 'rotate(30deg)';
            flower.appendChild(leaf);
        }

        // Crear centro
        const center = document.createElement('div');
        center.className = 'flower-center';
        center.style.backgroundColor = centerColors[Math.floor(Math.random() * centerColors.length)];
        center.style.width = `${size * 0.3}px`;
        center.style.height = `${size * 0.3}px`;
        center.style.top = '0';
        center.style.left = `${size * 0.35}px`;
        flower.appendChild(center);

        // Crear pétalos (5-8 pétalos)
        const petalCount = 5 + Math.floor(Math.random() * 4);
        const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];

        for (let j = 0; j < petalCount; j++) {
            const petal = document.createElement('div');
            petal.className = 'flower-petal';
            petal.style.backgroundColor = petalColor;

            // Posicionar pétalos en círculo
            const angle = (j / petalCount) * Math.PI * 2;
            const petalDistance = size * 0.25;
            const petalX = Math.cos(angle) * petalDistance;
            const petalY = Math.sin(angle) * petalDistance;

            petal.style.width = `${size * 0.4}px`;
            petal.style.height = `${size * 0.5}px`;
            petal.style.top = `${petalY}px`;
            petal.style.left = `${petalX + size * 0.3}px`;
            petal.style.transform = `rotate(${angle + Math.PI/2}rad)`;

            flower.appendChild(petal);
        }

        // Añadir al contenedor
        container.appendChild(flower);
    }
}

// Función para crear estrellas
function createStars(leftContainer, rightContainer) {
    // Colores para las estrellas
    const starColors = [
        '#ffcc00', // Amarillo dorado
        '#ffff66', // Amarillo claro
        '#ffffff', // Blanco
        '#ffccff', // Rosa muy claro
        '#99ccff'  // Azul claro
    ];

    // Crear 15-20 estrellas
    const starCount = 15 + Math.floor(Math.random() * 6);

    for (let i = 0; i < starCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de estrella
        const star = document.createElement('div');
        star.className = 'star';

        // Posición aleatoria dentro del contenedor
        star.style.top = `${Math.random() * 90}vh`;
        star.style.left = `${Math.random() * 120}px`;

        // Tamaño aleatorio
        const size = 10 + Math.random() * 15; // Entre 10 y 25px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Color aleatorio
        const color = starColors[Math.floor(Math.random() * starColors.length)];

        // Duración aleatoria para la animación
        const duration = 1 + Math.random() * 3; // Entre 1 y 4 segundos
        star.style.animation = `star-twinkle ${duration}s infinite ease-in-out`;

        // Crear la estrella con SVG
        star.innerHTML = `<svg viewBox="0 0 51 48" width="${size}" height="${size}">
            <path fill="${color}" d="M25.5 0l6.18 19.1H51l-15.91 11.6 6.18 19.1L25.5 38.2 9.73 49.8l6.18-19.1L0 19.1h19.32L25.5 0z"/>
        </svg>`;

        // Añadir al contenedor
        container.appendChild(star);
    }
}

// Función para crear arcoíris
function createRainbows(leftContainer, rightContainer) {
    // Crear 2-3 arcoíris
    const rainbowCount = 2 + Math.floor(Math.random() * 2);

    // Colores para los arcoíris
    const rainbowColors = [
        '#ff3366', // Rojo
        '#ff9933', // Naranja
        '#ffcc33', // Amarillo
        '#33cc33', // Verde
        '#3399ff', // Azul
        '#9966ff'  // Púrpura
    ];

    for (let i = 0; i < rainbowCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de arcoíris
        const rainbow = document.createElement('div');
        rainbow.className = 'rainbow';

        // Posición aleatoria dentro del contenedor (principalmente en la parte superior)
        rainbow.style.top = `${10 + Math.random() * 30}vh`;
        rainbow.style.left = i % 2 === 0 ? `${Math.random() * 50}px` : `${Math.random() * 50}px`;

        // Tamaño aleatorio
        const size = 60 + Math.random() * 40; // Entre 60 y 100px
        rainbow.style.width = `${size}px`;
        rainbow.style.height = `${size / 2}px`;

        // Duración aleatoria para la animación
        const duration = 3 + Math.random() * 3; // Entre 3 y 6 segundos
        rainbow.style.animation = `rainbow-pulse ${duration}s infinite ease-in-out`;

        // Crear arcos para cada color
        const arcWidth = 4; // Ancho de cada arco

        for (let j = 0; j < rainbowColors.length; j++) {
            const arc = document.createElement('div');
            arc.className = 'rainbow-arc';

            // Tamaño decreciente para cada arco
            const arcSize = size - (j * arcWidth * 2);

            arc.style.width = `${arcSize}px`;
            arc.style.height = `${arcSize}px`;
            arc.style.top = `0`;
            arc.style.left = `${(size - arcSize) / 2}px`;

            // Establecer color y borde
            arc.style.borderWidth = `${arcWidth}px`;
            arc.style.borderTopColor = rainbowColors[j];

            rainbow.appendChild(arc);
        }

        // Añadir al contenedor
        container.appendChild(rainbow);
    }
}

// Función para crear nubes
function createClouds(leftContainer, rightContainer) {
    // Crear 3-5 nubes
    const cloudCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < cloudCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de nube
        const cloud = document.createElement('div');
        cloud.className = 'cloud';

        // Posición aleatoria dentro del contenedor (principalmente en la parte superior)
        cloud.style.top = `${5 + Math.random() * 40}vh`;
        cloud.style.left = i % 2 === 0 ? `${Math.random() * 70}px` : `${Math.random() * 70}px`;

        // Tamaño aleatorio
        const size = 40 + Math.random() * 30; // Entre 40 y 70px
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;

        // Duración aleatoria para la animación
        const duration = 20 + Math.random() * 20; // Entre 20 y 40 segundos
        const direction = i % 2 === 0 ? 'normal' : 'reverse';
        cloud.style.animation = `cloud-float ${duration}s infinite ${direction} ease-in-out`;

        // Crear partes de la nube (3-5 círculos)
        const partCount = 3 + Math.floor(Math.random() * 3);

        // Parte central (más grande)
        const mainPart = document.createElement('div');
        mainPart.className = 'cloud-part';
        mainPart.style.width = `${size * 0.6}px`;
        mainPart.style.height = `${size * 0.6}px`;
        mainPart.style.top = `${size * 0.2}px`;
        mainPart.style.left = `${size * 0.3}px`;
        cloud.appendChild(mainPart);

        // Partes adicionales
        for (let j = 0; j < partCount; j++) {
            const part = document.createElement('div');
            part.className = 'cloud-part';

            // Tamaño aleatorio para cada parte
            const partSize = size * (0.3 + Math.random() * 0.3);
            part.style.width = `${partSize}px`;
            part.style.height = `${partSize}px`;

            // Posición aleatoria alrededor de la parte central
            const angle = (j / partCount) * Math.PI * 2;
            const distance = size * 0.2;
            const partX = Math.cos(angle) * distance;
            const partY = Math.sin(angle) * distance * 0.5;

            part.style.top = `${size * 0.2 + partY}px`;
            part.style.left = `${size * 0.3 + partX}px`;

            cloud.appendChild(part);
        }

        // Añadir al contenedor
        container.appendChild(cloud);
    }
}

// Función para crear destellos
function createSparkles(leftContainer, rightContainer) {
    // Crear 20-30 destellos
    const sparkleCount = 20 + Math.floor(Math.random() * 11);

    // Colores para los destellos
    const sparkleColors = [
        'rgba(255, 255, 255, 0.8)', // Blanco
        'rgba(255, 204, 255, 0.8)', // Rosa muy claro
        'rgba(255, 204, 153, 0.8)', // Melocotón claro
        'rgba(204, 255, 255, 0.8)', // Azul muy claro
        'rgba(255, 255, 204, 0.8)'  // Amarillo muy claro
    ];

    for (let i = 0; i < sparkleCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de destello
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        // Posición aleatoria dentro del contenedor
        sparkle.style.top = `${Math.random() * 95}vh`;
        sparkle.style.left = `${Math.random() * 130}px`;

        // Tamaño aleatorio
        const size = 2 + Math.random() * 4; // Entre 2 y 6px
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;

        // Color aleatorio
        const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        sparkle.style.backgroundColor = color;
        sparkle.style.boxShadow = `0 0 ${size * 2}px ${size}px ${color}`;

        // Duración aleatoria para la animación
        const duration = 1 + Math.random() * 3; // Entre 1 y 4 segundos
        const delay = Math.random() * 5; // Retraso aleatorio hasta 5 segundos
        sparkle.style.animation = `sparkle-fade ${duration}s infinite ${delay}s ease-in-out`;

        // Añadir al contenedor
        container.appendChild(sparkle);
    }
}

// Función para crear texto decorativo
function createDecorativeText(leftContainer, rightContainer) {
    // Crear texto "Teresa" en el lado izquierdo
    const teresaText = document.createElement('div');
    teresaText.className = 'side-text';
    teresaText.textContent = 'Teresa';
    teresaText.style.left = '40px';
    teresaText.style.top = '30vh';
    teresaText.style.fontSize = '28px';
    teresaText.style.transform = 'rotate(-90deg)';
    teresaText.style.animation = 'text-wave 5s infinite ease-in-out';
    teresaText.style.color = '#ff1493';
    teresaText.style.textShadow = '2px 2px 4px rgba(255, 105, 180, 0.6)';
    leftContainer.appendChild(teresaText);

    // Crear texto "Elizabeth" en el lado derecho
    const elizabethText = document.createElement('div');
    elizabethText.className = 'side-text';
    elizabethText.textContent = 'Elizabeth';
    elizabethText.style.right = '40px';
    elizabethText.style.top = '60vh';
    elizabethText.style.fontSize = '28px';
    elizabethText.style.transform = 'rotate(90deg)';
    elizabethText.style.animation = 'text-wave 5s infinite ease-in-out 0.5s';
    elizabethText.style.color = '#ff1493';
    elizabethText.style.textShadow = '2px 2px 4px rgba(255, 105, 180, 0.6)';
    rightContainer.appendChild(elizabethText);
}

// Función para crear corazones
function createHearts(leftContainer, rightContainer) {
    // Crear 6-8 corazones
    const heartCount = 6 + Math.floor(Math.random() * 3);

    for (let i = 0; i < heartCount; i++) {
        // Determinar el contenedor (izquierdo o derecho)
        const container = i % 2 === 0 ? leftContainer : rightContainer;

        // Crear elemento de corazón
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';

        // Posición aleatoria dentro del contenedor
        heart.style.top = `${10 + Math.random() * 80}vh`;
        heart.style.left = `${10 + Math.random() * 110}px`;

        // Tamaño aleatorio
        const size = 20 + Math.random() * 15; // Entre 20 y 35px
        heart.style.fontSize = `${size}px`;

        // Duración aleatoria para la animación
        const duration = 0.8 + Math.random() * 0.4; // Entre 0.8 y 1.2 segundos
        heart.style.animation = `heart-beat ${duration}s infinite ease-in-out`;

        // Añadir al contenedor
        container.appendChild(heart);
    }
}