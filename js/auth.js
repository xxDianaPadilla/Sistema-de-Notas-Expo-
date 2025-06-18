// auth.js - Sistema completo de autenticación para el cliente

const AUTH_CONFIG = {
    TOKEN_REFRESH_INTERVAL: 20 * 60 * 1000, // 20 minutos
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    CHECK_SESSION_INTERVAL: 60 * 1000 // 1 minuto
};

let refreshTokenInterval;
let inactivityTimer;
let lastActivity = Date.now();
let currentUser = null;

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/verificar-sesion', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.usuario;
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return null;
    }
}

// Obtener información del usuario actual
function obtenerUsuarioActual() {
    return currentUser;
}

// Iniciar el refresco automático del token
function iniciarRefrescoToken() {
    // Limpiar intervalo existente si hay uno
    if (refreshTokenInterval) {
        clearInterval(refreshTokenInterval);
    }
    
    // Configurar nuevo intervalo
    refreshTokenInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/refrescar-token', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('Error refrescando token');
                await cerrarSesion(true);
            } else {
                console.log('Token refrescado exitosamente');
            }
        } catch (error) {
            console.error('Error refrescando token:', error);
        }
    }, AUTH_CONFIG.TOKEN_REFRESH_INTERVAL);
}

// Detener el refresco del token
function detenerRefrescoToken() {
    if (refreshTokenInterval) {
        clearInterval(refreshTokenInterval);
        refreshTokenInterval = null;
    }
}

// Manejar inactividad del usuario
function iniciarDeteccionInactividad() {
    // Eventos que consideramos como actividad
    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Actualizar última actividad
    const actualizarActividad = () => {
        lastActivity = Date.now();
        reiniciarTimerInactividad();
    };
    
    // Agregar listeners
    eventos.forEach(evento => {
        document.addEventListener(evento, actualizarActividad, true);
    });
    
    // Iniciar timer
    reiniciarTimerInactividad();
    
    // Verificar inactividad periódicamente
    setInterval(() => {
        const tiempoInactivo = Date.now() - lastActivity;
        if (tiempoInactivo > AUTH_CONFIG.INACTIVITY_TIMEOUT) {
            mostrarAlertaInactividad();
        }
    }, AUTH_CONFIG.CHECK_SESSION_INTERVAL);
}

// Reiniciar timer de inactividad
function reiniciarTimerInactividad() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        mostrarAlertaInactividad();
    }, AUTH_CONFIG.INACTIVITY_TIMEOUT);
}

// Mostrar alerta de inactividad
function mostrarAlertaInactividad() {
    // Crear alerta personalizada
    const alertDiv = document.createElement('div');
    alertDiv.className = 'inactivity-alert';
    alertDiv.innerHTML = `
        <div class="inactivity-alert-content">
            <h3>Sesión inactiva</h3>
            <p>Tu sesión está a punto de expirar por inactividad. ¿Deseas continuar?</p>
            <div class="inactivity-alert-buttons">
                <button onclick="continuarSesion()">Continuar</button>
                <button onclick="cerrarSesion()">Cerrar sesión</button>
            </div>
        </div>
    `;
    
    // Estilos para la alerta
    const style = document.createElement('style');
    style.textContent = `
        .inactivity-alert {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        .inactivity-alert-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
        }
        .inactivity-alert-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .inactivity-alert-buttons button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .inactivity-alert-buttons button:first-child {
            background: #e00526;
            color: white;
        }
        .inactivity-alert-buttons button:last-child {
            background: #ccc;
            color: #333;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(alertDiv);
    
    // Hacer accesibles las funciones globalmente
    window.continuarSesion = continuarSesion;
    window.cerrarSesion = cerrarSesion;
}

// Continuar sesión
async function continuarSesion() {
    try {
        const response = await fetch('/api/refrescar-token', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            lastActivity = Date.now();
            reiniciarTimerInactividad();
            
            // Remover alerta
            const alert = document.querySelector('.inactivity-alert');
            if (alert) {
                alert.remove();
            }
        } else {
            cerrarSesion(true);
        }
    } catch (error) {
        console.error('Error continuando sesión:', error);
        cerrarSesion(true);
    }
}

// Cerrar sesión
async function cerrarSesion(sesionExpirada = false) {
    try {
        // Detener refresco de token
        detenerRefrescoToken();
        
        // Mostrar indicador de carga
        mostrarCargando('Cerrando sesión...');
        
        // Llamar al endpoint de logout
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Limpiar datos locales
        currentUser = null;
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirigir al login
        if (sesionExpirada) {
            window.location.replace('/index.html?expired=true');
        } else {
            window.location.replace('/index.html');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Redirigir de todos modos
        window.location.replace('/index.html');
    }
}

// Mostrar indicador de carga
function mostrarCargando(mensaje = 'Cargando...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'auth-loading';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${mensaje}</p>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        #auth-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .loading-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #e00526;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loadingDiv);
}

// Ocultar indicador de carga
function ocultarCargando() {
    const loadingDiv = document.getElementById('auth-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Inicializar autenticación en páginas protegidas
async function inicializarAuth() {
    mostrarCargando('Verificando sesión...');
    
    const sesion = await verificarAutenticacion();
    
    ocultarCargando();
    
    if (!sesion) {
        window.location.replace('/index.html?expired=true');
        return null;
    }
    
    // Iniciar refresco de token
    iniciarRefrescoToken();
    
    // Iniciar detección de inactividad
    iniciarDeteccionInactividad();
    
    // Actualizar UI con información del usuario
    actualizarUIUsuario(sesion.usuario);
    
    return sesion.usuario;
}

// Actualizar UI con información del usuario
function actualizarUIUsuario(usuario) {
    // Actualizar saludo en el dashboard
    const saludoElement = document.getElementById('saludo');
    if (saludoElement) {
        const hora = new Date().getHours();
        let saludo = 'Buenos días';
        let emoji = '🌞';
        
        if (hora >= 12 && hora < 19) {
            saludo = 'Buenas tardes';
        } else if (hora >= 19 || hora < 6) {
            saludo = 'Buenas noches';
            emoji = '🌙';
        }
        
        saludoElement.textContent = `¡${saludo}, ${usuario.nombre}! ${emoji}`;
    }
    
    // Actualizar otros elementos si existen
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = `${usuario.nombre} ${usuario.apellido}`;
    });
    
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(element => {
        element.textContent = usuario.rol;
    });
}

// Función para hacer peticiones autenticadas
async function fetchAutenticado(url, opciones = {}) {
    const defaultOpciones = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...opciones.headers
        }
    };
    
    try {
        const response = await fetch(url, { ...opciones, ...defaultOpciones });
        
        // Si la respuesta es 401, la sesión expiró
        if (response.status === 401) {
            await cerrarSesion(true);
            throw new Error('Sesión expirada');
        }
        
        return response;
    } catch (error) {
        console.error('Error en petición autenticada:', error);
        throw error;
    }
}

// Configurar logout en botones de cerrar sesión
document.addEventListener('DOMContentLoaded', function() {
    // Configurar todos los botones de cerrar sesión
    const logoutButtons = document.querySelectorAll('.cerrar-sesion, .logout-btn, #btnLogout');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Mostrar confirmación usando el alert existente en el proyecto
            const alertDiv = document.getElementById('alert');
            if (alertDiv) {
                alertDiv.style.display = 'flex';
                
                const btnConfirmar = document.getElementById('btnConfirmar');
                const btnCancelar = document.getElementById('btnCancelar');
                
                btnConfirmar.onclick = async function() {
                    alertDiv.style.display = 'none';
                    await cerrarSesion();
                };
                
                btnCancelar.onclick = function() {
                    alertDiv.style.display = 'none';
                };
            } else {
                // Si no hay alert personalizado, usar confirm
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                    await cerrarSesion();
                }
            }
        });
    });
});

// Exportar funciones para uso global
window.auth = {
    verificarAutenticacion,
    inicializarAuth,
    cerrarSesion,
    fetchAutenticado,
    obtenerUsuarioActual,
    continuarSesion
};