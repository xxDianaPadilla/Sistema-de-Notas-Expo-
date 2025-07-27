// Obtener el id de la rubrica desde la URL
const urlParams = new URLSearchParams(window.location.search);
const idRubrica = parseInt(urlParams.get("id"));

let criteriosExistentes = [];

if (!idRubrica || isNaN(idRubrica)) {
  console.log("No hay ID válido, modo creación nueva");
} else {
  console.log("ID de rúbrica encontrado:", idRubrica);
  cargarCriteriosExistentes();
}

async function cargarCriteriosExistentes() {
  try {
    const response = await fetch(`/api/criterios/${idRubrica}`);

    if (response.ok) {
      criteriosExistentes = await response.json();
      console.log("Criterios cargados:", criteriosExistentes);

      if (criteriosExistentes.length > 0) {
        document.getElementById("filas").value = criteriosExistentes.length;
      }

      generarTabla();
    } else {
      console.log("No se encontraron criterios existentes");
      criteriosExistentes = [];
      generarTabla();
    }
  } catch (error) {
    console.error("Error al cargar criterios:", error);
    criteriosExistentes = [];
    generarTabla();
  }
}

// Función para validar ponderación
function actualizarPonderacionRestante() {
  let suma = 0;

  const inputs = document.querySelectorAll(
    "#tablaContenedor table tbody input[type='number']"
  );

  inputs.forEach((input) => {
    const valor = parseFloat(input.value);
    if (!isNaN(valor)) {
      suma += valor;
    }
  });

  const restante = 10 - suma;

  const label = document.getElementById("labelPonderacionRestante");
  if (label) {
    label.textContent = `Ponderación restante: ${restante.toFixed(2)}`;
    label.style.color = restante < 0 ? "red" : "black";
  }

  return restante;
}

// Función para eliminar criterio
function eliminarCriterio(criterioId, fila) {
  if (!criterioId || criterioId === "undefined") {
    alert("No se puede eliminar un criterio que no ha sido guardado");
    return;
  }

  if (
    confirm(
      "¿Estás seguro de que deseas eliminar este criterio? Esta acción no se puede deshacer."
    )
  ) {
    fetch(`/api/criterios/${criterioId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      })
      .then((data) => {
        if (data.message?.includes("eliminado") || data.success) {
          alert("Criterio eliminado correctamente.");

          // Actualizar la lista de criterios existentes (comparación estricta)
          criteriosExistentes = criteriosExistentes.filter(
            (c) => c.id_Criterio !== parseInt(criterioId)
          );

          // Actualizar el campo de filas al nuevo número de criterios
          document.getElementById("filas").value = Math.max(
            criteriosExistentes.length,
            1
          );

          // Regenerar la tabla completa para actualizar la numeración
          generarTabla();
        } else {
          alert(
            "Error al eliminar criterio: " +
              (data.message || "Respuesta inesperada")
          );
        }
      })
      .catch((err) => {
        console.error("Error en la solicitud:", err);
        alert("Error al conectar con el servidor para eliminar el criterio");
      });
  }
}

// Función modificada para no deshabilitar campos automáticamente
function guardarCriterio(
  nombre,
  descripcion,
  ponderacion,
  puntaje,
  elementosFila,
  enModoEdicion = false
) {
  // Verifica si la suma total de ponderaciones supera 10
  const restante = actualizarPonderacionRestante();

  if (restante < 0) {
    alert(
      "No se puede guardar: la suma total de las ponderaciones excede el límite de 10."
    );
    return;
  }
  const criterioId = elementosFila.txtCriterio.dataset.criterioId;
  const esActualizacion = criterioId && criterioId !== "undefined";

  const url = esActualizacion
    ? `/api/criterios/${criterioId}`
    : "/api/criterios";
  const method = esActualizacion ? "PUT" : "POST";

  fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_Rubrica: idRubrica,
      nombre_Criterio: nombre.trim(),
      descripcion_Criterio: descripcion.trim(),
      puntaje_Criterio: parseFloat(puntaje),
      ponderacion_Criterio: parseFloat(ponderacion),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (
        data.message?.includes("exitosamente") ||
        data.message?.includes("actualizado")
      ) {
        const mensaje = esActualizacion
          ? "Criterio actualizado correctamente."
          : "Criterio guardado correctamente.";
          location.reload();
        alert(mensaje);

        // Si era nuevo criterio, guardar el ID retornado y cambiar apariencia
        if (!esActualizacion && data.id_Criterio) {
          elementosFila.txtCriterio.dataset.criterioId = data.id_Criterio;
          elementosFila.txtCriterio.dataset.esExistente = "true";
          elementosFila.txtDescripcion.dataset.esExistente = "true";

          // Cambiar apariencia para indicar que está guardado
          elementosFila.txtCriterio.style.backgroundColor = "#e8f5e8";
          elementosFila.txtCriterio.style.border = "2px solid #4CAF50";
          elementosFila.txtDescripcion.style.backgroundColor = "#e8f5e8";
          elementosFila.txtDescripcion.style.border = "2px solid #4CAF50";
          elementosFila.inputPonderacion.style.backgroundColor = "#e8f5e8";
          elementosFila.inputPuntaje.style.backgroundColor = "#e8f5e8";

          // Deshabilitar solo si es nuevo criterio
          elementosFila.txtCriterio.readOnly = true;
          elementosFila.txtDescripcion.readOnly = true;
          elementosFila.inputPonderacion.disabled = true;
          elementosFila.inputPuntaje.disabled = true;
        }

        // Si no está en modo edición, deshabilitar campos
        if (!enModoEdicion && esActualizacion) {
          elementosFila.txtCriterio.readOnly = true;
          elementosFila.txtDescripcion.readOnly = true;
          elementosFila.inputPonderacion.disabled = true;
          elementosFila.inputPuntaje.disabled = true;
        }
      } else {
        alert(
          "Error al guardar criterio: " +
            (data.message || "Respuesta inesperada")
        );
      }
    })
    .catch((err) => {
      console.error("Error en la solicitud:", err);
      alert("Error al conectar con el servidor");
    });
}

// Generar tabla
function generarTabla() {
  const filas = parseInt(document.getElementById("filas").value) || 1;
  const tablaContenedor = document.getElementById("tablaContenedor");
  const tabla = document.createElement("table");
  tabla.style.width = "100%";
  tabla.style.borderCollapse = "collapse";

  const colgroup = document.createElement("colgroup");
  ["7%", "3%", "20%", "50%", "10%", "15%"].forEach((width) => {
    const col = document.createElement("col");
    col.style.width = width;
    colgroup.appendChild(col);
  });
  tabla.appendChild(colgroup);

  const encabezado = tabla.createTHead();
  const filaEncabezado = encabezado.insertRow(0);
  const encabezados = [
    "", // Para el botón
    "N°",
    "Criterio",
    "Descripción",
    "Ponderación",
    "Puntaje",
  ];
  encabezados.forEach((texto) => {
    const th = document.createElement("th");
    th.innerHTML = texto;
    th.style.border = "1px solid #ddd";
    th.style.padding = "8px";
    th.style.textAlign = "center";
    filaEncabezado.appendChild(th);
  });

  const cuerpo = tabla.createTBody();
  for (let i = 0; i < filas; i++) {
    const fila = cuerpo.insertRow();
    const criterioExistente = criteriosExistentes[i] || null;

    // BOTONES EDITAR/GUARDAR Y ELIMINAR
    const celdaBoton = fila.insertCell();
    celdaBoton.style.border = "1px solid #ddd";
    celdaBoton.style.padding = "8px";
    let btnEditar = null;
    let btnEliminar = null;

    // N°
    const celdaNumero = fila.insertCell();
    celdaNumero.textContent = i + 1;
    celdaNumero.style.textAlign = "center";
    celdaNumero.style.border = "1px solid #ddd";
    celdaNumero.style.padding = "8px";

    // CRITERIO
    const celdaCriterio = fila.insertCell();
    const txtCriterio = document.createElement("textarea");
    Object.assign(txtCriterio.style, {
      width: "100%",
      padding: "5px",
      boxSizing: "border-box",
      resize: "none",
      overflowWrap: "break-word",
      whiteSpace: "pre-wrap",
      fontFamily: "Poppins, sans-serif",
    });

    // DESCRIPCIÓN
    const celdaDescripcion = fila.insertCell();
    const txtDescripcion = document.createElement("textarea");
    Object.assign(txtDescripcion.style, {
      width: "100%",
      padding: "5px",
      boxSizing: "border-box",
      resize: "none",
      overflowWrap: "break-word",
      whiteSpace: "pre-wrap",
      fontFamily: "Poppins, sans-serif",
    });

    // PONDERACIÓN
    const celdaPonderacion = fila.insertCell();
    const inputPonderacion = document.createElement("input");
    inputPonderacion.type = "number";
    inputPonderacion.min = "0";
    inputPonderacion.max = "10";
    inputPonderacion.step = "0.01";
    inputPonderacion.style.width = "100%";
    inputPonderacion.style.padding = "5px";
    inputPonderacion.style.fontFamily = "Poppins, sans-serif";

    // Validación individual y total al escribir
    inputPonderacion.addEventListener("input", function () {
      let valor = parseFloat(this.value);

      // Limitar a 10 si escribe más
      if (valor > 10) {
        this.value = 10;
        valor = 10;
      }

      const restante = actualizarPonderacionRestante();

      // Estilo si la suma total excede 10
      if (restante < 0) {
        this.style.border = "2px solid red";
        this.style.backgroundColor = "#f8d7da";
      } else {
        this.style.border = "";
        this.style.backgroundColor = "";
      }
    });
    celdaPonderacion.appendChild(inputPonderacion);

    // PUNTAJE
    const celdaPuntaje = fila.insertCell();
    const inputPuntaje = document.createElement("input");
    inputPuntaje.type = "number";
    inputPuntaje.min = "0";
    inputPuntaje.max = "10";
    inputPuntaje.readOnly = true;
    inputPuntaje.style.width = "100%";
    inputPuntaje.style.padding = "5px";

    // Si el criterio ya existe, precargar datos y deshabilitar campos
    if (criterioExistente) {
      txtCriterio.value = criterioExistente.nombre_Criterio;
      txtDescripcion.value = criterioExistente.descripcion_Criterio || "";
      inputPonderacion.value = criterioExistente.ponderacion_Criterio || 0;
      inputPuntaje.value = criterioExistente.puntaje_Criterio || 0;

      txtCriterio.readOnly = true;
      txtDescripcion.readOnly = true;
      inputPonderacion.disabled = true;

      txtCriterio.style.backgroundColor = "#e8f5e8";
      txtDescripcion.style.backgroundColor = "#e8f5e8";
      inputPonderacion.style.backgroundColor = "#e8f5e8";
      inputPuntaje.style.backgroundColor = "#e8f5e8";

      txtCriterio.style.border = "2px solid #4CAF50";
      txtDescripcion.style.border = "2px solid #4CAF50";

      txtCriterio.dataset.criterioId = criterioExistente.id_Criterio;
      txtCriterio.dataset.esExistente = "true";
      txtDescripcion.dataset.esExistente = "true";

      // Botón de editar
      btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.style.cssText =
        "padding: 4px 8px; font-size: 12px; font-family: 'Poppins', sans-serif; background: #ffc107; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;";

      btnEditar.onclick = function () {
        habilitarEdicion(
          txtCriterio,
          txtDescripcion,
          inputPonderacion,
          inputPuntaje,
          btnEditar
        );
      };

      // Botón de eliminar
      btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.style.cssText =
        "margin-top: 4px; padding: 4px 8px; font-size: 12px; font-family: 'Poppins', sans-serif; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;";

      btnEliminar.onclick = function () {
        eliminarCriterio(criterioExistente.id_Criterio, fila);
      };

      celdaBoton.appendChild(btnEditar);
      celdaBoton.appendChild(btnEliminar);
    }

    // Eventos de autoajuste de altura
    txtCriterio.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });

    txtDescripcion.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });

    // Si es una nueva fila, configurar navegación con Enter
    if (!criterioExistente) {
      txtCriterio.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          txtDescripcion.focus();
        }
      });

      txtDescripcion.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          inputPonderacion.focus();
        }
      });

      inputPonderacion.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
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
              inputPuntaje,
            }
          );
        }
      });
    }

    // Agregar inputs a sus respectivas celdas
    celdaCriterio.appendChild(txtCriterio);
    celdaDescripcion.appendChild(txtDescripcion);
    celdaPonderacion.appendChild(inputPonderacion);
    celdaPuntaje.appendChild(inputPuntaje);

    // Aplicar bordes y padding
    [celdaCriterio, celdaDescripcion, celdaPonderacion, celdaPuntaje].forEach(
      (celda) => {
        celda.style.border = "1px solid #ddd";
        celda.style.padding = "8px";
      }
    );
  }

  tablaContenedor.innerHTML = "";
  tablaContenedor.appendChild(tabla);
  actualizarPonderacionRestante();
}

// Función corregida para habilitar edición
function habilitarEdicion(
  txtCriterio,
  txtDescripcion,
  inputPonderacion,
  inputPuntaje,
  btnEditar
) {
  // Habilitar campos para edición
  txtCriterio.readOnly = false;
  txtDescripcion.readOnly = false;
  inputPonderacion.disabled = false;

  // Cambiar estilo para modo edición
  txtCriterio.style.backgroundColor = "#fff3cd";
  txtCriterio.style.border = "2px solid #ffc107";
  txtDescripcion.style.backgroundColor = "#fff3cd";
  txtDescripcion.style.border = "2px solid #ffc107";
  inputPonderacion.style.backgroundColor = "#fff3cd";

  // Cambiar botón a "Guardar"
  btnEditar.textContent = "Guardar";
  btnEditar.style.background = "#28a745";
  btnEditar.onclick = function () {
    guardarCriterio(
      txtCriterio.value,
      txtDescripcion.value,
      inputPonderacion.value,
      inputPuntaje.value || 0,
      {
        txtCriterio,
        txtDescripcion,
        inputPonderacion,
        inputPuntaje,
      },
      true // Indicar que está en modo edición
    );

    // Restaurar estado después del guardado
    setTimeout(() => {
      deshabilitarEdicion(
        txtCriterio,
        txtDescripcion,
        inputPonderacion,
        inputPuntaje,
        btnEditar
      );
    }, 1000);
  };
}

function deshabilitarEdicion(
  txtCriterio,
  txtDescripcion,
  inputPonderacion,
  inputPuntaje,
  btnEditar
) {
  // Deshabilitar campos
  txtCriterio.readOnly = true;
  txtDescripcion.readOnly = true;
  inputPonderacion.disabled = true;

  // Restaurar estilo original
  txtCriterio.style.backgroundColor = "#e8f5e8";
  txtCriterio.style.border = "2px solid #4CAF50";
  txtDescripcion.style.backgroundColor = "#e8f5e8";
  txtDescripcion.style.border = "2px solid #4CAF50";
  inputPonderacion.style.backgroundColor = "#e8f5e8";

  // Restaurar botón a "Editar"
  btnEditar.textContent = "Editar";
  btnEditar.style.cssText =
    "padding: 4px 8px; font-size: 12px; font-family: 'Poppins', sans-serif; background: #ffc107; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;";

  btnEditar.onclick = function () {
    habilitarEdicion(
      txtCriterio,
      txtDescripcion,
      inputPonderacion,
      inputPuntaje,
      btnEditar
    );
  };
}

document.getElementById("filas").addEventListener("input", generarTabla);

window.onload = function () {
  if (idRubrica && !isNaN(idRubrica)) {
    console.log("Esperando carga de criterios existentes...");
  } else {
    generarTabla();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  actualizarPonderacionRestante();
});
