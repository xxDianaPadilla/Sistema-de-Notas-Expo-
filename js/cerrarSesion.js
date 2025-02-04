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

function togglePassword(){
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');

    if(passwordInput.type == "password"){
        passwordInput.type = "text";
        passwordIcon.src = "/ver_contrasena.png";
    }else{
        passwordInput.type = "password";
        passwordIcon.src = "/no_ver_contrasena.png";
    }
}