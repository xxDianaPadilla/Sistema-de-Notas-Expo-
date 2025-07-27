// Obtener el id de la rubrica desde la URL
const urlParams = new URLSearchParams(window.location.search);
const idRubrica = parseInt(urlParams.get("id"));

// VARIABLE GLOBAL para almacenar criterios existentes
let criteriosExistentes = [];

// Mejor manejo del ID
if (!idRubrica || isNaN(idRubrica)) {
  console.log("No hay ID válido, modo creación nueva");
} else {
  console.log("ID de rúbrica encontrado:", idRubrica);
  // Cargar criterios existentes
  cargarCriteriosExistentes();
}

// Cargar criterios existentes de la base de datos
async function cargarCriteriosExistentes() {
  try {
    const response = await fetch(
      `http://localhost:5501/api/criterios/${idRubrica}`
    );

    if (response.ok) {
      criteriosExistentes = await response.json();
      console.log("Criterios cargados:", criteriosExistentes);

      // Ajustar el número de filas basado en los criterios existentes
      if (criteriosExistentes.length > 0) {
        document.getElementById("filas").value = criteriosExistentes.length;
      }

      // Regenerar la tabla con los datos cargados
      generarTabla();
    } else {
      console.log("No se encontraron criterios existentes");
      criteriosExistentes = [];
      // Generar tabla vacía si no hay criterios
      generarTabla();
    }
  } catch (error) {
    console.error("Error al cargar criterios:", error);
    criteriosExistentes = [];
    // Generar tabla vacía en caso de error
    generarTabla();
  }
}

// Crear la tabla con inputs (con auto-llenado)
function generarTabla() {
  // Obtener valores de filas y columnas desde los inputs
  const filas = parseInt(document.getElementById("filas").value) || 1;
  const columnas = parseInt(document.getElementById("columnas").value) || 7;

  const tablaContenedor = document.getElementById("tablaContenedor");
  const tabla = document.createElement("table");
  tabla.style.width = "100%";
  tabla.style.borderCollapse = "collapse";

  // Crear la fila de encabezados
  const encabezado = tabla.createTHead();
  const filaEncabezado = encabezado.insertRow(0);

  const encabezados = [
    "", // columna para botón de eliminar
    "N°", // Número de fila
    "Criterio", // Descripción del criterio
    "Excelente<br>(10)",
    "Muy bueno<br>(8)",
    "Bueno<br>(5)",
    "Regular<br>(3)",
    "Total", // Total del puntaje
  ];

  // Anchos personalizados por columna (en porcentaje o píxeles)
  const anchos = [
    "7%", // Botón eliminar
    "5%", // Número
    "37%", // Criterio
    "10%", // Excelente
    "10%", // Muy bueno
    "10%", // Bueno
    "10%", // Regular
    "12%", // Total
  ];

  encabezados.forEach((texto, index) => {
    const th = document.createElement("th");
    th.innerHTML = texto;
    th.style.border = "1px solid #ddd";
    th.style.padding = "8px";
    th.style.textAlign = "center";
    th.style.width = anchos[index]; // Aplicar ancho personalizado
    filaEncabezado.appendChild(th);
  });

  // Crear cuerpo de la tabla
  const cuerpo = tabla.createTBody();

  for (let i = 0; i < filas; i++) {
    const fila = cuerpo.insertRow();
    const criterioExistente = criteriosExistentes[i] || null;

    for (let j = 0; j < columnas + 1; j++) {
      const celda = fila.insertCell();
      celda.style.border = "1px solid #ddd";
      celda.style.padding = "6px";
      celda.style.verticalAlign = "middle";
      celda.style.textAlign = "center";
      if (anchos[j]) celda.style.width = anchos[j]; // Aplicar ancho a celdas también

      if (j === 0) {
        // Botón para eliminar fila o criterio
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.title = "Eliminar criterio";
        btnEliminar.style.backgroundColor = "#ff4d4d";
        btnEliminar.style.border = "none";
        btnEliminar.style.color = "white";
        btnEliminar.style.padding = "5px 10px";
        btnEliminar.style.cursor = "pointer";
        btnEliminar.style.borderRadius = "5px";
        btnEliminar.style.fontFamily = "Poppins, sans-serif";

        // Evento click para eliminar criterio
        btnEliminar.addEventListener("click", async () => {
          const inputCriterio = fila.cells[2].querySelector("input");
          const criterioId = inputCriterio.dataset.criterioId;

          if (criterioId) {
            const confirmar = confirm("¿Deseas eliminar este criterio?");
            if (!confirmar) return;

            try {
              const response = await fetch(
                `http://localhost:5501/api/criterios/${criterioId}`,
                { method: "DELETE" }
              );
              if (response.ok) {
                alert("Criterio eliminado correctamente.");
                fila.remove();
              } else {
                alert("Error al eliminar criterio.");
              }
            } catch (error) {
              console.error("Error al eliminar:", error);
              alert("Error al intentar eliminar el criterio.");
            }
          } else {
            fila.remove();
          }
        });

        celda.appendChild(btnEliminar);
      } else if (j === 1) {
        // Número de fila
        celda.textContent = i + 1;
      } else if (j === 2) {
        // Input para ingresar el criterio
        const inputCriterio = document.createElement("input");
        inputCriterio.type = "text";
        inputCriterio.style.width = "100%";
        inputCriterio.style.padding = "5px";
        inputCriterio.style.boxSizing = "border-box";
        inputCriterio.style.resize = "none";
        inputCriterio.style.overflowWrap = "break-word";
        inputCriterio.style.whiteSpace = "pre-wrap";
        inputCriterio.style.fontFamily = "Poppins, sans-serif";

        if (criterioExistente) {
          inputCriterio.value = criterioExistente.nombre_Criterio;
          inputCriterio.style.backgroundColor = "#e8f5e8";
          inputCriterio.style.border = "2px solid #4CAF50";
          inputCriterio.dataset.criterioId = criterioExistente.id_Criterio;
          inputCriterio.dataset.esExistente = "true";
        }

        inputCriterio.addEventListener("input", function () {
          this.style.height = "auto";
          this.style.height = this.scrollHeight + "px";
        });

        inputCriterio.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            guardarFila(fila, i);
          }
        });

        celda.appendChild(inputCriterio);
      } else {
        // Inputs para calificaciones
        const inputNota = document.createElement("input");
        inputNota.type = "number";
        inputNota.min = "0";
        inputNota.max = "10";
        inputNota.readOnly = true;
        inputNota.style.width = "100%";
        inputNota.style.padding = "5px";
        inputNota.style.boxSizing = "border-box";

        if (criterioExistente && j === columnas) {
          inputNota.value = criterioExistente.puntaje_Criterio || 0;
          inputNota.style.backgroundColor = "#e8f5e8";
        }

        celda.appendChild(inputNota);
      }
    }
  }

  // Reemplazar tabla anterior
  tablaContenedor.innerHTML = "";
  tablaContenedor.appendChild(tabla);
}

// Guardar fila (con actualización o creación)
async function guardarFila(fila, indiceFila) {
  if (!idRubrica || isNaN(idRubrica)) {
    alert("No se ha definido un ID válido para la rúbrica.");
    return;
  }

  const celdas = fila.cells;

  // Obtener valor del criterio (columna 2)
  const inputCriterio = celdas[2].querySelector("input");
  const nombreCriterio = inputCriterio.value.trim();
  if (!nombreCriterio) {
    alert(`El criterio en la fila ${indiceFila + 1} está vacío.`);
    return;
  }

  // Verificar si es una actualización o creación nueva
  const criterioId = inputCriterio.dataset.criterioId;
  const esActualizacion = criterioId && criterioId !== "undefined";

  // Por defecto, el puntaje es 0
  const puntajeCriterio = 0;
  const ponderacionCriterio = 0;

  // Preparar datos para enviar
  const data = {
    id_Rubrica: idRubrica,
    nombre_Criterio: nombreCriterio,
    descripcion_Criterio: "",
    puntaje_Criterio: puntajeCriterio,
    ponderacion_Criterio: ponderacionCriterio,
  };

  try {
    let response;
    let mensaje;

    if (esActualizacion) {
      // Actualizar criterio existente
      response = await fetch(
        `http://localhost:5501/api/criterios/${criterioId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      mensaje = `Criterio de la fila ${
        indiceFila + 1
      } actualizado correctamente.`;
    } else {
      // Crear nuevo criterio
      response = await fetch("http://localhost:5501/api/criterios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      mensaje = `Criterio de la fila ${indiceFila + 1} guardado correctamente.`;
    }

    if (response.ok) {
      const result = await response.json();
      alert(mensaje);

      // Si era nuevo criterio, guardar el ID retornado y cambiar apariencia
      if (!esActualizacion && result.id_Criterio) {
        inputCriterio.dataset.criterioId = result.id_Criterio;
        inputCriterio.dataset.esExistente = "true";
        inputCriterio.style.backgroundColor = "#e8f5e8";
        inputCriterio.style.border = "2px solid #4CAF50";
      }
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
document.getElementById("filas").addEventListener("input", generarTabla);
document.getElementById("columnas").addEventListener("input", generarTabla);

// Crear tabla inicial al cargar la página
window.onload = function () {
  if (idRubrica && !isNaN(idRubrica)) {
    // Si hay ID válido, la tabla se generará después de cargar los criterios
    console.log("Esperando carga de criterios existentes...");
  } else {
    // Si no hay ID válido, generar tabla vacía inmediatamente
    generarTabla();
  }
};
