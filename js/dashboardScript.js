/*Formato de fecha y hora*/
const dateElement = document.querySelector('.date');
const timeElement = document.querySelector('.time');

function updateDateTime() {
    const now = new Date();

    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('es-ES', dateOptions);
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    dateElement.textContent = formattedDate;

    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    let timeStr = now.toLocaleTimeString('es-ES', timeOptions);

    timeStr = timeStr.replace('AM', 'a.m.').replace('PM', 'p.m.');
        
    timeElement.textContent = timeStr;
}

setInterval(updateDateTime, 1000);
updateDateTime();

/*Función para cambiar el saludo según la hora*/
function updateGreeting() {
    const greetingElement = document.getElementById("saludo");
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const period = currentHour < 12 ? "a.m." : "p.m.";

    const displayHour = currentHour % 12 || 12;
    const displayMinute = currentMinute < 10 ? `0${currentMinute}` : currentMinute;

    if (currentHour >= 6 && currentHour < 12) {
        greetingElement.textContent = `¡Buenos días, Eduardo! 🌞`;
    } else if (currentHour >= 12 && currentHour < 19) {
        greetingElement.textContent = `¡Buenas tardes, Eduardo! 🌞`;
    } else {
        greetingElement.textContent = `¡Buenas noches, Eduardo! 🌙`;
    }

    document.querySelector(".time").textContent = `${displayHour}:${displayMinute} ${period}`;
}

window.onload = updateGreeting;

/*Cambiar color dependiendo el progreso*/
const stageElement = document.querySelector('.stage');

function updateStageColor() {
    const percentage = parseInt(stageElement.textContent);

    if (percentage < 50) {
        stageElement.style.color = '#E00526';
    } else if (percentage >= 50 && percentage < 75) {
        stageElement.style.color = '#F7C100'; 
    } else {
        stageElement.style.color = '#4CAF50';
    }
}

// Llamar a la función para actualizar el color
updateStageColor();