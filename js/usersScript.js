// Obtener elementos del DOM
const openFormBtn = document.getElementById("newUser");
const modalContainer = document.getElementById("modalContainer");

// Abrir el formulario para elegir rol
openFormBtn.addEventListener("click", () => {
    // Cargar el archivo HTML del formulario para elegir rol
    fetch("../pages/formsUsers/formChooseRol.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then((html) => {
            modalContainer.innerHTML = html;
            modalContainer.style.width = "100%";
            modalContainer.style.height = "100%";
            modalContainer.classList.remove("hidden");

            // Inicializar listeners para los botones dentro del formulario
            initializeRoleSelectionListeners();
        })
        .catch((error) => console.error("Error cargando el formulario:", error));
});

// Inicializar listeners para los botones de selección de rol
function initializeRoleSelectionListeners() {
    const btnAdmin = document.getElementById("btnAddAdmin");
    const btnEstud = document.getElementById("btnAddEstud");
    const btnDocen = document.getElementById("btnAddDocen");
    const btnEvalu = document.getElementById("btnAddEvalu");
    const closeFormBtn = document.getElementById("closeFormBtn");

    // Listener para el botón de cerrar
    if (closeFormBtn) {
        closeFormBtn.addEventListener("click", () => {
            closeModal();
        });
    }

    // Listener para cada botón de rol
    if (btnAdmin) {
        btnAdmin.addEventListener("click", () => {
            loadForm("../pages/formsUsers/formAddUser.html");
        });
    }
    if (btnEstud) {
        btnEstud.addEventListener("click", () => {
            loadForm("../pages/formsUsers/formAddEstud.html");
        });
    }
    if (btnDocen) {
        btnDocen.addEventListener("click", () => {
            loadForm("../pages/formsUsers/formAddDocen.html");
        });
    }
    if (btnEvalu) {
        btnEvalu.addEventListener("click", () => {
            loadForm("../pages/formsUsers/formAddEvalu.html");
        });
    }
}

// Función para cargar el formulario de un rol específico
function loadForm(formUrl) {
    fetch(formUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then((html) => {
            modalContainer.innerHTML = html;

            // Mantener el tamaño del modal (ya abierto)
            modalContainer.style.width = "100%";
            modalContainer.style.height = "100%";

            // Reasignar funcionalidad al botón de cerrar
            initializeCloseButton();
        })
        .catch((error) => console.error("Error cargando el formulario:", error));
}

// Función para cerrar el modal
function closeModal() {
    modalContainer.style.width = "0%";
    modalContainer.style.height = "0%";
    modalContainer.classList.add("hidden");
    setTimeout(() => {
        modalContainer.innerHTML = ""; // Limpiar contenido después de cerrar
    }, 500); // Coincidir con la duración de la transición
}

// Inicializar botón de cerrar en los formularios cargados dinámicamente
function initializeCloseButton() {
    const closeFormBtn = document.getElementById("closeFormBtn");
    if (closeFormBtn) {
        closeFormBtn.addEventListener("click", () => {
            closeModal();
        });
    }
}
