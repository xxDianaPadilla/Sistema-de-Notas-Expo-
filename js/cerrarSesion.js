/*Script para alerta de cerrar sesión*/
const cerrarSesionBtn = document.querySelector('.cerrar-sesion');
    const customAlert = document.getElementById('alert');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const btnCancelar = document.getElementById('btnCancelar');

    cerrarSesionBtn.addEventListener('click', () => {
        customAlert.style.display = 'flex';
    });

    btnConfirmar.addEventListener('click', () => {
        history.replaceState(null, null, '../index.html');
        //Redirige al login
        window.location.href = '/index';
    });

    btnCancelar.addEventListener('click', () => {
    customAlert.style.display = 'none';
});


