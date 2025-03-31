// Esta función se ejecuta cuando se crea la tabla
function generarTabla() {
    // Obtener los valores de cantidad de filas y columnas desde los inputs
    const filas = parseInt(document.getElementById('filas').value) || 1;  // Por defecto, 2 filas
    const columnas = parseInt(document.getElementById('columnas').value) || 2;  // Por defecto, 7 columnas

    const tablaContenedor = document.getElementById('tablaContenedor');
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';

    // Crear encabezado
    const encabezado = tabla.createTHead();
    const filaEncabezado = encabezado.insertRow(0);

    

    // Encabezados predeterminados
    const encabezados = [
        "N°",
        "Criterio",
        "Excelente<br>(10)",
        "Muy bueno<br>(8)",
        "Bueno<br>(5)",
        "Regular<br>(3)",
        "Total"
    ];
    encabezados.forEach((encabezadoTexto, index) => {
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
        for (let j = 0; j < columnas; j++) { // Se definen 7 columnas
            const celda = fila.insertCell();
            if (j === 0) {
                celda.textContent = i + 1; // Número de fila
                celda.style.textAlign = 'center';
            } else if (j === 1) {
                const inputCriterio = document.createElement('input');
                inputCriterio.type = 'text';
                inputCriterio.style.width = '100%';
                inputCriterio.style.padding = '5px';
                inputCriterio.style.width = '100%';
                inputCriterio.style.padding = '5px';
                inputCriterio.style.boxSizing = 'border-box';
                inputCriterio.style.resize = 'none';
                inputCriterio.style.overflowWrap = 'break-word';
                inputCriterio.style.whiteSpace = 'pre-wrap';
                inputCriterio.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        inputCriterio.style.fontFamily = 'Poppins, sans-serif';

                celda.appendChild(inputCriterio);
            } else {
                const inputNota = document.createElement('input');
                inputNota.type = 'number';
                inputNota.min = '0';
                inputNota.max = '10';
                inputNota.readOnly = true; // Hacer solo lectura las celdas de calificación
                inputNota.style.width = '100%';
                inputNota.style.padding = '5px';
                celda.appendChild(inputNota);
            }
        }
    }

    tablaContenedor.innerHTML = ''; // Limpiar cualquier tabla previa
    tablaContenedor.appendChild(tabla); // Agregar la nueva tabla al contenedor
}

// Llamar a esta función cada vez que cambien las entradas de filas y columnas
document.getElementById('filas').addEventListener('input', generarTabla);
document.getElementById('columnas').addEventListener('input', generarTabla);

// Llamamos a la función para crear la tabla por defecto al cargar la página
window.onload = generarTabla;
