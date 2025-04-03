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
    });

    // Agregar evento de clic para Tercer ciclo
    tipoTercerCiclo.addEventListener('click', () => {
        tipoTercerCiclo.classList.add('active');
        tipoBachillerato.classList.remove('active');
    });

    const openFormBtn = document.getElementById("newUser2");
    const formContainer = document.getElementById("formContainer");

    // Abrir el formulario para elegir rol
    openFormBtn.addEventListener("click", () => {
        fetch("/formsUsers/formChooseRol.html")
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                formContainer.innerHTML = html; // Cargar el formulario en el contenedor
                initializeRoleSelectionListeners();
            })
            .catch(error => console.error("Error cargando el formulario:", error));
    });

    // Inicializar listeners para los botones de selección de rol
    function initializeRoleSelectionListeners() {
        const btnTercerCiclo = document.getElementById("btnAddTercerCiclo");
        const btnBachillerato = document.getElementById("btnAddBachillerato");
        const closeFormBtn = document.getElementById("closeFormBtn");

        if (closeFormBtn) {
            closeFormBtn.addEventListener("click", closeModal);
        }
        if (btnTercerCiclo) {
            btnTercerCiclo.addEventListener("click", () => openTercerCicloForm());
        }
        if (btnBachillerato) {
            btnBachillerato.addEventListener("click", () => openBachilleratoForm());
        }
    }

    function openTercerCicloForm() {
        loadForm("/formsUsers/formAgregarDatosTercerCi.html", 'tercerCiclo');
    }

    function openBachilleratoForm() {
        loadForm("/formsUsers/formAgregarDatosBachi.html", 'bachillerato');
    }

    function loadForm(formUrl, type) {
        fetch(formUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                formContainer.innerHTML = html; // Cargar el formulario en el contenedor
                loadComboBoxData(type);
            })
            .catch(error => console.error("Error cargando el formulario:", error));
    }

    function loadComboBoxData(type) {
        const idSeccionGrupoTercerCi = document.getElementById("idSeccionGrupoTercerCi");
        const idSeccionGrupoBachi = document.getElementById("idSeccionGrupoBachi");
        const idProyectoTercerCi = document.getElementById("idProyectoTercerCi");
        const idProyectoBachi = document.getElementById("idProyectoBachi");

        // Cargar Secciones/Grupos
        fetch('/api/seccion-grupos')
            .then(response => response.json())
            .then(data => {
                const select = type === 'tercerCiclo' ? idSeccionGrupoTercerCi : idSeccionGrupoBachi;
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.nombre;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error("Error cargando secciones/grupos:", error));

        // Cargar Proyectos
        fetch('/api/proyectos')
            .then(response => response.json())
            .then(data => {
                const select = type === 'tercerCiclo' ? idProyectoTercerCi : idProyectoBachi;
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.nombre_Proyecto;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error("Error cargando proyectos:", error));
    }

    function closeModal() {
        formContainer.innerHTML = ""; // Limpiar el contenido
    }
});