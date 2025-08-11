// Event listener para el enlace "Evaluar proyecto"
document.addEventListener('DOMContentLoaded', function() {
  const enlaceEvaluar = document.getElementById('evaluar');
  if (enlaceEvaluar) {
    enlaceEvaluar.addEventListener('click', function(e) {
      e.preventDefault(); // Prevenir la navegación por defecto
      mostrarAlertaEvaluarProyecto();
    });
  }
});

// Función para mostrar la alerta de evaluar proyecto
async function mostrarAlertaEvaluarProyecto() {
  // Overlay oscuro
  const overlay = document.createElement("div");
  overlay.id = "overlayEvaluarProyecto";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  overlay.style.zIndex = "999";

  // Alerta personalizada
  const alertContainer = document.createElement("div");
  alertContainer.id = "alertEvaluarProyecto";
  alertContainer.style.position = "fixed";
  alertContainer.style.top = "50%";
  alertContainer.style.left = "50%";
  alertContainer.style.transform = "translate(-50%, -50%)";
  alertContainer.style.padding = "20px";
  alertContainer.style.backgroundColor = "#fff";
  alertContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  alertContainer.style.borderRadius = "8px";
  alertContainer.style.textAlign = "center";
  alertContainer.style.zIndex = "1000";
  alertContainer.style.width = "400px";

  alertContainer.innerHTML = `
    <button id="btnCloseEvaluar" style="
        position: absolute;
        top: 5px;
        right: 10px;
        background: none;
        border: none;
        font-size: 22px;
        font-family: 'Poppins', 'SansSerif';
        font-weight: bold;
        color: #1D1D1B;
        cursor: pointer;">&times;</button>
    <h3>Evaluar Proyecto</h3>
    <p>Selecciona la rúbrica que deseas usar para evaluar:</p>
    <div style="margin-bottom: 15px;">
        <select id="selectRubricaEvaluar" style="padding: 8px; width: 100%; margin-top: 5px;">
            <option value="">Cargando rúbricas...</option>
        </select>
    </div>
    <div class="alert-buttons">
        <button id="btnConfirmarEvaluacion" style="background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">Continuar</button>
        <button id="btnCancelarEvaluacion" style="background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(alertContainer);

  // Cargar rúbricas en el select
  await cargarRubricasParaEvaluacion();

  // Event listeners
  document.getElementById('btnConfirmarEvaluacion').addEventListener('click', confirmarSeleccionRubrica);
  document.getElementById('btnCancelarEvaluacion').addEventListener('click', cerrarAlertaEvaluarProyecto);
  document.getElementById('btnCloseEvaluar').addEventListener('click', cerrarAlertaEvaluarProyecto);

  // Cerrar al hacer clic en el overlay
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      cerrarAlertaEvaluarProyecto();
    }
  });
}

// Función para cargar rúbricas en el select de evaluación
async function cargarRubricasParaEvaluacion() {
  try {
    const response = await fetch("http://localhost:5501/api/rubricas");
    const rubricas = await response.json();
    
    const select = document.getElementById('selectRubricaEvaluar');
    select.innerHTML = '<option value="">Seleccionar rúbrica...</option>';
    
    rubricas.forEach((rubrica) => {
      const option = document.createElement('option');
      option.value = JSON.stringify({
        id: rubrica.id_Rubrica,
        nombre: rubrica.nombre_Rubrica,
        idNivel: rubrica.Id_Nivel,
        idEspecialidad: rubrica.Id_Especialidad
      });
      option.textContent = rubrica.nombre_Rubrica;
      select.appendChild(option);
    });

    if (rubricas.length === 0) {
      const option = document.createElement('option');
      option.value = "";
      option.textContent = "No hay rúbricas disponibles";
      option.disabled = true;
      select.appendChild(option);
    }
  } catch (error) {
    console.error('Error al cargar rúbricas:', error);
    alert('Error al cargar las rúbricas');
  }
}

// Función para confirmar la selección de rúbrica y mostrar proyectos
async function confirmarSeleccionRubrica() {
  const selectRubrica = document.getElementById('selectRubricaEvaluar');
  const rubricaSeleccionada = selectRubrica.value;
  
  if (rubricaSeleccionada === "") {
    alert('Por favor, selecciona una rúbrica para continuar.');
    return;
  }

  const rubricaData = JSON.parse(rubricaSeleccionada);
  
  const idNivel = rubricaData.idNivel;
const idEspecialidad = rubricaData.idEspecialidad;

console.log("Nivel seleccionado:", idNivel);
console.log("Especialidad seleccionada:", idEspecialidad);

  // Cerrar la alerta actual
  cerrarAlertaEvaluarProyecto();
  
  // Mostrar proyectos compatibles
  await mostrarProyectosCompatibles(rubricaData);
}

// Función para mostrar proyectos compatibles con la rúbrica seleccionada
async function mostrarProyectosCompatibles(rubricaData) {
  try {
    // Cargar proyectos que coincidan con el nivel y especialidad de la rúbrica
    const response = await fetch(`http://localhost:5501/api/proyectos/grado?idNivel=${rubricaData.idNivel}&idEspecialidad=${rubricaData.idEspecialidad}`);
    const proyectos = await response.json();
    
    // Crear overlay y alerta para mostrar proyectos
    const overlay = document.createElement("div");
    overlay.id = "overlayProyectos";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    overlay.style.zIndex = "999";

    const alertContainer = document.createElement("div");
    alertContainer.id = "alertProyectos";
    alertContainer.style.position = "fixed";
    alertContainer.style.top = "50%";
    alertContainer.style.left = "50%";
    alertContainer.style.transform = "translate(-50%, -50%)";
    alertContainer.style.padding = "20px";
    alertContainer.style.backgroundColor = "#fff";
    alertContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    alertContainer.style.borderRadius = "8px";
    alertContainer.style.zIndex = "1000";
    alertContainer.style.width = "600px";
    alertContainer.style.maxHeight = "80vh";
    alertContainer.style.overflowY = "auto";

    let proyectosHTML = '';
    if (proyectos.length > 0) {
      proyectosHTML = proyectos.map(proyecto => `
        <div class="proyecto-item" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin-bottom: 10px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border-left: 4px solid #007bff;
        ">
          <div>
            <strong>${proyecto.nombre_Proyecto}</strong>
            <br>
            <small>ID: ${proyecto.id_Proyecto}</small>
          </div>
          <button class="btn-evaluar-proyecto" 
                  data-proyecto='${JSON.stringify(proyecto)}'
                  data-rubrica='${JSON.stringify(rubricaData)}'
                  style="
                    background-color: #28a745;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                  ">
            Evaluar
          </button>
        </div>
      `).join('');
    } else {
      proyectosHTML = '<p style="text-align: center; color: #666;">No se encontraron proyectos compatibles con esta rúbrica.</p>';
    }

    alertContainer.innerHTML = `
      <button id="btnCloseProyectos" style="
          position: absolute;
          top: 5px;
          right: 10px;
          background: none;
          border: none;
          font-size: 22px;
          font-family: 'Poppins', 'SansSerif';
          font-weight: bold;
          color: #1D1D1B;
          cursor: pointer;">&times;</button>
      <h3>Proyectos Compatibles</h3>
      <p>Rúbrica seleccionada: <strong>${rubricaData.nombre}</strong></p>
      <div style="max-height: 400px; overflow-y: auto;">
        ${proyectosHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="btnVolverRubricas" style="
          background-color: #6c757d;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        ">Volver a Rúbricas</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(alertContainer);

    // Event listeners
    document.getElementById('btnCloseProyectos').addEventListener('click', () => {
      document.body.removeChild(alertContainer);
      document.body.removeChild(overlay);
    });

    document.getElementById('btnVolverRubricas').addEventListener('click', () => {
      document.body.removeChild(alertContainer);
      document.body.removeChild(overlay);
      mostrarAlertaEvaluarProyecto();
    });

    // Event listeners para botones de evaluar
    document.querySelectorAll('.btn-evaluar-proyecto').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const proyectoData = JSON.parse(e.target.getAttribute('data-proyecto'));
        const rubricaData = JSON.parse(e.target.getAttribute('data-rubrica'));
        
        // Guardar datos para la página de evaluación
        localStorage.setItem('proyectoParaEvaluar', JSON.stringify(proyectoData));
        localStorage.setItem('rubricaParaEvaluar', JSON.stringify(rubricaData));
        
        // Redirigir a la página de evaluación
        window.location.href = '/evaluarProyecto.html';
      });
    });

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        document.body.removeChild(alertContainer);
        document.body.removeChild(overlay);
      }
    });

  } catch (error) {
    console.error('Error al cargar proyectos:', error);
    alert('Error al cargar los proyectos compatibles');
  }
}

// Función para cerrar la alerta de evaluar proyecto
function cerrarAlertaEvaluarProyecto() {
  const alert = document.getElementById('alertEvaluarProyecto');
  const overlay = document.getElementById('overlayEvaluarProyecto');
  if (alert && overlay) {
    document.body.removeChild(alert);
    document.body.removeChild(overlay);
  }
}