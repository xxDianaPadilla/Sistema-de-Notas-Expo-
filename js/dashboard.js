async function cargarUsuariosConectados(){
    const usersSection = document.querySelector('.connected-users');
    console.log('Contenedor encontrado:', usersSection);

    try{
        const response = await fetch('http://localhost:5501/usuarios-conectados');
        console.log('Respuesta de la API:', response);
        const usuarios = await response.json();
        console.log('Usuarios recibidos:', usuarios);

        usersSection.innerHTML = '';

        if(usuarios.length === 0){
            console.log('No hay usuarios en línea.');
            usersSection.innerHTML = '<p>No hay ningún usuario en línea.</p>';
            return;
        }

        usuarios.forEach(usuario => {
            console.log('Procesando usuario:', usuario);
            const userCard = document.createElement('div');
            userCard.classList.add('user-card');

            userCard.innerHTML = `
                <div class="user-info">
                    <strong>${usuario.Nombre} ${usuario.Apellido}</strong>
                    <span>${usuario.Rol}</span>
                </div>
                <div class="user-status">
                    <div class="status-dot" title="${new Date(usuario.FechaConexion).toLocaleString()}"></div>
                </div>
            `;

            usersSection.appendChild(userCard);
        });
    }catch(err){
        console.error('Error cargando usuarios conectados:', err);
        usersSection.innerHTML = '<p>Error cargando los usuarios en línea.</p>';
    }
}

document.addEventListener('DOMContentLoaded', cargarUsuariosConectados);