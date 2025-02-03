/*CALENDARIO PARA PROGRAMAR ACTIVIDADES IMPORTANTES*/

const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const API_ACTIVIDADES_URL = 'http://localhost:5501/actividades';

let currentDate = new Date();
let actividadesGlobales = [];
const colores = ['#F38E39', '#F64382', '#06AECC'];
const colorMap = new Map();

document.addEventListener('DOMContentLoaded', async () => {
  updateCalendar();

  await obtenerActividades();

  agregarClickActividades();
});

const updateCalendar = () => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthYearString = currentDate.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
  monthYearElement.textContent = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

  let datesHTML = '';

  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    const prevDate = new Date(currentYear, currentMonth, -i);
    datesHTML = `<div class="date inactive">${prevDate.getDate()}</div>` + datesHTML;
  }

  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
    datesHTML += `<div class="date ${activeClass}">${i}</div>`;
  }

  const remainingDays = 7 - ((firstDay + lastDay - 1) % 7 || 7);
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(currentYear, currentMonth + 1, i);
    datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
  }

  datesElement.innerHTML = datesHTML;

  marcarActividadesEnCalendario(actividadesGlobales);

  agregarClickActividades();
};

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

updateCalendar();

async function obtenerActividades() {
  try {
    const response = await fetch(API_ACTIVIDADES_URL);
    actividadesGlobales = await response.json(); 
    marcarActividadesEnCalendario(actividadesGlobales);
  } catch (error) {
    console.error('Error al obtener las actividades:', error);
  }
}

function marcarActividadesEnCalendario(actividades) {
  const dateElements = datesElement.querySelectorAll('.date');
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const diasInactivosInicio = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); 

  const actividadesDelMes = actividades.filter(actividad => {
    const inicio = new Date(actividad.Fecha_Inicio);
    const fin = new Date(actividad.Fecha_Fin);

    return (
      (inicio.getFullYear() === currentYear && inicio.getMonth() === currentMonth) || 
      (fin.getFullYear() === currentYear && fin.getMonth() === currentMonth) || 
      (inicio < new Date(currentYear, currentMonth + 1, 0) && fin > new Date(currentYear, currentMonth, 0))
    );
  });

  actividadesDelMes.forEach(actividad => {
    const inicio = new Date(actividad.Fecha_Inicio);
    const fin = new Date(actividad.Fecha_Fin);

    const inicioDentroDelMes = inicio.getFullYear() === currentYear && inicio.getMonth() === currentMonth;
    const finDentroDelMes = fin.getFullYear() === currentYear && fin.getMonth() === currentMonth;

    let rangoInicio = inicioDentroDelMes ? inicio.getDate() : 1; 
    let rangoFin = finDentroDelMes ? fin.getDate() : new Date(currentYear, currentMonth + 1, 0).getDate(); 

    if(!colorMap.has(actividad.Titulo_Actividad)){
      const colorIndex = colorMap.size % colores.length;
      colorMap.set(actividad.Titulo_Actividad, colores[colorIndex]);
    }

    const colorActividad = colorMap.get(actividad.Titulo_Actividad);
    actividad.color = colorActividad;

    for (let dia = rangoInicio; dia <= rangoFin; dia++) {
      const dayIndex = diasInactivosInicio + dia - 1; 
      const dayElement = dateElements[dayIndex];
      if (dayElement) {
        dayElement.classList.add('actividad');
        dayElement.dataset.titulo = actividad.Titulo_Actividad;
        dayElement.dataset.fechaInicio = inicio.toLocaleDateString('es-ES');
        dayElement.dataset.fechaFin = fin.toLocaleDateString('es-ES');
        dayElement.dataset.color = colorActividad;
        dayElement.style.backgroundColor = colorActividad;
      }
    }
  });

  agregarHoverActividades();
}

function agregarHoverActividades() {
  const actividadElements = document.querySelectorAll('.date.actividad');

  actividadElements.forEach(element => {
    element.addEventListener('mouseover', (event) => {
      const titulo = event.target.dataset.titulo;
      const fechaInicio = event.target.dataset.fechaInicio;
      const fechaFin = event.target.dataset.fechaFin;
      const color = event.target.dataset.color;

      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.innerHTML = `
        <strong>${titulo}</strong><br>
        <p><strong>Inicia:</strong> ${fechaInicio}</p>
        <p><strong>Finaliza:</strong> ${fechaFin}</p>
      `;
      tooltip.style.backgroundColor = color;
      document.body.appendChild(tooltip);

      const rect = event.target.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
      tooltip.style.top = `${rect.top + window.scrollY - 10}px`;

      event.target.addEventListener('mouseleave', () => {
        tooltip.remove();
      });
    });
  });
}

function agregarClickActividades(){
  const actividadElements = document.querySelectorAll('.date.actividad');

  console.log('Elementos de actividades encontrados:', actividadElements.length);

  actividadElements.forEach(element => {
    element.addEventListener('click', (event) =>{
      const titulo = event.target.dataset.titulo;
      const fechaInicio = event.target.dataset.fechaInicio;
      const fechaFin = event.target.dataset.fechaFin;

      console.log('Se hizo clic en:', { titulo, fechaInicio, fechaFin });

      mostrarAlertaActividad(titulo, fechaInicio, fechaFin);
    });
  });
}

function formatearFechaISO(fecha) {
  const partes = fecha.split('/');
  return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
}

function obtenerIdActividadPorTitulo(titulo) {
  const actividad = actividadesGlobales.find(act => act.Titulo_Actividad === titulo);
  return actividad ? actividad.Id_Actividad : null;
}

function mostrarAlertaActividad(titulo, fechaInicio, fechaFin){
  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Actividad: ${titulo}</h2>
      <p><strong>Inicia:</strong> ${fechaInicio}</p>
      <p><strong>Finaliza:</strong> ${fechaFin}</p>
      <div class="modal-buttons">
        <button class="edit-btn"><strong>Editar</strong></button>
        <button class="delete-btn"><strong>Eliminar</strong></button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close').addEventListener('click', () =>{
    modal.remove();
  });

  modal.querySelector('.edit-btn').addEventListener('click', () =>{
    modal.innerHTML = `
    <div class="modal-content2">
    <span class="close2">&times;</span>
    <h2>Editar actividad:</h2>
    <p>Completa los campos solicitados.</p>
    <form id="editar-form">
    <label for="titulo" class="form-label">Título de la actividad:</label>
    <input 
      type="text" 
      id="titulo" 
      class="form-input" 
      placeholder="Título de la actividad" 
      value="${titulo}" 
     />

    <label class="form-label">Fechas estipuladas:</label>
    <div class="date-picker-container">
      <div>
        <label for="fechaInicio" class="date-label">Inicio</label>
        <input 
          type="date" 
          id="fechaInicio" 
          class="date-input" 
          value="${formatearFechaISO(fechaInicio)}" 
        />
      </div>
      <div>
        <label for="fechaFin" class="date-label">Fin</label>
        <input 
          type="date" 
          id="fechaFin" 
          class="date-input" 
          value="${formatearFechaISO(fechaFin)}" 
        />
      </div>
    </div>

    <button type="submit" class="form-button">GUARDAR</button>
    </form>
    </div>
  `;

  modal.querySelector('.close2').addEventListener('click', () =>{
    modal.remove();
  });

  modal.querySelector('#editar-form').addEventListener('submit', async (e) =>{
    e.preventDefault();

    const nuevoTitulo = document.getElementById('titulo').value;
    const nuevaFechaInicio = document.getElementById('fechaInicio').value;
    const nuevaFechaFin = document.getElementById('fechaFin').value;

    try{
      const idActividad = obtenerIdActividadPorTitulo(titulo);
      const response = await fetch(`${API_ACTIVIDADES_URL}/${idActividad}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          Titulo_Actividad: nuevoTitulo,
          Fecha_Inicio: nuevaFechaInicio,
          Fecha_Fin: nuevaFechaFin,
        }),
      });

      if(response.ok){
        const actividadActualizada = await response.json();

        actividadesGlobales = actividadesGlobales.map(act => act.Id_Actividad === idActividad ? actividadActualizada : act);

        await obtenerActividades(); 
        updateCalendar();

        alert('Actividad actualizada correctamente');
        modal.remove();
      }else{
        console.error('Error al actualizar la actividad:', await response.json());
      }
    }catch(error){
      console.error('Error al actualizar la actividad:', error);
    }
  });
  });

  modal.querySelector('.delete-btn').addEventListener('click', async () =>{
    try{
      const idActividad = obtenerIdActividadPorTitulo(titulo);

      const response = await fetch(`${API_ACTIVIDADES_URL}/${idActividad}`, {method: 'DELETE'});
      if(response.ok){
        alert('Actividad eliminada correctamente');

        actividadesGlobales = actividadesGlobales.filter(act => act.Titulo_Actividad !== titulo);
        updateCalendar();

        modal.remove();
      }else{
        console.error('Error al eliminar actividad:', await response.json());
      }
    }catch(error){
      console.error('Error al eliminar actividad', error);
    }
  });
}

document.getElementById('btnNuevo').addEventListener('click', () =>{
  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modal-content2">
      <span class="close2">&times;</span>
      <h2>Agregar nueva actividad</h2>
      <form id="nueva-actividad-form">
        <label for="nuevoTitulo" class="form-label">Título de la actividad:</label>
        <input 
          type="text" 
          id="nuevoTitulo" 
          class="form-input" 
          placeholder="Título de la actividad" 
          required 
        />
        
        <label class="form-label">Fechas estipuladas:</label>
        <div class="date-picker-container">
          <div>
            <label for="nuevoFechaInicio" class="date-label">Inicio</label>
            <input type="date" id="nuevoFechaInicio" class="date-input" required />
          </div>
          <div>
            <label for="nuevoFechaFin" class="date-label">Fin</label>
            <input type="date" id="nuevoFechaFin" class="date-input" required />
          </div>
        </div>
        <button type="submit" class="form-button">GUARDAR</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close2').addEventListener('click', () => modal.remove());

  modal.querySelector('#nueva-actividad-form').addEventListener('submit', async(e) =>{
    e.preventDefault();
    const titulo = document.getElementById('nuevoTitulo').value;
    const fechaInicio = document.getElementById('nuevoFechaInicio').value;
    const fechaFin = document.getElementById('nuevoFechaFin').value;

    if(!fechaInicio || !fechaFin || !titulo){
      alert('Por favor, completa todos los campos');
      return;
  }

    try{
      const response = await fetch('http://localhost:5501/actividades', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({Titulo_Actividad: titulo, Fecha_Inicio: fechaInicio, Fecha_Fin: fechaFin}),
      });

      const result = await response.json();

      if(response.ok){
        alert('Actividad agregada exitosamente');
        await obtenerActividades();
        updateCalendar();
        modal.remove();
      }else{
        alert(result.message);
        console.log(result.message);
      }
    }catch(error){
      console.error('Error al agregar la actividad', error);
    }
  });
});