// cerrarSesion.js - Sistema de cierre de sesión mejorado con manejo de expiración

// Variable para almacenar el intervalo de heartbeat
let heartbeatInterval;
let sessionWarningShown = false;

document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si no estamos en la página de login
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        return;
    }

    // Configurar cierre de sesión
    setupLogout();
    
    // Configurar heartbeat para mantener sesión activa
    setupHeartbeat();
    
    // Verificar sesión al cargar la página
    checkSession();
    
    // Configurar advertencia de expiración de sesión
    setupSessionWarning();
});

// Función para configurar el cierre de sesión
function setupLogout() {
    const btnCerrarSesion = document.querySelector('.cerrar-sesion');
    const alertDiv = document.getElementById('alert');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const btnCancelar = document.getElementById('btnCancelar');

    if (!btnCerrarSesion) {
        console.log('Botón de cerrar sesión no encontrado en esta página');
        return;
    }

    // Mostrar alerta al hacer clic en cerrar sesión
    btnCerrarSesion.addEventListener('click', function(e) {
        e.preventDefault();
        if (alertDiv) {
            alertDiv.style.display = 'flex';
        }
    });

    // Confirmar cierre de sesión
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async function() {
            try {
                // Deshabilitar botón mientras se procesa
                btnConfirmar.disabled = true;
                btnConfirmar.textContent = 'Cerrando sesión...';

                const response = await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Logout exitoso:', data.message);
                    
                    // Detener heartbeat
                    if (heartbeatInterval) {
                        clearInterval(heartbeatInterval);
                    }
                    
                    // Redirigir al login
                    window.location.replace('/index.html');
                } else if (response.status === 401) {
                    // Token ya expirado
                    console.log('Sesión ya expirada');
                    window.location.replace('/index.html?expired=true');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al cerrar sesión');
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión: ' + error.message);
                
                // Rehabilitar botón en caso de error
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = 'Confirmar';
            }
        });
    }

    // Cancelar cierre de sesión
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (alertDiv) {
                alertDiv.style.display = 'none';
            }
        });
    }

    // Cerrar alerta al hacer clic fuera
    if (alertDiv) {
        alertDiv.addEventListener('click', function(e) {
            if (e.target === alertDiv) {
                alertDiv.style.display = 'none';
            }
        });
    }
}

// Función para verificar la sesión
async function checkSession() {
    try {
        const response = await fetch('/api/verificar-sesion', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.log('Sesión no válida o expirada');
                // Solo redirigir si no estamos ya en la página de login
                if (!window.location.pathname.includes('index.html')) {
                    window.location.replace('/index.html?expired=true');
                }
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.includes('index.html')) {
            window.location.replace('/index.html');
        }
    }
}

// Función para configurar el heartbeat
function setupHeartbeat() {
    // Enviar heartbeat cada 5 minutos para mantener la sesión activa
    heartbeatInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/heartbeat', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok && response.status === 401) {
                // Sesión expirada
                clearInterval(heartbeatInterval);
                window.location.replace('/index.html?expired=true');
            }
        } catch (error) {
            console.error('Error en heartbeat:', error);
        }
    }, 5 * 60 * 1000); // 5 minutos
}

// Función para mostrar advertencia antes de que expire la sesión
function setupSessionWarning() {
    // Mostrar advertencia 5 minutos antes de que expire la sesión (a los 25 minutos)
    setTimeout(() => {
        if (!sessionWarningShown) {
            sessionWarningShown = true;
            showSessionWarning();
        }
    }, 25 * 60 * 1000); // 25 minutos
}

// Función para mostrar el modal de advertencia
function showSessionWarning() {
    // Crear modal de advertencia si no existe
    let warningModal = document.getElementById('session-warning-modal');
    
    if (!warningModal) {
        warningModal = document.createElement('div');
        warningModal.id = 'session-warning-modal';
        warningModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                        justify-content: center; z-index: 10000;">
                <div style="background: white; padding: 30px; border-radius: 10px; 
                            max-width: 400px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="margin-bottom: 15px; color: #ff6b6b;">⚠️ Sesión por expirar</h3>
                    <p style="margin-bottom: 20px;">Tu sesión expirará en 5 minutos por inactividad. 
                       ¿Deseas continuar trabajando?</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="continue-session" style="padding: 10px 20px; background: #4CAF50; 
                                color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Continuar trabajando
                        </button>
                        <button id="end-session" style="padding: 10px 20px; background: #f44336; 
                                color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(warningModal);
        
        // Agregar eventos a los botones
        document.getElementById('continue-session').addEventListener('click', async () => {
            try {
                // Renovar token
                const response = await fetch('/api/renovar-token', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    warningModal.remove();
                    sessionWarningShown = false;
                    
                    // Reiniciar el temporizador de advertencia
                    setupSessionWarning();
                    
                    // Mostrar mensaje de confirmación
                    showNotification('Sesión renovada exitosamente', 'success');
                } else {
                    throw new Error('No se pudo renovar la sesión');
                }
            } catch (error) {
                console.error('Error renovando sesión:', error);
                window.location.replace('/index.html?expired=true');
            }
        });
        
        document.getElementById('end-session').addEventListener('click', () => {
            warningModal.remove();
            document.querySelector('.cerrar-sesion')?.click();
        });
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Detectar actividad del usuario para renovar token automáticamente
let lastActivity = Date.now();
let activityCheckInterval;

function resetActivityTimer() {
    lastActivity = Date.now();
}

// Eventos que indican actividad del usuario
['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, true);
});

// Verificar actividad cada minuto
activityCheckInterval = setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    const twentyMinutes = 20 * 60 * 1000;
    
    // Si ha habido actividad en los últimos 20 minutos, renovar token
    if (timeSinceLastActivity < twentyMinutes && !sessionWarningShown) {
        fetch('/api/renovar-token', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                console.log('Token renovado automáticamente por actividad');
                // Reiniciar temporizador de advertencia
                sessionWarningShown = false;
                setupSessionWarning();
            }
        }).catch(error => {
            console.error('Error renovando token:', error);
        });
    }
}, 60 * 1000); // Cada minuto

// Limpiar intervalos cuando se cierra la página
window.addEventListener('beforeunload', function() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    if (activityCheckInterval) {
        clearInterval(activityCheckInterval);
    }
    
    // Enviar señal de desconexión si el navegador lo permite
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/logout', JSON.stringify({}));
    }
});

// Manejar errores de red globalmente
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('401') || event.reason.message.includes('Token'))) {
        console.log('Token expirado detectado');
        window.location.replace('/index.html?expired=true');
    }
});

// Interceptar todas las peticiones fetch para manejar 401
const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args)
        .then(response => {
            if (response.status === 401 && !window.location.pathname.includes('index.html')) {
                // Token expirado
                window.location.replace('/index.html?expired=true');
            }
            return response;
        })
        .catch(error => {
            throw error;
        });
};