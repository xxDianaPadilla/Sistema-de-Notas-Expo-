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
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close').addEventListener('click', () =>{
    modal.remove();
  });

  modal.querySelector('.edit-btn').addEventListener('click', () =>{
    alert(`Editar actividad: ${titulo}`);
    modal.remove();
  });

  modal.querySelector('.delete-btn').addEventListener('click', () =>{
    alert(`Eliminar actividad: ${titulo}`);
    modal.remove();
  });
}