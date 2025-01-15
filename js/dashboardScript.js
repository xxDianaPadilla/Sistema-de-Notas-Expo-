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

function obtenerColor(etapa){
    switch(etapa){
        case 'Anteproyecto':
            return 'gray';
        case '30%':
            return '#E00526';
        case '50%':
            return '#F7C100';
        case '80%':
            return 'purple';
        case '100%':
            return '#4CAF50';
        default:
            return 'white';
    }
}

async function actualizarEtapaActual(){
    try{
        const response = await fetch('http://localhost:5501/etapas');
        const etapas = await response.json();

        const fechaActual = new Date();

        const etapaActual = etapas.find(etapa =>{
            const fechaInicio = new Date(etapa.fecha_inicio);
            const fechaFin = new Date(etapa.fecha_fin);
            return fechaActual >= fechaInicio && fechaActual <= fechaFin;
        });

        if(etapaActual){
            stageElement.textContent = etapaActual.porcentaje_etapa;

            stageElement.style.color = obtenerColor(etapaActual.porcentaje_etapa);

            if(etapaActual.porcentaje_etapa === 'Anteproyecto'){
                stageElement.style.fontSize = '50px';
                stageElement.style.marginTop = '20px';
            }else{
                stageElement.style.fontSize = '105px';
                stageElement.style.marginTop = '-12px';
            }
        }else{
            stageElement.textContent = 'Sin etapa actual';
            stageElement.style.color = 'black';
            stageElement.style.fontSize = '50px';
            stageElement.style.marginTop = '20px';
        }
    }catch(error){
        console.error('Error actualizando la etapa actual:', error);
        stageElement.textContent = 'Error al cargar etapa';
        stageElement.style.color = 'red';
        stageElement.style.fontSize = '50px';
        stageElement.style.marginTop = '20px';
    }
}

actualizarEtapaActual();

setInterval(actualizarEtapaActual, 60000);