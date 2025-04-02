document.addEventListener("DOMContentLoaded", () => {
    const tipoCat1 = document.querySelector('.tipoCat1');
    const tipoCat2 = document.querySelector('.tipoCat2');
    const tipoBachillerato = document.querySelector('.tipoBachillerato');
    const tipoTercerCiclo = document.querySelector('.tipoTercerCiclo');

    // Resaltar la sección activa al cargar la página
    if (window.location.pathname.includes('students.html')) {
        tipoCat2.classList.add('active');
        tipoCat1.classList.remove('active');
    } else {
        tipoCat1.classList.add('active');
        tipoCat2.classList.remove('active');
    }

    // Agregar evento de clic para tipoCat1
    tipoCat1.addEventListener('click', () => {
        tipoCat1.classList.add('active');
        tipoCat2.classList.remove('active');
        location.href = '/users.html'; // Navegar a usuarios
    });

    // Agregar evento de clic para tipoCat2
    tipoCat2.addEventListener('click', () => {
        tipoCat2.classList.add('active');
        tipoCat1.classList.remove('active');
        location.href = '/students.html'; // Navegar a estudiantes
    });

    // Agregar evento de clic para Bachillerato
    tipoBachillerato.addEventListener('click', () => {
        tipoBachillerato.classList.add('active');
        tipoTercerCiclo.classList.remove('active');
        location.href = '/bachillerato.html'; // Navegar a bachillerato
    });

    // Agregar evento de clic para Tercer ciclo
    tipoTercerCiclo.addEventListener('click', () => {
        tipoTercerCiclo.classList.add('active');
        tipoBachillerato.classList.remove('active');
        location.href = '/tercerCiclo.html'; // Navegar a tercer ciclo
    });
});

