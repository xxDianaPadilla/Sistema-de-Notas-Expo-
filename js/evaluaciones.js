// Script para crear nueva rúbrica o escala
document.querySelector('.newEva').addEventListener('click', function () {
    const mainElement = document.querySelector('main'); // Selecciona el elemento <main>

    // Añade un overlay oscuro
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '999';

    // Alerta personalizada
    const alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '50%';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translate(-50%, -50%)';
    alertContainer.style.padding = '20px';
    alertContainer.style.backgroundColor = '#fff';
    alertContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    alertContainer.style.borderRadius = '8px';
    alertContainer.style.textAlign = 'center';
    alertContainer.style.zIndex = '1000';
    alertContainer.style.width = '400px';

    // Lo que se muestra en la alerta
    alertContainer.innerHTML = `
        <button id="btnClose" style="
            position: absolute;
            top: 5px;
            right: 10px;
            background: none;
            border: none;
            font-size: 22px;
            font-family: 'Poppins', 'SansSerif';
            font-weight: bold;
            color: #1D1D1B;
            cursor: pointer;">&times;</button>
        <h3>Selecciona la categoría del<br>instrumento de evaluación:</h3>
        <br>
        <div class="alert-buttons">
            <button id="btnEscala" class="btnMas">Escala estimativa</button>
            <button id="btnRubrica" class="btnMas">Rúbrica</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(alertContainer);

    // Botones para redirigir a las respectivas páginas
    document.getElementById('btnEscala').addEventListener('click', function () {
    // Redirigir a la página de Escala estimativa
    window.location.href = '/escala';
    });

    document.getElementById('btnRubrica').addEventListener('click', function () {
        window.location.href = '/newRubric'; 
    });

// Botón para cerrar (X) la alerta
    document.getElementById('btnClose').addEventListener('click', function () {
    document.body.removeChild(alertContainer);
    document.body.removeChild(overlay);
    });
    });

/*// Función para mostrar el formulario según la opción seleccionada
function mostrarFormulario(tipo) {
    // Eliminar la alerta de la pantalla
    const overlay = document.querySelector('div[style*="position: fixed"]');
    const alertContainer = document.querySelector('div[style*="background-color: #fff"]');
    document.body.removeChild(overlay);
    document.body.removeChild(alertContainer);

    // Crear la estructura del formulario
    const formularioContainer = document.createElement('div');
    formularioContainer.style.position = 'fixed';
    formularioContainer.style.top = '50%';
    formularioContainer.style.left = '50%';
    formularioContainer.style.transform = 'translate(-50%, -50%)';
    formularioContainer.style.padding = '20px';
    formularioContainer.style.backgroundColor = '#fff';
    formularioContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    formularioContainer.style.borderRadius = '8px';
    formularioContainer.style.textAlign = 'center';
    formularioContainer.style.zIndex = '1000';
    formularioContainer.style.width = '400px';
    formularioContainer.innerHTML = `
        <button id="btnCloseForm" style="
            position: absolute;
            top: 5px;
            right: 10px;
            background: none;
            border: none;
            font-size: 22px;
            font-family: 'Poppins', 'SansSerif';
            font-weight: bold;
            color: #1D1D1B;
            cursor: pointer;">&times;</button>
        <h3>Formulario para ${tipo}</h3>
        <form id="formEvaluacion">
            <div style="margin-bottom: 15px;">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" required style="padding: 8px; width: 100%; margin-top: 5px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="selectNivel">Nivel:</label>
                <select id="selectNivel" required style="padding: 8px; width: 100%; margin-top: 5px;">
                    <option value="">Cargando niveles...</option>
                </select>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="selectEspecialidad">Especialidad:</label>
                <select id="selectEspecialidad" required style="padding: 8px; width: 100%; margin-top: 5px;">
                    <option value="">Cargando especialidades...</option>
                </select>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="selectEtapa">Etapa:</label>
                <select id="selectEtapa" required style="padding: 8px; width: 100%; margin-top: 5px;">
                    <option value="">Cargando etapas...</option>
                </select>
            </div>
            <button type="submit" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;">Guardar</button>
        </form>
    `;
    document.body.appendChild(formularioContainer);

    // Botón para cerrar el formulario
    document.getElementById('btnCloseForm').addEventListener('click', function () {
        document.body.removeChild(formularioContainer);
    });

    // Cargar los select desde la API
    cargarDatosEnSelect('http://localhost:5501/nivel', 'selectNivel');
    cargarDatosEnSelect('http://localhost:5501/especialidad', 'selectEspecialidad');
    cargarDatosEnSelect('http://localhost:5501/etapa', 'selectEtapa');
}

// Función para cargar datos en los select desde la API
async function cargarDatosEnSelect(url, idSelect) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const select = document.getElementById(idSelect);
        select.innerHTML = "<option value=''>Seleccione una opción</option>"; // Opción por defecto

        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.Id_Nivel || item.Id_Especialidad || item.Id_Etapa;
            option.textContent = item.Nombre_Nivel || item.Nombre_Especialidad || item.Nombre_Etapa;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert("Error al cargar los datos. Intenta nuevamente.");
    }
}

// Función para enviar el formulario al backend
async function enviarFormulario(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value;
    const nivel = document.getElementById("selectNivel").value;
    const especialidad = document.getElementById("selectEspecialidad").value;
    const etapa = document.getElementById("selectEtapa").value;

    // Validar que todos los campos estén llenos
    if (!nombre || !nivel || !especialidad || !etapa) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Datos a enviar
    const datosEvaluacion = {
        nombre,
        nivel,
        especialidad,
        etapa
    };

    try {
        const response = await fetch("http://localhost:5501/guardarEvaluacion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosEvaluacion)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Evaluación guardada con éxito.");
            document.getElementById("formEvaluacion").reset(); // Limpiar formulario
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error al guardar la evaluación:", error);
        alert("Hubo un problema al guardar la evaluación.");
    }
}

// Llamar al evento de envío al formulario
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formEvaluacion")?.addEventListener("submit", enviarFormulario);
});
*/