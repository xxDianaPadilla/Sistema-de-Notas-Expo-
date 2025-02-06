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
    
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundColor = color;
        cardElement.innerHTML = `
            <h2>${dia} <span>${mes}</span></h2>
            <p>Etapa: ${etapa.porcentaje_etapa}</p>
        `;

        cardElement.addEventListener('click', () => mostrarFormularioModal(etapa));
        contenedor.appendChild(cardElement);
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

function mostrarFormularioModal(etapa){
    const modal = document.createElement('div');
    modal.className = 'modal';

    const fechaInicio = etapa.fecha_inicio 
        ? new Date(etapa.fecha_inicio).toISOString().slice(0, 10) 
        : '';
    const fechaFin = etapa.fecha_fin 
        ? new Date(etapa.fecha_fin).toISOString().slice(0, 10) 
        : '';

    modal.innerHTML = `
        <div class="modal-content2">
            <span class="close2">&times;</span>
            <h2>Editar actividad:</h2>
            <p>Actualiza las fechas para esta etapa.</p>
            <form id="editar-form">
                <label for="fechaInicio" class="form-label">Fecha Inicio:</label>
                <input 
                    type="date" 
                    id="fechaInicio" 
                    class="form-input" 
                    value="${fechaInicio}" 
                />
                <label for="fechaFin" class="form-label">Fecha Fin:</label>
                <input 
                    type="date" 
                    id="fechaFin" 
                    class="form-input" 
                    value="${fechaFin}" 
                />
                <button type="submit" class="form-button">GUARDAR</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close2').addEventListener('click', () =>{
        modal.remove();
    });

    const form = modal.querySelector('#editar-form');
    form.addEventListener('submit', async (e) =>{
        e.preventDefault();
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;

        if(!fechaInicio || !fechaFin){
            alert('Por favor, completa ambos campos');
            return;
        }

        const actualizado = await actualizarEtapa(etapa.id_etapa, fechaInicio, fechaFin);


        if (actualizado) {
            modal.remove(); 
        }

        obtenerEtapas();
    });
}

async function actualizarEtapa(id, fechaInicio, fechaFin){
    try{
        const response = await fetch(`http://localhost:5501/etapas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
            }),
        });

        const result = await response.json();

        if(!response.ok){
            console.error('Error al actualizar la etapa:', result.message);
            alert(result.message);
            return false;
        }

        await obtenerEtapas();
        alert('Etapa actualizada correctamente.');
        return true;
    }catch(error){
        console.error('Error en la solicitud:', error);
        alert('Hubo un problema con el servidor.');
        return false;
    }
}