// authMiddleware.js - Middleware para proteger páginas que requieren autenticación

// Este script debe incluirse en TODAS las páginas protegidas ANTES que otros scripts
(async function() {
    // Lista de páginas que NO requieren autenticación
    const paginasPublicas = [
        '/index.html',
        '/index',
        '/',
        '/login',
        '/login.html'
    ];
    
    // Obtener la ruta actual
    const rutaActual = window.location.pathname;
    
    // Verificar si estamos en una página pública
    const esPaginaPublica = paginasPublicas.some(pagina => 
        rutaActual === pagina || rutaActual.endsWith(pagina)
    );
    
    // Si es una página pública, no hacer nada
    if (esPaginaPublica) {
        return;
    }
    
    // Mostrar indicador de carga mientras verificamos
    document.body.style.visibility = 'hidden';
    
    try {
        // Verificar si el usuario está autenticado
        const response = await fetch('/api/verificar-sesion', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            // No está autenticado, redirigir al login
            console.log('Usuario no autenticado, redirigiendo al login...');
            window.location.replace('/index.html?expired=true');
            return;
        }
        
        // Usuario autenticado, mostrar la página
        document.body.style.visibility = 'visible';
        
        // Guardar información del usuario temporalmente
        const userData = await response.json();
        window.__tempUserData = userData.usuario;
        
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        // En caso de error, redirigir al login
        window.location.replace('/index.html');
    }
})();