let heartbeatInterval;
let sessionWarningShown = false;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        return;
    }

    setupLogout();
    
    setupHeartbeat();
    
    checkSession();
    
    setupSessionWarning();
});

function setupLogout() {
    const btnCerrarSesion = document.querySelector('.cerrar-sesion');
    const alertDiv = document.getElementById('alert');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const btnCancelar = document.getElementById('btnCancelar');

    if (!btnCerrarSesion) {
        console.log('Botón de cerrar sesión no encontrado en esta página');
        return;
    }

    btnCerrarSesion.addEventListener('click', function(e) {
        e.preventDefault();
        if (alertDiv) {
            alertDiv.style.display = 'flex';
        }
    });

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async function() {
            try {
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

                    if(typeof Storage !== "undefined"){
                        localStorage.clear();
                        sessionStorage.clear();
                    }

                    if(typeof intervalUsuariosConectados !== 'undefined' && intervalUsuariosConectados){
                        clearInterval(intervalUsuariosConectados);
                    }
                    
                    if (heartbeatInterval) {
                        clearInterval(heartbeatInterval);
                    }
                    
                    window.location.replace('/index.html');
                } else if (response.status === 401) {
                    console.log('Sesión ya expirada');
                    window.location.replace('/index.html?expired=true');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al cerrar sesión');
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión: ' + error.message);
                
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = 'Confirmar';
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (alertDiv) {
                alertDiv.style.display = 'none';
            }
        });
    }

    if (alertDiv) {
        alertDiv.addEventListener('click', function(e) {
            if (e.target === alertDiv) {
                alertDiv.style.display = 'none';
            }
        });
    }
}

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
                if (!window.location.pathname.includes('index.html')) {
                    window.location.replace('/index.html?expired=true');
                }
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        if (!window.location.pathname.includes('index.html')) {
            window.location.replace('/index.html');
        }
    }
}

function setupHeartbeat() {
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
                clearInterval(heartbeatInterval);
                window.location.replace('/index.html?expired=true');
            }
        } catch (error) {
            console.error('Error en heartbeat:', error);
        }
    }, 5 * 60 * 1000); 
}

function setupSessionWarning() {
    setTimeout(() => {
        if (!sessionWarningShown) {
            sessionWarningShown = true;
            showSessionWarning();
        }
    }, 25 * 60 * 1000); 
}

function showSessionWarning() {
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
        
        document.getElementById('continue-session').addEventListener('click', async () => {
            try {
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
                    
                    setupSessionWarning();
                    
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
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

let lastActivity = Date.now();
let activityCheckInterval;

function resetActivityTimer() {
    lastActivity = Date.now();
}

['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, true);
});

activityCheckInterval = setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    const twentyMinutes = 20 * 60 * 1000;
    
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
                sessionWarningShown = false;
                setupSessionWarning();
            }
        }).catch(error => {
            console.error('Error renovando token:', error);
        });
    }
}, 60 * 1000); 

window.addEventListener('beforeunload', function() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    if (activityCheckInterval) {
        clearInterval(activityCheckInterval);
    }
    
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/logout', JSON.stringify({}));
    }
});

window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('401') || event.reason.message.includes('Token'))) {
        console.log('Token expirado detectado');
        window.location.replace('/index.html?expired=true');
    }
});

const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args)
        .then(response => {
            if (response.status === 401 && !window.location.pathname.includes('index.html')) {
                window.location.replace('/index.html?expired=true');
            }
            return response;
        })
        .catch(error => {
            throw error;
        });
};