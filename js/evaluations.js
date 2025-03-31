document.addEventListener("DOMContentLoaded", () => {
    const newEvaButton = document.querySelector(".newEva");

    newEvaButton.addEventListener("click", () => {
        // Crear el fondo oscuro
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        // Crear la alerta
        const alertBox = document.createElement("div");
        alertBox.classList.add("alert-box");

        // Título de la alerta
        const message = document.createElement("p");
        message.textContent = "Selecciona el tipo de instrumento";

        // Botón de Rúbrica
        const btnRubrica = document.createElement("button");
        btnRubrica.textContent = "Rúbrica";
        btnRubrica.classList.add("btn-rubrica");
        btnRubrica.addEventListener("click", () => {
            window.location.href = "newRubric.html";
        });

        // Botón de Escala Estimativa
        const btnEscala = document.createElement("button");
        btnEscala.textContent = "Escala estimativa";
        btnEscala.classList.add("btn-escala");
        btnEscala.addEventListener("click", () => {
            window.location.href = "newRubric.html";
        });

        // Botón de cancelar
        const btnCancelar = document.createElement("button");
        btnCancelar.textContent = "Cancelar";
        btnCancelar.classList.add("btn-cancelar");
        btnCancelar.addEventListener("click", () => {
            overlay.remove();
        });

        // Agregar elementos a la alerta
        alertBox.appendChild(message);
        alertBox.appendChild(btnRubrica);
        alertBox.appendChild(btnEscala);
        alertBox.appendChild(btnCancelar);

        // Agregar la alerta y el fondo oscuro al cuerpo
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
    });
});