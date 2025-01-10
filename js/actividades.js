const API_URL = 'http://localhost:5501/etapas';

async function obtenerEtapas(){
    try{
        const response = await fetch(API_URL);
        const etapas = await response.json();
        renderizarCards(etapas);
    }catch(error){
        console.error('Error al obtener las etapas: ', error);
    }
}

function renderizarCards(etapas){
    const contenedor = document.querySelector('.actividades');
    contenedor.innerHTML = `<h1>Etapas Próximas:</h1>`;

    etapas.forEach(etapa => {
        const color = obtenerColor(etapa.porcentaje_etapa);
        const fecha = new Date(etapa.fecha_fin);
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString('es-ES', {month: 'short'}).toUpperCase();
    
        const card = `
                <div class="card" style="background-color: ${color};">
                    <h2>${dia} <span>${mes}</span></h2>
                    <p>Etapa: ${etapa.porcentaje_etapa}</p>
                </div>
            `;
            contenedor.innerHTML += card;
    });
}

function obtenerColor(etapa){
    switch (etapa){
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

document.addEventListener('DOMContentLoaded', obtenerEtapas);