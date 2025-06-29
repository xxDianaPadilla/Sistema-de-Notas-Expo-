let intervalUsuariosConectados = null;
let usuariosConectadosCache = [];

document.addEventListener('DOMContentLoaded', async function() {
    const usuario = await auth.inicializarAuth();
    
    if (!usuario) {
        return;
    }
    
    configurarDashboard(usuario);
    inicializarSistemaUsuariosConectados(usuario);

    await registrarInicioSesion();
});

async function registrarInicioSesion() {
    try {
        await auth.fetchAutenticado('/api/registrar-inicio-sesion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ip_conexion: await obtenerIP()
            })
        });
        console.log('Inicio de sesión registrado en historial');
    } catch (error) {
        console.error('Error registrando inicio de sesión:', error);
    }
}

async function obtenerIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.log('No se pudo obtener IP externa, usando local');
        return 'localhost';
    }
}

function inicializarSistemaUsuariosConectados(usuario) {
    const rolesPermitidos = [1, 2, 3, 4]; 

    if (rolesPermitidos.includes(usuario.idRol)) {
        // Cargar usuarios conectados inmediatamente
        cargarUsuariosConectados();

        // Actualizar cada 10 segundos (más frecuente para mejor sincronización)
        intervalUsuariosConectados = setInterval(() => {
            cargarUsuariosConectados();
        }, 10000);

        // Limpiar usuarios inactivos cada 2 minutos
        setInterval(() => {
            limpiarUsuariosInactivos();
        }, 120000);
    }

    configurarActualizacionActividad();
}

async function limpiarUsuariosInactivos() {
    try {
        await auth.fetchAutenticado('/api/limpiar-usuarios-inactivos', {
            method: 'POST'
        });
        console.log('Usuarios inactivos limpiados');
    } catch (error) {
        console.error('Error limpiando usuarios inactivos:', error);
    }
}

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

function configurarDashboard(usuario) {
    updateGreeting(usuario.nombre);
    actualizarEtapaActual();
    configurarPermisosPorRol(usuario.idRol);
    
    if (usuario.idRol === 1) {
        cargarUsuariosConectados();
        configurarBotonesAdmin();
    }
}

function configurarBotonesAdmin() {
    const usuariosSection = document.querySelector('.usuarios');
    if (usuariosSection) {
        const historialBtn = document.createElement('button');
        historialBtn.textContent = 'Ver Historial Completo';
        historialBtn.className = 'btn-historial';
        historialBtn.addEventListener('click', mostrarHistorialDetallado);
        usuariosSection.appendChild(historialBtn);
    }
}

async function mostrarHistorialDetallado() {
    try {
        const response = await auth.fetchAutenticado('/historial-conexiones-detallado?limite=20');
        const data = await response.json();
        
        mostrarModalHistorial(data.historial);
    } catch (error) {
        console.error('Error cargando historial detallado:', error);
        alert('Error al cargar el historial');
    }
}

function mostrarModalHistorial(historial) {
    const modal = document.createElement('div');
    modal.className = 'modal-historial';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Historial de Conexiones</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="historial-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Inicio Sesión</th>
                                <th>Fin Sesión</th>
                                <th>Duración</th>
                                <th>IP</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.map(item => `
                                <tr>
                                    <td>${item.Nombre} ${item.Apellido}</td>
                                    <td>${item.Rol}</td>
                                    <td>${formatearFecha(item.Fecha_Inicio_Sesion)}</td>
                                    <td>${item.Fecha_Fin_Sesion ? formatearFecha(item.Fecha_Fin_Sesion) : 'Activa'}</td>
                                    <td>${item.DuracionActual || 0} min</td>
                                    <td>${item.IP_Conexion}</td>
                                    <td><span class="estado-${item.Estado_Sesion}">${item.Estado_Sesion}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES');
}

function configurarPermisosPorRol(rolId) {
    const btnVerProyectos = document.getElementById('ver-proyectos');
    const btnCrearEvaluacion = document.getElementById('crear-evaluacion');
    const btnGenerarReporte = document.getElementById('generar-reporte');
    
    switch(rolId) {
        case 1: 
            break;
            
        case 2: 
            if (btnCrearEvaluacion) btnCrearEvaluacion.style.display = 'none';
            if (btnGenerarReporte) btnGenerarReporte.style.display = 'none';
            break;
            
        case 3: 
            if (btnGenerarReporte) btnGenerarReporte.style.display = 'none';
            break;
            
        case 4: 
            if (btnGenerarReporte) btnGenerarReporte.style.display = 'none';
            break;
    }
}

async function cargarUsuariosConectados() {
    try {
        const response = await auth.fetchAutenticado('/usuarios-conectados');

        if(!response.ok){
            throw new Error(`Error al obtener usuarios conectados: ${response.status}`);
        }

        const usuarios = await response.json();
        
        console.log('Usuarios conectados recibidos:', usuarios); // Debug

        const connectedUsersSection = document.querySelector('.connected-users');
        if(!connectedUsersSection) return;

        // Verificar si hay cambios reales en los datos
        const nuevosUsuariosStr = JSON.stringify(usuarios);
        const usuariosAnterioresStr = JSON.stringify(usuariosConectadosCache);
        
        if (nuevosUsuariosStr === usuariosAnterioresStr) {
            return; // No hay cambios, no actualizar UI
        }

        usuariosConectadosCache = usuarios;
        
        if (usuarios && usuarios.length > 0) {
            // Ordenar usuarios por última actividad (más activos primero)
            const usuariosOrdenados = usuarios.sort((a, b) => {
                const actividadA = new Date(a.Ultima_Actividad || a.FechaConexion || 0);
                const actividadB = new Date(b.Ultima_Actividad || b.FechaConexion || 0);
                return actividadB - actividadA;
            });

            connectedUsersSection.innerHTML = usuariosOrdenados.map(usuario => {
                const tiempoConexion = calcularTiempoConexion(usuario.FechaConexion);
                const estadoActividad = determinarEstadoActividad(usuario.Ultima_Actividad);

                return `
                    <div class="user-item" data-user-id="${usuario.Id_Usuario}">
                        <span class="user-status-indicator ${estadoActividad.clase}"></span>
                        <div class="user-info">
                            <div class="user-name">${usuario.Nombre} ${usuario.Apellido}</div>
                            <div class="user-role">${usuario.Rol}</div>
                            <div class="user-connection-time">${tiempoConexion}</div>
                        </div>
                        <span class="user-activity-status">${estadoActividad.texto}</span>
                    </div>
                `;
            }).join('');

            const contadorElement = document.querySelector('.usuarios h4');
            if(contadorElement){
                contadorElement.textContent = `Usuarios Conectados (${usuarios.length})`;
            }
        } else {
           mostrarSinUsuarios(connectedUsersSection);
        }
    } catch (error) {
        console.error('Error cargando usuarios conectados:', error);
        const connectedUsersSection = document.querySelector('.connected-users');
        if(connectedUsersSection){
            connectedUsersSection.innerHTML = '<p class="error-message">Error al cargar usuarios conectados</p>';
        }
    }
}

function mostrarSinUsuarios(contenedor){
    contenedor.innerHTML = '<p class="no-users-message">No hay usuarios conectados actualmente.</p>';

    const contadorElement = document.querySelector('.usuarios h4');
    if(contadorElement){
        contadorElement.textContent = 'Usuarios Conectados (0)';
    }
}

function calcularTiempoConexion(fechaConexion){
    if(!fechaConexion) return 'Tiempo desconocido';

    const ahora = new Date();
    const conexion = new Date(fechaConexion);
    const diferencia = ahora - conexion;

    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);

    if(horas > 0){
        return `Conectado hace ${horas}h ${minutos % 60}m`;
    }else if(minutos > 0){
        return `Conectado hace ${minutos}m`;
    }else{
        return 'Recién conectado';
    }
}

function determinarEstadoActividad(ultimaActividad){
    if(!ultimaActividad){
        return {clase: 'inactive', texto: 'Sin actividad'};
    }

    const ahora = new Date();
    const actividad = new Date(ultimaActividad);
    const diferenciaMinutos = (ahora - actividad) / (1000 * 60);

    if(diferenciaMinutos <= 1){
        return {clase: 'very-active', texto: 'Muy activo'};
    }else if(diferenciaMinutos <= 3){
        return {clase: 'active', texto: 'Activo'};
    }else if(diferenciaMinutos <= 7){
        return {clase: 'idle', texto: 'Inactivo'};
    }else if(diferenciaMinutos <= 15){
        return {clase: 'away', texto: 'Ausente'};
    }else{
        return {clase: 'inactive', texto: 'Desconectado'};
    }
}

async function actualizarActividadUsuario(){
    try {
        await auth.fetchAutenticado('/api/actualizar-actividad', {
            method: 'POST'
        });
        console.log('Actividad actualizada'); // Debug
    } catch (error) {
        console.error('Error actualizando actividad: ', error);
    }
}

function configurarActualizacionActividad(){
    let tiempoUltimaActividad = Date.now();

    const eventosActividad = ['click', 'keypress', 'scroll', 'mousemove'];

    eventosActividad.forEach(evento => {
        document.addEventListener(evento, () => {
            const ahora = Date.now();

            // Actualizar actividad cada minuto de actividad del usuario
            if(ahora - tiempoUltimaActividad > 60000){
                tiempoUltimaActividad = ahora;
                actualizarActividadUsuario();
            }
        });
    });

    // También actualizar actividad automáticamente cada 2 minutos
    setInterval(() => {
        actualizarActividadUsuario();
    }, 120000);
}

window.addEventListener('beforeunload', async () => {
    if(intervalUsuariosConectados){
        clearInterval(intervalUsuariosConectados);
    }
    
    try {
        // Usar navigator.sendBeacon para mejor confiabilidad al cerrar
        const data = JSON.stringify({ accion: 'cerrar_sesion' });
        const success = navigator.sendBeacon('/api/cerrar-sesion-historial', data);
        
        if (!success) {
            // Fallback si sendBeacon falla
            await auth.fetchAutenticado('/api/cerrar-sesion-historial', {
                method: 'POST'
            });
        }
    } catch (error) {
        console.error('Error cerrando sesión en historial:', error);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btnVerProyectos = document.getElementById('ver-proyectos');
    if (btnVerProyectos) {
        btnVerProyectos.addEventListener('click', function() {
            window.location.href = '/projects.html';
        });
    }

    const btnCrearEvaluacion = document.getElementById('crear-evaluacion');
    if (btnCrearEvaluacion) {
        btnCrearEvaluacion.addEventListener('click', function() {
            window.location.href = '/evaluation.html';
        });
    }
    
    const btnGenerarReporte = document.getElementById('generar-reporte');
    if (btnGenerarReporte) {
        btnGenerarReporte.addEventListener('click', function() {
            alert('Función de generación de reportes en desarrollo');
        });
    }
    
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

setInterval(actualizarEtapaActual, 60000);

const style = document.createElement('style');
style.textContent = `
    
    .user-status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 12px;
        flex-shrink: 0;
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
    }
    
    .user-status-indicator.very-active {
        background-color: #4CAF50;
        animation: pulse 2s infinite;
    }
    
    .user-status-indicator.active {
        background-color: #8BC34A;
    }
    
    .user-status-indicator.idle {
        background-color: #FFC107;
    }
    
    .user-status-indicator.away {
        background-color: #FF9800;
    }
    
    .user-status-indicator.inactive {
        background-color: #9E9E9E;
    }
    
    .user-info {
        flex-grow: 1;
    }
    
    .user-name {
        font-weight: 600;
        font-size: 14px;
        color: #333;
        margin-bottom: 2px;
    }
    
    .user-role {
        font-size: 12px;
        color: #666;
        margin-bottom: 2px;
    }
    
    .user-connection-time {
        font-size: 11px;
        color: #999;
    }
    
    .user-activity-status {
        font-size: 12px;
        color: #777;
        font-weight: 500;
        margin-left: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(0,0,0,0.05);
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
        }
        70% {
            box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
        }
    }
    
    .no-users-message, .error-message {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 20px;
        border-radius: 8px;
        background: #f8f9fa;
    }
    
    .error-message {
        color: #f44336;
        background: #ffebee;
    }
    
    .connected-users {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .connected-users::-webkit-scrollbar {
        width: 6px;
    }
    
    .connected-users::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    .connected-users::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    
    .connected-users::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`;
document.head.appendChild(style);