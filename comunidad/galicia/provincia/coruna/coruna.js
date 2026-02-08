document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTOS DEL DOM EXISTENTES
    const targetDisplay = document.getElementById('target-comarca');
    const scoreDisplay = document.getElementById('score');
    const accuracyDisplay = document.getElementById('accuracy');
    const timerDisplay = document.getElementById('timer');
    const messageDisplay = document.getElementById('message');
    const resetButton = document.getElementById('reset-btn');
    
    const mapElements = document.querySelectorAll('svg polygon[id], svg path[id]'); 

    // --- NUEVO: CREAR LA ETIQUETA FLOTANTE ---
    const cursorLabel = document.createElement('div');
    cursorLabel.id = 'cursor-label';
    document.body.appendChild(cursorLabel);

    // Estilos para la etiqueta flotante (cursor)
    cursorLabel.style.position = 'fixed';
    cursorLabel.style.pointerEvents = 'none'; // CRUCIAL: El clic atraviesa el texto
    cursorLabel.style.zIndex = '9999';
    cursorLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    cursorLabel.style.border = '1px solid #333';
    cursorLabel.style.borderRadius = '4px';
    cursorLabel.style.padding = '5px 10px';
    cursorLabel.style.fontSize = '14px';
    cursorLabel.style.fontWeight = 'bold';
    cursorLabel.style.color = '#333';
    cursorLabel.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
    cursorLabel.style.display = 'none'; // Oculto hasta empezar

    // Mover la etiqueta con el ratón
    document.addEventListener('mousemove', (e) => {
        cursorLabel.style.left = (e.clientX + 15) + 'px';
        cursorLabel.style.top = (e.clientY + 15) + 'px';
    });
    // -----------------------------------------

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

    // --- DICCIONARIO ZAMORA (Tu lista completa) ---
    const dictionary = {
        // A CORUNA
        'ferrolterra': 'Ferrol',
        'eonavia': 'Ortegal', // (Nota: A veces el ID engaña, Ortegal es la zona norte)
        'a-coruña': 'A Coruña',
        'bergantiños': 'Bergantiños',
        'a-terra-de-soneira': 'Terra de Soneira',
        'fisterra': 'Fisterra',
        'xallas': 'Xallas',
        'a-barcala': 'A Barcala',
        'santiago': 'Santiago',
        'arzua': 'Arzúa',
        'a-terra-de-melide': 'Terra de Melide',
        'ordes': 'Ordes',
        'o-sar_1_': 'O Sar',
        'noia': 'Noia',
        'barbanza': 'Barbanza',
        'mora': 'Muros', // ID 'mora' parece un error tipográfico en el SVG original para Muros
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
        clearInterval(timerInterval);
        secondsElapsed = 0;
        timerDisplay.innerText = "00:00";

        timerInterval = setInterval(() => {
            secondsElapsed++;
            const minutes = Math.floor(secondsElapsed / 60);
            const seconds = secondsElapsed % 60;
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
        
        scoreDisplay.innerText = 0;
        accuracyDisplay.innerText = 100;
        cursorLabel.style.display = 'block'; // MOSTRAR ETIQUETA FLOTANTE
        
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
        
        // ACTUALIZAMOS EN LOS DOS SITIOS
        targetDisplay.innerText = currentTargetFormatted;
        cursorLabel.innerText = currentTargetFormatted; // <--- AQUÍ
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

            if (clickedId === currentTargetId) {
                // ACIERTO
                e.target.classList.add('correct');
                score++;
                scoreDisplay.innerText = score;
                updateAccuracy();

                messageDisplay.innerText = `¡Correcto!`;
                messageDisplay.style.color = "green";
                
                // Feedback visual rápido en el cursor también (opcional)
                cursorLabel.style.backgroundColor = '#d4edda'; // Verde claro
                setTimeout(() => cursorLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)', 300);

                setTimeout(pickRandomComarca, 1);

            } else {
                // FALLO
                e.target.classList.add('wrong');
                updateAccuracy(); 
                messageDisplay.innerText = `Incorrecto.`;
                messageDisplay.style.color = "red";
                
                // Feedback visual en el cursor
                cursorLabel.style.backgroundColor = '#f8d7da'; // Rojo claro
                setTimeout(() => cursorLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)', 300);

                setTimeout(() => {
                    e.target.classList.remove('wrong');
                }, 500);
            }
        });
    });

    function gameWin() {
        playing = false;
        stopTimer();
        
        targetDisplay.innerText = "¡COMPLETADO!";
        targetDisplay.style.color = "#20bf6b";

        cursorLabel.style.display = 'none'; // OCULTAMOS LA ETIQUETA AL TERMINAR
        
        const finalAccuracy = accuracyDisplay.innerText;
        const finalTime = timerDisplay.innerText;

        messageDisplay.innerHTML = `¡Juego terminado!<br>Tiempo: <b>${finalTime}</b> - Precisión: <b>${finalAccuracy}%</b>`;
        messageDisplay.style.color = "#333";
    }

    resetButton.addEventListener('click', startGame);
});