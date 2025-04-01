// Obtener elementos del DOM
const openFormBtn = document.getElementById("newUser");
const modalContainer = document.getElementById("modalContainer");

// Abrir el formulario para elegir rol
openFormBtn.addEventListener("click", () => {
    // Cargar el archivo HTML del formulario para elegir rol
    fetch("/formsUsers/formChooseRol.html")
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
            loadForm("/formsUsers/formAddAdmin.html");
        });
    }
    if (btnEstud) {
        btnEstud.addEventListener("click", () => {
            loadForm("/formsUsers/formAddEstud.html");
        });
    }
    if (btnDocen) {
        btnDocen.addEventListener("click", () => {
            loadForm("/formsUsers/formAddDocente.html");
        });
    }
    if (btnEvalu) {
        btnEvalu.addEventListener("click", () => {
            loadForm("/formsUsers/formAddEvaluador.html");
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
            initializeSaveButtonAdm();
            initializeSaveButtonEst();
            initializeSaveButtonEvaluador();
            initializeSaveButtonDoc();

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

// Seleccionar todos los elementos <p> con la clase "role"
const roles = document.querySelectorAll('.role');

// Agregar un event listener a cada <p>
roles.forEach(role => {
    role.addEventListener('click', () => {
        // Eliminar la clase "active" de todos los elementos
        roles.forEach(r => r.classList.remove('active'));
        
        // Agregar la clase "active" al elemento clicado
        role.classList.add('active');
    });
});

//----------------------------------------------------------------------------INSERT------------------------------------------------------------------------------------------------
//Admin
function initializeSaveButtonAdm() {
    const saveFormBtnAdm = document.getElementById("saveFormBtnAdm");
    if (saveFormBtnAdm) {
        saveFormBtnAdm.addEventListener("click", () => {
            // Capturar datos del formulario
            const nombre = document.getElementById("nombreAdm").value;
            const apellido = document.getElementById("apellidoAdm").value;
            const correo = document.getElementById("correoAdm").value;
            const contraseña = document.getElementById("contraseñaAdm").value;
            const confirmarContraseña = document.getElementById("confirmarContraseñaAdm").value;

            // Validar que las contraseñas coincidan
            if (contraseña !== confirmarContraseña) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            const idRol = 1; // la selección del rol

            // Preparar los datos para enviar
            const datosUsuario = {
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                contraseña: contraseña,
                idRol: idRol
            };

            // Enviar los datos al servidor
            fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert("Usuario guardado con éxito.");
                closeModal(); // Cierra el modal después de guardar
                loadUsuarios();
            })
            .catch(error => console.error("Error al guardar el usuario:", error));
        });
    }
}



// Estudiante
function initializeSaveButtonEst() {
    const saveFormBtnEst = document.getElementById("saveFormBtnEst");
    if (saveFormBtnEst) {
        saveFormBtnEst.addEventListener("click", () => {
            // Capturar datos del formulario
            const nombre = document.getElementById("nombreEst").value;
            const apellido = document.getElementById("apellidoEst").value;
            const correo = document.getElementById("correoEst").value;
            const contraseña = document.getElementById("contraseñaEst").value;
            const confirmarContraseña = document.getElementById("confirmarContraseñaEst").value;

            // Validar que las contraseñas coincidan
            if (contraseña !== confirmarContraseña) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            const idRol = 2; // selección del rol

            // Preparar los datos para enviar
            const datosUsuario = {
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                contraseña: contraseña,
                idRol: idRol
            };

            // Enviar los datos al servidor
            fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert("Usuario guardado con éxito.");
                closeModal(); // Cierra el modal después de guardar
                loadUsuarios();
            })
            .catch(error => console.error("Error al guardar el usuario:", error));
        });
    }
}




// Docente
function initializeSaveButtonDoc() {
    const saveFormBtnDoc = document.getElementById("saveFormBtnDoc");
    if (saveFormBtnDoc) {
        saveFormBtnDoc.addEventListener("click", () => {
            // Capturar datos del formulario
            const nombre = document.getElementById("nombreDoc").value;
            const apellido = document.getElementById("apellidoDoc").value;
            const correo = document.getElementById("correoDoc").value;
            const contraseña = document.getElementById("contraseñaDoc").value;
            const confirmarContraseña = document.getElementById("confirmarContraseñaDoc").value;

            // Validar que las contraseñas coincidan
            if (contraseña !== confirmarContraseña) {
                alert("Las contraseñas no coinciden.");
                return;
            }

         
            const idRol = 3; // selección del rol

            // Preparar los datos para enviar
            const datosUsuario = {
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                contraseña: contraseña,
                idRol: idRol
            };

            // Enviar los datos al servidor
            fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert("Usuario guardado con éxito.");
                closeModal(); // Cierra el modal después de guardar
                loadUsuarios();
            })
            .catch(error => console.error("Error al guardar el usuario:", error));
        });
    }
}


// Evaluador
function initializeSaveButtonEvaluador() {
    const saveFormBtnEvaluador = document.getElementById("saveFormBtnEvaluador");
    if (saveFormBtnEvaluador) {
        saveFormBtnEvaluador.addEventListener("click", () => {
            // Capturar datos del formulario
            const nombre = document.getElementById("nombreEvaluador").value;
            const apellido = document.getElementById("apellidoEvaluador").value;
            const correo = document.getElementById("correoEvaluador").value;
            const contraseña = document.getElementById("contraseñaEvaluador").value;
            const confirmarContraseña = document.getElementById("confirmarContraseñaEvaluador").value;

            // Validar que las contraseñas coincidan
            if (contraseña !== confirmarContraseña) {
                alert("Las contraseñas no coinciden.");
                return;
            }

         
            const idRol = 4; // selección del rol

            // Preparar los datos para enviar
            const datosUsuario = {
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                contraseña: contraseña,
                idRol: idRol
            };

            // Enviar los datos al servidor
            fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert("Usuario guardado con éxito.");
                closeModal(); // Cierra el modal después de guardar
                loadUsuarios();
            })
            .catch(error => console.error("Error al guardar el usuario:", error));
        });
    }
}


//----------------------------------------------------------------------------SELECT------------------------------------------------------------------------------------------------

// Obtener todos los elementos <p> con la clase "role"
const userRoles = document.querySelectorAll('.role');

// Agregar un event listener a cada <p> para filtrar usuarios por rol
userRoles.forEach(role => {
    role.addEventListener('click', () => {
        // Eliminar la clase "active" de todos los elementos
        userRoles.forEach(r => r.classList.remove('active'));
        
        // Agregar la clase "active" al elemento clicado
        role.classList.add('active');

        // Obtener el ID del rol correspondiente
        const idRol = getIdRol(role.textContent);
        loadUsuarios(idRol); // Cargar usuarios del rol seleccionado
    });
});

// Función para mapear nombres de roles a sus IDs
function getIdRol(roleName) {
    switch (roleName.trim()) {
        case 'Administradores':
            return 1;
        case 'Estudiantes':
            return 2;
        case 'Docentes':
            return 3;
        case 'Evaluadores':
            return 4;
        default:
            return null;
    }
}

// Modificar la función para cargar usuarios según el rol
function loadUsuarios(idRol) {
    fetch(`/api/usuarios?rol=${idRol}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((usuarios) => {
            displayUsuarios(usuarios);
        })
        .catch((error) => console.error("Error al cargar usuarios:", error));
}




// Función para mostrar usuarios en tarjetas
function displayUsuarios(usuarios) {
    const cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = ''; // Limpiar contenido previo

    usuarios.forEach(usuario => {
        const listItem = document.createElement("div");
        listItem.classList.add("list-item");
        listItem.innerHTML = `
            <div class="user-info">
                <p class="user-name">${usuario.Nombre_Usuario} ${usuario.Apellido_Usuario}</p>
                <p class="user-email">${usuario.Correo_Usuario}</p>
            </div>
            <div class="button-container">
                <button class="edit-btn" onclick="editUser(${usuario.Id_Usuario})">Editar</button>
                <button class="delete-btn" onclick="deleteUser(${usuario.Id_Usuario})">Eliminar</button>
            </div>
        `;
        cardContainer.appendChild(listItem);
    });
}

//----------------------------------------------------------------------------UPDATE------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------DELETE------------------------------------------------------------------------------------------------
// Función para eliminar usuario
function deleteUser(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            alert("Usuario eliminado con éxito.");
            loadUsuarios(); // Recargar la lista de usuarios
        })
        .catch(error => console.error("Error al eliminar usuario:", error));
    }
}

// Llamar a la función para cargar usuarios al cargar la página
document.addEventListener("DOMContentLoaded", loadUsuarios);

