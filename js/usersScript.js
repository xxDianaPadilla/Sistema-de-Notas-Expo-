// Obtener elementos del DOM
const openFormBtn = document.getElementById("newUser");
const modalContainer = document.getElementById("modalContainer");

// Abrir el formulario cargando el archivo HTML externo
openFormBtn.addEventListener("click", () => {
    // Hacer una petición para obtener el contenido del archivo HTML
    fetch("../pages/usersForms.html")
        .then((response) => response.text()) // Convertir la respuesta a texto
        .then((html) => {
            modalContainer.innerHTML = html; // Insertar el contenido en el contenedor
            modalContainer.classList.remove("hidden"); // Mostrar el modal

            // Agregar funcionalidad al botón "Cancelar"
            const closeFormBtn = document.getElementById("closeFormBtn");
            closeFormBtn.addEventListener("click", () => {
                modalContainer.classList.add("hidden");
                modalContainer.innerHTML = ""; // Limpiar el contenido del modal
            });

            // Agregar funcionalidad al botón "Guardar"
            const saveFormBtn = document.getElementById("saveFormBtn");
            saveFormBtn.addEventListener("click", () => {
                alert("Datos guardados correctamente.");
                modalContainer.classList.add("hidden");
                modalContainer.innerHTML = ""; // Limpiar el contenido del modal
            });
        })
        .catch((error) => console.error("Error cargando el formulario:", error));
});
