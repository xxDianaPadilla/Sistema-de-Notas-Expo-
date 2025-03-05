// URL de la API donde se obtienen las etapas (esto se obtiene con el endpoint que esta en el archivo server.js)
const API_URL = 'http://localhost:5501/etapas';

// Función asincrónica para obtener las etapas desde la API
async function obtenerEtapas(){
    try{
        const response = await fetch(API_URL);
        const etapas = await response.json();
        renderizarCards(etapas);
    }catch(error){
        console.error('Error al obtener las etapas: ', error);
    }
}

// Función para rederizar las tarjetas de las etapas en el DOM 
function renderizarCards(etapas){
    // Selecciona el contenedor donde se mostrarán las tarjetas
    const contenedor = document.querySelector('.actividades');
    // Establece el encabezado inicial
    contenedor.innerHTML = `<h1>Etapas Próximas:</h1>`;

    // Repetir cada etapa y genera una tarjeta
    etapas.forEach(etapa => {
        // Obtiene el color de la tarjeta en función del porcentaje de avance
        const color = obtenerColor(etapa.porcentaje_etapa);
        // Formatea la fecha de finalización
        const fecha = new Date(etapa.fecha_fin);
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString('es-ES', {month: 'short'}).toUpperCase();
    
        // Crea el elemento de la tarjeta
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundColor = color;
        cardElement.innerHTML = `
            <h2>${dia} <span>${mes}</span></h2>
            <p>Etapa: ${etapa.porcentaje_etapa}</p>
        `;

        // Agrega un evento para abrir el modal de edición al hacer clic en la tarjeta
        cardElement.addEventListener('click', () => mostrarFormularioModal(etapa));
        contenedor.appendChild(cardElement);
    });
}

// Función para asignar colores según el porcentaje de avannce de la etapa
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

// Ejeciuta la función obtenerEtapas cuando el documento se haya cargado completamente
document.addEventListener('DOMContentLoaded', obtenerEtapas);

// Función para mostrar un formulario modal y permitir la edición de las fechas
function mostrarFormularioModal(etapa){
    // Crea un elemento div para el modal
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Formatea las fechas de inicio y fin si existen
    const fechaInicio = etapa.fecha_inicio 
        ? new Date(etapa.fecha_inicio).toISOString().slice(0, 10) 
        : '';
    const fechaFin = etapa.fecha_fin 
        ? new Date(etapa.fecha_fin).toISOString().slice(0, 10) 
        : '';

    // Define el contenido del modal con el formulario
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

    // Agrega el modal al DOM
    document.body.appendChild(modal);

    // Evento para cerrar el modal al hacer clic en la 'X'
    modal.querySelector('.close2').addEventListener('click', () =>{
        modal.remove();
    });

    // Evento para manejar la actualización de las fechas
    const form = modal.querySelector('#editar-form');
    form.addEventListener('submit', async (e) =>{
        e.preventDefault();
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;

        // Verifica que ambos campos estén llenos antes de continuar
        if(!fechaInicio || !fechaFin){
            alert('Por favor, completa ambos campos');
            return;
        }

        // Llama a la función para actualizar la etapa
        const actualizado = await actualizarEtapa(etapa.id_etapa, fechaInicio, fechaFin);

        // Si la actualización fue exitosa, cierra el modal
        if (actualizado) {
            modal.remove(); 
        }

        // Recarga las etapas para reflejar los cambios
        obtenerEtapas();
    });
}

// Función para actualizar las fechas de una etapa en la API
async function actualizarEtapa(id, fechaInicio, fechaFin){
    try{
        // Realiza una solicitud PUT para actualizar la etapa
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

        // Convierte la respuesta en JSON
        const result = await response.json();

        // Verifica si la actualización fue exitosa
        if(!response.ok){
            console.error('Error al actualizar la etapa:', result.message);
            alert(result.message);
            return false;
        }

        // Vuelve a cargar las etapas y muestra una alerta de éxito
        await obtenerEtapas();
        alert('Etapa actualizada correctamente.');
        return true;
    }catch(error){
        console.error('Error en la solicitud:', error);
        alert('Hubo un problema con el servidor.');
        return false;
    }
}