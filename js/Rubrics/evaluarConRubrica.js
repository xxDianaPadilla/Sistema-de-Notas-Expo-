// Variables globales para los datos de evaluación
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
            console.error('No se encontraron datos de evaluación');
            mostrarError('No se encontraron datos de evaluación. Por favor, regresa e inicia el proceso nuevamente.');
            return;
        }

        datosEvaluacion = JSON.parse(datosGuardados);
        console.log('Datos de evaluación cargados:', datosEvaluacion);

        if (!datosEvaluacion.idEvaluacion || !datosEvaluacion.rubrica || !datosEvaluacion.proyecto) {
            console.error('Datos de evaluación incompletos:', datosEvaluacion);
            mostrarError('Los datos de evaluación están incompletos.');
            return;
        }

        cargarCriteriosRubrica();
        mostrarInformacionEvaluacion();

    } catch (error) {
        console.error('Error al cargar datos de evaluación:', error);
        mostrarError('Error al procesar los datos de evaluación: ' + error.message);
    }
}

// Función para cargar criterios de la rúbrica
async function cargarCriteriosRubrica() {
    try {
        const idRubrica = datosEvaluacion.rubrica.idRubrica;
        console.log(`Cargando criterios para rúbrica ID: ${idRubrica}`);

        if (datosEvaluacion.criterios && datosEvaluacion.criterios.length > 0) {
            criteriosRubrica = datosEvaluacion.criterios;
            console.log('Criterios cargados desde localStorage:', criteriosRubrica);
            generarTablaEvaluacion();
            return;
        }

        const response = await fetch(`http://localhost:5501/api/criterios/rubrica/${idRubrica}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        criteriosRubrica = await response.json();
        console.log('Criterios cargados desde servidor:', criteriosRubrica);

        if (criteriosRubrica.length === 0) {
            mostrarError('Esta rúbrica no tiene criterios definidos. No se puede realizar la evaluación.');
            return;
        }

        datosEvaluacion.criterios = criteriosRubrica;
        localStorage.setItem('datosEvaluacion', JSON.stringify(datosEvaluacion));

        generarTablaEvaluacion();

    } catch (error) {
        console.error('Error al cargar criterios de la rúbrica:', error);
        mostrarError('Error al cargar los criterios: ' + error.message);
    }
}

// Función para mostrar información del proyecto y rúbrica
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

function generarTablaEvaluacion() {
    const tablaContenedor = document.getElementById('tablaContenedor');
    if (!tablaContenedor) return;

    // Crear tabla
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    tabla.style.marginTop = '20px';

    // Encabezado
    const encabezado = tabla.createTHead();
    const filaEncabezado = encabezado.insertRow(0);

    const encabezados = ['N°', 'Criterio', 'Puntaje Max', 'Puntaje Obtenido'];
    const anchos = ['8%', '45%', '10%', '10%'];

    encabezados.forEach((texto, index) => {
        const th = document.createElement('th');
        th.textContent = texto;
        th.style.border = '1px solid #ddd';
        th.style.padding = '12px';
        th.style.textAlign = 'center';
        th.style.backgroundColor = '#f8f9fa';
        th.style.fontWeight = 'bold';
        th.style.width = anchos[index];
        filaEncabezado.appendChild(th);
    });

    // Cuerpo
    const cuerpo = tabla.createTBody();

    criteriosRubrica.forEach((criterio, index) => {
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
        celdaCriterio.innerHTML = `<strong>${criterio.nombre_Criterio}</strong>`;
        celdaCriterio.style.border = '1px solid #ddd';
        celdaCriterio.style.padding = '10px';

        // Puntaje Máx
        const celdaPuntajeMax = fila.insertCell();
        celdaPuntajeMax.textContent = criterio.puntaje_Criterio || '10';
        celdaPuntajeMax.style.border = '1px solid #ddd';
        celdaPuntajeMax.style.padding = '10px';
        celdaPuntajeMax.style.textAlign = 'center';
        celdaPuntajeMax.style.fontWeight = 'bold';
        celdaPuntajeMax.style.color = '#28a745';

        // Puntaje Obtenido
        const celdaPuntaje = fila.insertCell();
        const inputPuntaje = document.createElement('input');
        inputPuntaje.type = 'number';
        inputPuntaje.id = `puntaje_${criterio.id_Criterio}`;
        inputPuntaje.min = '0';
        inputPuntaje.max = '10'; // Limite máximo 10
        inputPuntaje.step = '0.1';
        inputPuntaje.style.width = '100%';
        inputPuntaje.style.padding = '8px';
        inputPuntaje.style.border = '1px solid #ccc';
        inputPuntaje.style.borderRadius = '4px';
        inputPuntaje.style.textAlign = 'center';
        inputPuntaje.required = true;

        // Limitar automáticamente al máximo 10
        inputPuntaje.addEventListener('input', () => {
            let val = parseFloat(inputPuntaje.value);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 10) val = 10;
            inputPuntaje.value = val;
            mostrarTotal(); // actualizar total automáticamente
        });

        celdaPuntaje.appendChild(inputPuntaje);
        celdaPuntaje.style.border = '1px solid #ddd';
        celdaPuntaje.style.padding = '10px';

        // Actualizar total automáticamente
        inputPuntaje.addEventListener('input', mostrarTotal);

        celdaPuntaje.appendChild(inputPuntaje);
        celdaPuntaje.style.border = '1px solid #ddd';
        celdaPuntaje.style.padding = '10px';
    });

    // Limpiar y agregar tabla
    tablaContenedor.innerHTML = '';
    tablaContenedor.appendChild(tabla);

    // Contenedor de botones
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

    tablaContenedor.parentElement.appendChild(divBotones);

    // Contenedor de puntaje total
    let divTotal = document.createElement('div');
    divTotal.id = 'totalPuntaje';
    divTotal.style.marginTop = '20px';
    divTotal.style.fontWeight = 'bold';
    divTotal.style.padding = '15px';
    divTotal.style.backgroundColor = '#f8f9fa';
    divTotal.style.border = '1px solid #ddd';
    divTotal.style.borderRadius = '5px';
    tablaContenedor.parentElement.appendChild(divTotal);

    document.getElementById('btnGuardarEvaluacion').addEventListener('click', guardarEvaluacion);
    document.getElementById('btnCancelar').addEventListener('click', cancelarEvaluacion);

    // Mostrar total inicial
    mostrarTotal();
}

// Función para mostrar total automáticamente
function mostrarTotal() {
    let total = 0;
    let totalMax = 0;
    let criteriosCompletos = 0;

    criteriosRubrica.forEach(c => {
        const input = document.getElementById(`puntaje_${c.id_Criterio}`);
        const val = parseFloat(input.value) || 0;
        total += val;
        totalMax += parseFloat(c.puntaje_Criterio) || 10;
        if (input.value !== '') criteriosCompletos++;
    });

    const porcentaje = totalMax > 0 ? ((total / totalMax) * 100).toFixed(2) : 0;
    const promedio = criteriosCompletos > 0 ? (total / criteriosCompletos).toFixed(2) : 0;

    const divTotal = document.getElementById('totalPuntaje');
    divTotal.innerHTML = `
        <h4>Resumen de Evaluación</h4>
        <p><strong>Puntaje Total:</strong> ${total.toFixed(2)} / ${totalMax}</p>
        <p><strong>Porcentaje:</strong> ${porcentaje}%</p>
        <p><strong>Promedio por criterio:</strong> ${promedio}</p>
        <p><strong>Criterios evaluados:</strong> ${criteriosCompletos} / ${criteriosRubrica.length}</p>
    `;
}

// Guardar evaluación
async function guardarEvaluacion() {
    try {
        let hayErrores = false;
        const detalles = [];

        criteriosRubrica.forEach(criterio => {
            const inputPuntaje = document.getElementById(`puntaje_${criterio.id_Criterio}`);
            const inputObs = document.getElementById(`obs_${criterio.id_Criterio}`);
            const puntaje = parseFloat(inputPuntaje.value);
            const observaciones = inputObs.value.trim();

            if (isNaN(puntaje) || inputPuntaje.value === '') {
                inputPuntaje.style.border = '2px solid #dc3545';
                hayErrores = true;
            } else {
                inputPuntaje.style.border = '1px solid #28a745';
                detalles.push({
                    idCriterio: criterio.id_Criterio,
                    puntaje: puntaje,
                    observaciones: observaciones
                });
            }
        });

        if (hayErrores) {
            alert('Por favor, complete todos los puntajes antes de guardar la evaluación.');
            return;
        }

        const btnGuardar = document.getElementById('btnGuardarEvaluacion');
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';
        console.log("Detalles:", JSON.stringify(detalles, null, 2));

        // Enviar datos al servidor
        const response = await fetch('http://localhost:5501/api/detalleEvaluacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idEvaluacion: datosEvaluacion.idEvaluacion,
                detalles: detalles
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || response.statusText);
        }

        const result = await response.json();
        alert(`Evaluación guardada exitosamente!\n${result.detallesGuardados} criterios guardados.`);

        localStorage.removeItem('datosEvaluacion');
        //window.location.href = '/evaluation.html';

    } catch (error) {
        alert('Error al guardar la evaluación: ' + error.message);
        const btnGuardar = document.getElementById('btnGuardarEvaluacion');
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Evaluación';
    }
}

// Función para calcular total
function calcularTotal() {
    let total = 0;
    let puntajeMaximo = 0;
    let criteriosCompletos = 0;

    criteriosRubrica.forEach(criterio => {
        const inputPuntaje = document.getElementById(`puntaje_${criterio.id_Criterio}`);
        const puntaje = parseFloat(inputPuntaje.value) || 0;
        const maxCriterio = parseFloat(criterio.puntaje_Criterio) || 10;

        if (inputPuntaje.value !== '') {
            total += puntaje;
            criteriosCompletos++;
        }
        puntajeMaximo += maxCriterio;
    });

    const porcentaje = puntajeMaximo > 0 ? ((total / puntajeMaximo) * 100).toFixed(2) : 0;
    const promedio = criteriosCompletos > 0 ? (total / criteriosCompletos).toFixed(2) : 0;

    const divTotal = document.getElementById('totalPuntaje');
    divTotal.innerHTML = `
    <h4>Resumen de Evaluación</h4>
    <p><strong>Puntaje Total:</strong> ${total.toFixed(2)} / ${puntajeMaximo}</p>
    <p><strong>Porcentaje:</strong> ${porcentaje}%</p>
    <p><strong>Promedio por criterio:</strong> ${promedio}</p>
    <p><strong>Criterios evaluados:</strong> ${criteriosCompletos} / ${criteriosRubrica.length}</p>
  `;
    divTotal.style.display = 'block';
}

// Función para cancelar evaluación
function cancelarEvaluacion() {
    if (confirm('¿Estás seguro de que deseas cancelar la evaluación? Se perderán todos los datos.')) {
        localStorage.removeItem('datosEvaluacion');
        window.location.href = '/evaluation.html';
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const tablaContenedor = document.getElementById('tablaContenedor');
    if (tablaContenedor) {
        tablaContenedor.innerHTML = `
      <div style="
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 20px;
        margin: 20px 0;
        border-radius: 5px;
        text-align: center;
      ">
        <h3>Error</h3>
        <p>${mensaje}</p>
        <button onclick="window.history.back()" style="
          background-color: #6c757d;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        ">Volver</button>
      </div>
    `;
    }
}
