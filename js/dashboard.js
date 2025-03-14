// Función asíncrona para cargar los usuarios conectados desde un servidor
async function cargarUsuariosConectados(){
    // Selecciona el contenedor donde se mostrarán los usuarios conectados
    const usersSection = document.querySelector('.connected-users');
    console.log('Contenedor encontrado:', usersSection);

    try{
        // Realiza una petición a la API para obtener los usuarios conectados
        const response = await fetch('http://localhost:5501/usuarios-conectados');
        console.log('Respuesta de la API:', response);
        // Covierte la respuesta en formato JSON
        const usuarios = await response.json();
        console.log('Usuarios recibidos:', usuarios);

        // Limpia el contenido previo del contenedor de usuarios
        usersSection.innerHTML = '';

        // Verifica si no hay usuarios conectados
        if(usuarios.length === 0){
            console.log('No hay usuarios en línea.');
            usersSection.innerHTML = '<p>No hay ningún usuario en línea.</p>';
            return; // Sale de la función si no hay usuarios
        }

        // Repite cada usuario recibido de la API
        usuarios.forEach(usuario => {
            console.log('Procesando usuario:', usuario);
            // Crea un elemento div para representar la tarjeta del usuario
            const userCard = document.createElement('div');
            userCard.classList.add('user-card'); // Agrega una clase CSS para estilos

            // Define el contenido HTML de la tarjeta del usuario
            userCard.innerHTML = `
                <div class="user-info">
                    <strong>${usuario.Nombre} ${usuario.Apellido}</strong>
                    <span>${usuario.Rol}</span>
                </div>
                <div class="user-status">
                    <div class="status-dot" title="${new Date(usuario.FechaConexion).toLocaleString()}"></div>
                </div>
            `;

            // Agrega la tarjeta del usuario al contenedor de usuarios
            usersSection.appendChild(userCard);
        });
    }catch(err){
        // Captura errores en la solicitud o procesamiento de datos
        console.error('Error cargando usuarios conectados:', err);
        usersSection.innerHTML = '<p>Error cargando los usuarios en línea.</p>';
    }
}

// Ejecuta la función cuando el DOM ha terminado de cargarse
document.addEventListener('DOMContentLoaded', cargarUsuariosConectados);