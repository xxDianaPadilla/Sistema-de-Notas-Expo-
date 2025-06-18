// Obtener el id de la rubrica desde la URL
const urlParams = new URLSearchParams(window.location.search);
const idRubrica = parseInt(urlParams.get('id'));
if (!idRubrica) {
    alert("No se encontró el id de la rúbrica.");
}

// Función para crear la tabla con inputs
function generarTabla() {
    const filas = parseInt(document.getElementById('filas').value) || 1;
    const columnas = parseInt(document.getElementById('columnas').value) || 7;

    const tablaContenedor = document.getElementById('tablaContenedor');
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';

    const encabezado = tabla.createTHead();
    const filaEncabezado = encabezado.insertRow(0);

    const encabezados = [
        "N°",
        "Criterio",
        "Excelente<br>(10)",
        "Muy bueno<br>(8)",
        "Bueno<br>(5)",
        "Regular<br>(3)",
        "Total"
    ];
    encabezados.forEach((texto) => {
        const th = document.createElement('th');
        th.innerHTML = texto;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'center';
        filaEncabezado.appendChild(th);
    });

    const cuerpo = tabla.createTBody();
    for (let i = 0; i < filas; i++) {
        const fila = cuerpo.insertRow();
        for (let j = 0; j < columnas; j++) {
            const celda = fila.insertCell();
            if (j === 0) {
                celda.textContent = i + 1;
                celda.style.textAlign = 'center';
            } else if (j === 1) {
                const inputCriterio = document.createElement('input');
                inputCriterio.type = 'text';
                inputCriterio.style.width = '100%';
                inputCriterio.style.padding = '5px';
                inputCriterio.style.boxSizing = 'border-box';
                inputCriterio.style.resize = 'none';
                inputCriterio.style.overflowWrap = 'break-word';
                inputCriterio.style.whiteSpace = 'pre-wrap';
                inputCriterio.style.fontFamily = 'Poppins, sans-serif';
                inputCriterio.addEventListener('input', function () {
                    this.style.height = 'auto';
                    this.style.height = this.scrollHeight + 'px';
                });

                inputCriterio.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // evitar salto de línea
                        guardarFila(fila, i);
                    }
                });

                celda.appendChild(inputCriterio);
            } else {
                const inputNota = document.createElement('input');
                inputNota.type = 'number';
                inputNota.min = '0';
                inputNota.max = '10';
                inputNota.readOnly = true;
                inputNota.style.width = '100%';
                inputNota.style.padding = '5px';
                celda.appendChild(inputNota);
            }
        }
    }

    tablaContenedor.innerHTML = '';
    tablaContenedor.appendChild(tabla);
}

// Función para guardar una fila en la base de datos
async function guardarFila(fila, indiceFila) {
    if (!idRubrica) {
        alert("No se ha definido el id de la rúbrica.");
        return;
    }

    const celdas = fila.cells;

    // Obtener valor del criterio (columna 1)
    const inputCriterio = celdas[1].querySelector('input');
    const nombreCriterio = inputCriterio.value.trim();
    if (!nombreCriterio) {
        alert(`El criterio en la fila ${indiceFila + 1} está vacío.`);
        return;
    }

    // Para ejemplo, puntaje fijo, puedes modificar para obtener valores reales
    const puntajeCriterio = 0;
    const ponderacionCriterio = 0;

    // Preparar datos para enviar
    const data = {
        id_Rubrica: idRubrica,
        nombre_Criterio: nombreCriterio,
        descripcion_Criterio: "", // Puedes agregar otro input para descripción
        puntaje_Criterio: puntajeCriterio,
        ponderacion_Criterio: ponderacionCriterio
    };

    try {
        const response = await fetch("http://localhost:5501/api/criterios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert(`Criterio de la fila ${indiceFila + 1} guardado correctamente.`);
        } else {
            const errorData = await response.json();
            alert(`Error al guardar: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error("Error al guardar criterio:", error);
        alert("Error al guardar criterio, revisa la consola.");
    }
}

// Eventos para generar tabla
document.getElementById('filas').addEventListener('input', generarTabla);
document.getElementById('columnas').addEventListener('input', generarTabla);

// Crear tabla inicial al cargar la página
window.onload = generarTabla;