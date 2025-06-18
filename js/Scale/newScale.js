// Obtener el id de la rubrica desde la URL
const urlParams = new URLSearchParams(window.location.search);
const idRubrica = parseInt(urlParams.get('id'));
if (!idRubrica) {
    alert("No se encontró el id de la rúbrica.");
}

// Función para guardar el criterio en la base de datos
function guardarCriterio(nombre, descripcion, ponderacion, puntaje, elementosFila) {
    fetch('/api/criterios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_Rubrica: idRubrica,
            nombre_Criterio: nombre.trim(),
            descripcion_Criterio: descripcion.trim(),
            puntaje_Criterio: parseFloat(puntaje),
            ponderacion_Criterio: parseFloat(ponderacion)
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message?.includes("exitosamente")) {
            alert('Criterio guardado correctamente.');

            // Deshabilitar los campos
            elementosFila.txtCriterio.readOnly = true;
            elementosFila.txtDescripcion.readOnly = true;
            elementosFila.inputPonderacion.disabled = true;
            elementosFila.inputPuntaje.disabled = true;
        } else {
            alert('Error al guardar criterio: ' + (data.message || 'Respuesta inesperada'));
        }
    })
    .catch(err => {
        console.error('Error en la solicitud:', err);
        alert('Error al conectar con el servidor');
    });
}

// Función principal para generar la tabla
function generarTabla() {
    const filas = parseInt(document.getElementById('filas').value) || 1;
    const tablaContenedor = document.getElementById('tablaContenedor');
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';

    const colgroup = document.createElement('colgroup');
    ["5%", "20%", "45%", "15%", "15%"].forEach(width => {
        const col = document.createElement('col');
        col.style.width = width;
        colgroup.appendChild(col);
    });
    tabla.appendChild(colgroup);

    const encabezado = tabla.createTHead();
    const filaEncabezado = encabezado.insertRow(0);
    const encabezados = ["N°", "Criterio", "Descripción", "Ponderación", "Puntaje"];
    encabezados.forEach(texto => {
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

        // Número
        const celdaNumero = fila.insertCell();
        celdaNumero.textContent = i + 1;
        celdaNumero.style.textAlign = 'center';
        celdaNumero.style.border = '1px solid #ddd';
        celdaNumero.style.padding = '8px';

        // Criterio
        const celdaCriterio = fila.insertCell();
        const txtCriterio = document.createElement('textarea');
        Object.assign(txtCriterio.style, {
            width: '100%',
            padding: '5px',
            boxSizing: 'border-box',
            resize: 'none',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Poppins, sans-serif'
        });
        txtCriterio.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        celdaCriterio.appendChild(txtCriterio);
        celdaCriterio.style.border = '1px solid #ddd';
        celdaCriterio.style.padding = '8px';

        // Descripción
        const celdaDescripcion = fila.insertCell();
        const txtDescripcion = document.createElement('textarea');
        Object.assign(txtDescripcion.style, {
            width: '100%',
            padding: '5px',
            boxSizing: 'border-box',
            resize: 'none',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Poppins, sans-serif'
        });
        txtDescripcion.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        celdaDescripcion.appendChild(txtDescripcion);
        celdaDescripcion.style.border = '1px solid #ddd';
        celdaDescripcion.style.padding = '8px';

        // Ponderación
        const celdaPonderacion = fila.insertCell();
        const inputPonderacion = document.createElement('input');
        inputPonderacion.type = 'number';
        inputPonderacion.min = '0';
        inputPonderacion.max = '100';
        inputPonderacion.style.width = '100%';
        inputPonderacion.style.padding = '5px';
        celdaPonderacion.appendChild(inputPonderacion);
        celdaPonderacion.style.border = '1px solid #ddd';
        celdaPonderacion.style.padding = '8px';

        // Puntaje
        const celdaPuntaje = fila.insertCell();
        const inputPuntaje = document.createElement('input');
        inputPuntaje.type = 'number';
        inputPuntaje.min = '0';
        inputPuntaje.max = '10';
        inputPuntaje.readOnly = true;
        inputPuntaje.style.width = '100%';
        inputPuntaje.style.padding = '5px';
        celdaPuntaje.appendChild(inputPuntaje);
        celdaPuntaje.style.border = '1px solid #ddd';
        celdaPuntaje.style.padding = '8px';

        // Eventos de navegación por enter
        txtCriterio.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                txtDescripcion.focus();
            }
        });

        txtDescripcion.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputPonderacion.focus();
            }
        });

        inputPonderacion.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                guardarCriterio(
                    txtCriterio.value,
                    txtDescripcion.value,
                    inputPonderacion.value,
                    inputPuntaje.value || 0,
                    {
                        txtCriterio,
                        txtDescripcion,
                        inputPonderacion,
                        inputPuntaje
                    }
                );
            }
        });
    }

    tablaContenedor.innerHTML = '';
    tablaContenedor.appendChild(tabla);
}

// Escuchar cambios en input de filas
document.getElementById('filas').addEventListener('input', generarTabla);

// Generar tabla al cargar la página
window.onload = generarTabla;