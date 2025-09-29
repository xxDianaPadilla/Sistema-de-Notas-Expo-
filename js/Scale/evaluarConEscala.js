// Variables globales
let datosEvaluacion = null;
let criteriosRubrica = [];

// Cargar datos al inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarDatosEvaluacion();
});

// Función principal para cargar los datos de evaluación
function cargarDatosEvaluacion() {
    try {
        const datosGuardados = localStorage.getItem('datosEvaluacion');

        if (!datosGuardados) {
            mostrarError('No se encontraron datos de evaluación. Por favor, regresa e inicia el proceso nuevamente.');
            return;
        }

        datosEvaluacion = JSON.parse(datosGuardados);

        if (!datosEvaluacion.idEvaluacion || !datosEvaluacion.rubrica || !datosEvaluacion.proyecto) {
            mostrarError('Los datos de evaluación están incompletos.');
            return;
        }

        cargarCriteriosRubrica();
        mostrarInformacionEvaluacion();

    } catch (error) {
        mostrarError('Error al procesar los datos de evaluación: ' + error.message);
    }
}

// Cargar criterios desde localStorage o servidor
async function cargarCriteriosRubrica() {
    try {
        const idRubrica = datosEvaluacion.rubrica.idRubrica;

        if (datosEvaluacion.criterios && datosEvaluacion.criterios.length > 0) {
            criteriosRubrica = datosEvaluacion.criterios;
            generarTablaEvaluacion();
            return;
        }

        const response = await fetch(`http://localhost:5501/api/criterios/rubrica/${idRubrica}`);
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        criteriosRubrica = await response.json();
        if (!criteriosRubrica.length) {
            mostrarError('Esta rúbrica no tiene criterios definidos.');
            return;
        }

        datosEvaluacion.criterios = criteriosRubrica;
        localStorage.setItem('datosEvaluacion', JSON.stringify(datosEvaluacion));

        generarTablaEvaluacion();

    } catch (error) {
        mostrarError('Error al cargar los criterios: ' + error.message);
    }
}

// Mostrar información del proyecto y rúbrica
function mostrarInformacionEvaluacion() {
    const titulo = document.querySelector('.newTable h1');
    if (titulo) {
        titulo.innerHTML = `
            Evaluar Proyecto: <strong style="color: #007bff;">${datosEvaluacion.proyecto.nombre_Proyecto}</strong>
            <br>
            <small style="font-size: 0.6em; font-weight: normal; color: #666;">
                Rúbrica: ${datosEvaluacion.rubrica.nombre} | 
                Evaluación ID: ${datosEvaluacion.idEvaluacion} | 
                Fecha: ${new Date().toLocaleDateString()}
            </small>
        `;
    }
}

// Generar tabla de evaluación con columna de Ponderación
function generarTablaEvaluacion() {
    const contenedor = document.getElementById('tablaContenedor');
    if (!contenedor) return;

    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    tabla.style.marginTop = '20px';

    // Encabezado
    const encabezado = tabla.createTHead();
    const filaEncabezado = encabezado.insertRow();
    const encabezados = ['N°', 'Criterio', 'Ponderación', 'Puntaje Obtenido'];

    encabezados.forEach(txt => {
        const th = document.createElement('th');
        th.textContent = txt;
        th.style.border = '1px solid #ddd';
        th.style.padding = '12px';
        th.style.textAlign = 'center';
        th.style.backgroundColor = '#f8f9fa';
        th.style.fontWeight = 'bold';
        filaEncabezado.appendChild(th);
    });

    // Cuerpo
    const cuerpo = tabla.createTBody();
    criteriosRubrica.forEach((c, index) => {
        const fila = cuerpo.insertRow();

        // N°
        const celdaNum = fila.insertCell();
        celdaNum.textContent = index + 1;
        celdaNum.style.border = '1px solid #ddd';
        celdaNum.style.padding = '10px';
        celdaNum.style.textAlign = 'center';
        celdaNum.style.fontWeight = 'bold';

        // Criterio
        const celdaCriterio = fila.insertCell();
        celdaCriterio.innerHTML = `<strong>${c.nombre_Criterio}</strong>`;
        celdaCriterio.style.border = '1px solid #ddd';
        celdaCriterio.style.padding = '10px';

        // Ponderación
        const celdaPonderacion = fila.insertCell();
        celdaPonderacion.textContent = c.ponderacion_Criterio || 1;
        celdaPonderacion.style.border = '1px solid #ddd';
        celdaPonderacion.style.padding = '10px';
        celdaPonderacion.style.textAlign = 'center';
        celdaPonderacion.style.fontWeight = 'bold';
        celdaPonderacion.style.color = '#28a745';

        // Puntaje Obtenido
        const celdaPuntaje = fila.insertCell();
        const inputPuntaje = document.createElement('input');
        inputPuntaje.type = 'number';
        inputPuntaje.id = `puntaje_${c.id_Criterio}`;
        inputPuntaje.min = 0;
        inputPuntaje.max = c.ponderacion_Criterio || 1;
        inputPuntaje.step = 0.1;
        inputPuntaje.style.width = '100%';
        inputPuntaje.style.padding = '8px';
        inputPuntaje.style.border = '1px solid #ccc';
        inputPuntaje.style.borderRadius = '4px';
        inputPuntaje.style.textAlign = 'center';
        inputPuntaje.required = true;

        // Recalcular total al cambiar cualquier puntaje
        inputPuntaje.addEventListener('input', () => {
            let val = parseFloat(inputPuntaje.value);
            const max = parseFloat(inputPuntaje.max);
            if (isNaN(val) || val < 0) val = 0;
            if (val > max) val = max;
            inputPuntaje.value = val;
            mostrarTotal(); // actualizar total automáticamente
        });

        celdaPuntaje.appendChild(inputPuntaje);
        celdaPuntaje.style.border = '1px solid #ddd';
        celdaPuntaje.style.padding = '10px';
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(tabla);

    // --- Botones ---
    const divBotones = document.createElement('div');
    divBotones.style.marginTop = '20px';
    divBotones.style.display = 'flex';
    divBotones.style.gap = '15px';

    divBotones.innerHTML = `
        <button id="btnGuardarEvaluacion" style="
            background-color: #28a745;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        ">Guardar Evaluación</button>
        <button id="btnCancelar" style="
            background-color: #6c757d;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        ">Cancelar</button>
    `;

    contenedor.parentElement.appendChild(divBotones);

    // --- Contenedor de puntaje total ---
    let divTotal = document.createElement('div');
    divTotal.id = 'totalPuntaje';
    divTotal.style.marginTop = '20px';
    divTotal.style.fontWeight = 'bold';
    divTotal.style.padding = '15px';
    divTotal.style.backgroundColor = '#f8f9fa';
    divTotal.style.border = '1px solid #ddd';
    divTotal.style.borderRadius = '5px';
    contenedor.parentElement.appendChild(divTotal);

    document.getElementById('btnGuardarEvaluacion').addEventListener('click', guardarEvaluacion);
    document.getElementById('btnCancelar').addEventListener('click', cancelarEvaluacion);

    // Mostrar total inicial
    mostrarTotal();
}

// Mostrar puntaje total debajo de la tabla
function mostrarTotal() {
    let total = 0;
    let totalMax = 0;

    criteriosRubrica.forEach(c => {
        const input = document.getElementById(`puntaje_${c.id_Criterio}`);
        const val = parseFloat(input.value) || 0;
        total += val;
        totalMax += parseFloat(c.ponderacion_Criterio) || 1;
    });

    const porcentaje = totalMax > 0 ? ((total / totalMax) * 100).toFixed(2) : 0;

    const divTotal = document.getElementById('totalPuntaje');
    divTotal.innerHTML = `Puntaje total: ${total} / ${totalMax} (${porcentaje}%)`;
}

// Guardar evaluación
async function guardarEvaluacion() {
    try {
        let hayErrores = false;
        const detalles = [];

        criteriosRubrica.forEach(c => {
            const input = document.getElementById(`puntaje_${c.id_Criterio}`);
            const puntaje = parseFloat(input.value);

            if (isNaN(puntaje) || input.value === '') {
                input.style.border = '2px solid #dc3545';
                hayErrores = true;
            } else {
                input.style.border = '1px solid #28a745';
                detalles.push({ idCriterio: c.id_Criterio, puntaje });
            }
        });

        if (hayErrores) {
            alert('Complete todos los puntajes antes de guardar la evaluación.');
            return;
        }

        const btnGuardar = document.getElementById('btnGuardarEvaluacion');
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';

        const response = await fetch('http://localhost:5501/api/detalleEvaluacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idEvaluacion: datosEvaluacion.idEvaluacion, detalles })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Error al guardar evaluación');

        alert('Evaluación guardada exitosamente');
        localStorage.removeItem('datosEvaluacion');

    } catch (error) {
        alert('Error al guardar la evaluación: ' + error.message);
        const btnGuardar = document.getElementById('btnGuardarEvaluacion');
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Evaluación';
    }
}

// Cancelar evaluación
function cancelarEvaluacion() {
    if (confirm('¿Seguro que desea cancelar la evaluación? Se perderán todos los datos.')) {
        localStorage.removeItem('datosEvaluacion');
        window.history.back();
    }
}

// Mostrar error
function mostrarError(mensaje) {
    const contenedor = document.getElementById('tablaContenedor');
    if (contenedor) {
        contenedor.innerHTML = `<p style="color: red; font-weight: bold;">${mensaje}</p>`;
    }
}
