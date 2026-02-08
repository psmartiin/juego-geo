document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTOS DEL DOM
    const targetDisplay = document.getElementById('target-comarca');
    const scoreDisplay = document.getElementById('score');
    const accuracyDisplay = document.getElementById('accuracy');
    const timerDisplay = document.getElementById('timer'); // <--- NUEVO
    const messageDisplay = document.getElementById('message');
    const resetButton = document.getElementById('reset-btn');
    
    const mapElements = document.querySelectorAll('svg polygon[id], svg path[id]'); 

    // VARIABLES DE ESTADO
    let allComarcas = [];       
    let pendingComarcas = [];   
    let currentTargetFormatted = ''; 
    let currentTargetId = '';       
    let score = 0;
    let totalClicks = 0;
    let playing = false;

    // VARIABLES DEL CRONÓMETRO
    let timerInterval;
    let secondsElapsed = 0;

    // --- DICCIONARIO ZAMORA ---
const dictionary = {
        // Las que ya tienen nombre correcto en tu código:
        'las-arribes': 'Vitigudino', // O Arribes del Duero
        'la-tierra-de-penaranda': 'Tierra de Peñaranda', // Y Cantalapiedra
        'la-sierra-de-bejar': 'Sierra de Béjar',

        // Las que faltan (Tendrás que averiguar cuál es cuál en tu mapa):
        // Posibles nombres: Ciudad Rodrigo, Campo de Charro, La Armuña, Sierra de Francia...
        'polygon2': 'Ciudad Rodrigo',
        'polygon3': 'Tierra de Ledesma',
        'polygon4': 'Campo de Salamanca',
        'polygon5': 'Sierra de Francia',
        'polygon6': 'Tierra de Alba',
        'polygon7': 'Guijuelo',
        'polygon8': 'Las Villas',
        'polygon9': 'La Armuña'
    };

    function formatName(id) {
        if (!id) return "Desconocido";
        if (dictionary[id]) return dictionary[id];
        let name = id.replace(/-/g, ' '); 
        return name.replace(/\b\w/g, l => l.toUpperCase());
    }

    // INICIALIZACIÓN
    mapElements.forEach(elem => {
        const id = elem.getAttribute('id');
        if (id && !id.startsWith('path') && !id.startsWith('XMLID') && !id.startsWith('g')) {
            allComarcas.push(id);
        }
    });

    if (allComarcas.length === 0) {
        messageDisplay.innerText = "Error: No detecto IDs válidos.";
    } else {
        startGame();
    }

    // --- LÓGICA DEL RELOJ ---
    function startTimer() {
        // Limpiamos por si había uno corriendo
        clearInterval(timerInterval);
        secondsElapsed = 0;
        timerDisplay.innerText = "00:00";

        timerInterval = setInterval(() => {
            secondsElapsed++;
            
            // Matemáticas para minutos y segundos
            const minutes = Math.floor(secondsElapsed / 60);
            const seconds = secondsElapsed % 60;

            // Formato 00:00 (añadimos un 0 delante si es menor de 10)
            const minString = minutes.toString().padStart(2, '0');
            const secString = seconds.toString().padStart(2, '0');
            
            timerDisplay.innerText = `${minString}:${secString}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function startGame() {
        playing = true;
        score = 0;
        totalClicks = 0; 
        
        // Reseteamos UI
        scoreDisplay.innerText = 0;
        accuracyDisplay.innerText = 100;
        
        // Iniciamos reloj
        startTimer();

        pendingComarcas = [...allComarcas]; 
        mapElements.forEach(p => p.classList.remove('correct', 'wrong'));
        
        pickRandomComarca();
    }

    function pickRandomComarca() {
        if (pendingComarcas.length === 0) {
            gameWin();
            return;
        }
        const randomIndex = Math.floor(Math.random() * pendingComarcas.length);
        currentTargetId = pendingComarcas[randomIndex];
        pendingComarcas.splice(randomIndex, 1);

        currentTargetFormatted = formatName(currentTargetId);
        targetDisplay.innerText = currentTargetFormatted;
    }

    function updateAccuracy() {
        if (totalClicks === 0) {
            accuracyDisplay.innerText = 100;
            return;
        }
        const percentage = Math.round((score / totalClicks) * 100);
        accuracyDisplay.innerText = percentage;
    }

    // MANEJO DE CLICS
    mapElements.forEach(elem => {
        elem.addEventListener('click', (e) => {
            if (!playing) return;
            if (e.target.classList.contains('correct')) return; 

            totalClicks++;

            const clickedId = e.target.getAttribute('id');
            const clickedNameFormatted = formatName(clickedId);

            if (clickedId === currentTargetId) {
                // ACIERTO
                e.target.classList.add('correct');
                score++;
                scoreDisplay.innerText = score;
                updateAccuracy();

                messageDisplay.innerText = `¡Correcto!`;
                messageDisplay.style.color = "green";
                
                setTimeout(pickRandomComarca, 1);

            } else {
                // FALLO
                e.target.classList.add('wrong');
                updateAccuracy(); 
                messageDisplay.innerText = `Incorrecto.`;
                messageDisplay.style.color = "red";
                
                setTimeout(() => {
                    e.target.classList.remove('wrong');
                }, 500);
            }
        });
    });

    function gameWin() {
        playing = false;
        stopTimer(); // <--- PARAMOS EL RELOJ
        
        targetDisplay.innerText = "¡COMPLETADO!";
        targetDisplay.style.color = "#20bf6b";
        
        const finalAccuracy = accuracyDisplay.innerText;
        const finalTime = timerDisplay.innerText;

        messageDisplay.innerHTML = `¡Juego terminado!<br>Tiempo: <b>${finalTime}</b> - Precisión: <b>${finalAccuracy}%</b>`;
        messageDisplay.style.color = "#333";
    }

    resetButton.addEventListener('click', startGame);
});