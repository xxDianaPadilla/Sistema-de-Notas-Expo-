// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar autenticación
    const usuario = await auth.inicializarAuth();
    
    if (!usuario) {
        // Si no hay usuario, la función ya redirigió al login
        return;
    }
    
    // Configurar la página con los datos del usuario
    configurarDashboard(usuario);
});

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
function updateGreeting(nombreUsuario) {
    const greetingElement = document.getElementById("saludo");
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    
    let greeting;
    let emoji;
    
    if (currentHour >= 6 && currentHour < 12) {
        greeting = "Buenos días";
        emoji = "🌞";
    } else if (currentHour >= 12 && currentHour < 19) {
        greeting = "Buenas tardes";
        emoji = "🌞";
    } else {
        greeting = "Buenas noches";
        emoji = "🌙";
    }
    
    greetingElement.textContent = `¡${greeting}, ${nombreUsuario}! ${emoji}`;
}

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
        const response = await auth.fetchAutenticado('/etapas');
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

// Función para configurar el dashboard con los datos del usuario
function configurarDashboard(usuario) {
    // Actualizar saludo con el nombre del usuario
    updateGreeting(usuario.nombre);
    
    // Actualizar etapa actual
    actualizarEtapaActual();
    
    // Configurar permisos según el rol
    configurarPermisosPorRol(usuario.idRol);
    
    // Cargar usuarios conectados si es administrador
    if (usuario.idRol === 1) {
        cargarUsuariosConectados();
    }
}

// Configurar elementos según el rol del usuario
function configurarPermisosPorRol(rolId) {
    // Obtener botones de acciones
    const btnVerProyectos = document.getElementById('ver-proyectos');
    const btnCrearEvaluacion = document.getElementById('crear-evaluacion');
    const btnGenerarReporte = document.getElementById('generar-reporte');
    
    // Configurar visibilidad según rol
    switch(rolId) {
        case 1: // Administrador - acceso total
            // Todos los botones visibles
            break;
            
        case 2: // Estudiante
            if (btnCrearEvaluacion) btnCrearEvaluacion.style.display = 'none';
            if (btnGenerarReporte) btnGenerarReporte.style.display = 'none';
            break;
            
        case 3: // Docente
            // Puede ver proyectos y crear evaluaciones
            if (btnGenerarReporte) btnGenerarReporte.style.display = 'none';
            break;
            
        case 4: // Evaluador
            // Puede ver proyectos y crear evaluaciones
            if (btnGenerarReporte) btnGenerarReporte.style.display = 'none';
            break;
    }
}

// Cargar usuarios conectados
async function cargarUsuariosConectados() {
    try {
        const response = await auth.fetchAutenticado('/usuarios-conectados');
        const usuarios = await response.json();
        
        const connectedUsersSection = document.querySelector('.connected-users');
        
        if (usuarios && usuarios.length > 0) {
            // Filtrar usuarios con estado de conexión activo
            const usuariosActivos = usuarios.filter(u => u.Estado_Conexion);
            
            if (usuariosActivos.length > 0) {
                connectedUsersSection.innerHTML = usuariosActivos.map(usuario => `
                    <div class="user-item">
                        <span class="user-status-indicator"></span>
                        <span>${usuario.Nombre} ${usuario.Apellido} - ${usuario.Rol}</span>
                    </div>
                `).join('');
            } else {
                connectedUsersSection.innerHTML = '<p>No hay ningún usuario en línea.</p>';
            }
        } else {
            connectedUsersSection.innerHTML = '<p>No hay ningún usuario en línea.</p>';
        }
    } catch (error) {
        console.error('Error cargando usuarios conectados:', error);
    }
}

// Configurar botones de acción
document.addEventListener('DOMContentLoaded', function() {
    // Botón Ver Proyectos
    const btnVerProyectos = document.getElementById('ver-proyectos');
    if (btnVerProyectos) {
        btnVerProyectos.addEventListener('click', function() {
            window.location.href = '/projects.html';
        });
    }
    
    // Botón Crear Evaluación
    const btnCrearEvaluacion = document.getElementById('crear-evaluacion');
    if (btnCrearEvaluacion) {
        btnCrearEvaluacion.addEventListener('click', function() {
            window.location.href = '/evaluation.html';
        });
    }
    
    // Botón Generar Reporte
    const btnGenerarReporte = document.getElementById('generar-reporte');
    if (btnGenerarReporte) {
        btnGenerarReporte.addEventListener('click', function() {
            alert('Función de generación de reportes en desarrollo');
        });
    }
    
    // Botón Leer Más
    const btnLeerMas = document.getElementById('leer-mas');
    if (btnLeerMas) {
        btnLeerMas.addEventListener('click', function() {
            const description = document.querySelector('.description p');
            
            if (this.textContent === 'Leer Más') {
                description.innerHTML = `
                    El <strong>Proyecto Técnico Científico</strong> es un proceso de aprendizaje significativo que
                    integra las competencias adquiridas durante el año lectivo para ser aplicadas en la
                    propuesta de <strong>solución a una necesidad del entorno social, industrial, económico o
                    cultural.</strong>
                    <br><br>
                    Este proyecto representa una oportunidad única para que los estudiantes demuestren sus 
                    habilidades técnicas y científicas adquiridas, trabajando en equipo para desarrollar 
                    soluciones innovadoras que tengan un impacto real en la comunidad. A través de las 
                    diferentes etapas del proyecto (30%, 50%, 80% y 100%), los estudiantes aprenden a 
                    planificar, ejecutar y presentar sus ideas de manera profesional.
                `;
                this.textContent = 'Leer Menos';
            } else {
                description.innerHTML = `
                    El <strong>Proyecto Técnico Científico</strong> es un proceso de aprendizaje significativo que
                    integra las competencias adquiridas durante el año lectivo para ser aplicadas en la
                    propuesta de <strong>solución a una necesidad del entorno social, industrial, económico o
                    cultural.</strong>
                `;
                this.textContent = 'Leer Más';
            }
        });
    }
});

// Actualizar etapa cada minuto
setInterval(actualizarEtapaActual, 60000);

// Agregar estilos para el indicador de usuarios conectados
const style = document.createElement('style');
style.textContent = `
    .user-item {
        display: flex;
        align-items: center;
        padding: 5px 0;
    }
    
    .user-status-indicator {
        width: 8px;
        height: 8px;
        background-color: #4CAF50;
        border-radius: 50%;
        margin-right: 10px;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
        }
    }
`;