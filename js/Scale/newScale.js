// Esta función se ejecuta cuando se crea la tabla
function generarTabla() {
    // Obtener los valores de cantidad de filas desde el input
    const filas = parseInt(document.getElementById('filas').value) || 1; // Por defecto, 1 fila
    const tablaContenedor = document.getElementById('tablaContenedor');
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';

    // Crear encabezado
    const encabezado = tabla.createTHead();
    const filaEncabezado = encabezado.insertRow(0);
    const encabezados = ["N°", "Criterio", "Ponderación", "Puntaje"];

    encabezados.forEach(encabezadoTexto => {
        const th = document.createElement('th');
        th.innerHTML = encabezadoTexto;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'center';
        filaEncabezado.appendChild(th);
    });

    // Crear cuerpo de la tabla con las filas correspondientes
    const cuerpo = tabla.createTBody();
    for (let i = 0; i < filas; i++) {
        const fila = cuerpo.insertRow();
        
        // Número de fila
        const celdaNumero = fila.insertCell();
        celdaNumero.textContent = i + 1;
        celdaNumero.style.textAlign = 'center';
        celdaNumero.style.border = '1px solid #ddd';
        celdaNumero.style.padding = '8px';

        // Criterio (Textarea con ajuste automático)
        const celdaCriterio = fila.insertCell();
        const textareaCriterio = document.createElement('textarea');
        textareaCriterio.style.width = '100%';
        textareaCriterio.style.padding = '5px';
        textareaCriterio.style.boxSizing = 'border-box';
        textareaCriterio.style.resize = 'none';
        textareaCriterio.style.overflowWrap = 'break-word';
        textareaCriterio.style.whiteSpace = 'pre-wrap';
        textareaCriterio.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        celdaCriterio.appendChild(textareaCriterio);
        celdaCriterio.style.border = '1px solid #ddd';
        celdaCriterio.style.padding = '8px';
        textareaCriterio.style.fontFamily = 'Poppins, sans-serif';

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
    }

    tablaContenedor.innerHTML = ''; // Limpiar cualquier tabla previa
    tablaContenedor.appendChild(tabla); // Agregar la nueva tabla al contenedor
}

// Llamar a esta función cada vez que cambie la entrada de filas
document.getElementById('filas').addEventListener('input', generarTabla);

// Crear la tabla por defecto al cargar la página
window.onload = generarTabla;
