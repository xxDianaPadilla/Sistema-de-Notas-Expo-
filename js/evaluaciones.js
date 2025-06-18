// Variable global para guardar el tipo seleccionado
let tipoEvaluacionSeleccionado = null;

// Evento para mostrar opción de nuevo instrumento de evaluación
document.querySelector(".newEva").addEventListener("click", function () {
  // Overlay oscuro
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  overlay.style.zIndex = "999";

  // Alerta personalizada
  const alertContainer = document.createElement("div");
  alertContainer.style.position = "fixed";
  alertContainer.style.top = "50%";
  alertContainer.style.left = "50%";
  alertContainer.style.transform = "translate(-50%, -50%)";
  alertContainer.style.padding = "20px";
  alertContainer.style.backgroundColor = "#fff";
  alertContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  alertContainer.style.borderRadius = "8px";
  alertContainer.style.textAlign = "center";
  alertContainer.style.zIndex = "1000";
  alertContainer.style.width = "400px";

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

  // Botones para mostrar el formulario
  document.getElementById("btnEscala").addEventListener("click", function () {
    tipoEvaluacionSeleccionado = 1; // Escala estimativa
    document.body.removeChild(alertContainer);
    document.body.removeChild(overlay);
    mostrarFormulario("Escala estimativa");
  });

  document.getElementById("btnRubrica").addEventListener("click", function () {
    tipoEvaluacionSeleccionado = 2; // Rúbrica
    document.body.removeChild(alertContainer);
    document.body.removeChild(overlay);
    mostrarFormulario("Rúbrica");
  });

  // Botón para cerrar la alerta
  document.getElementById("btnClose").addEventListener("click", function () {
    document.body.removeChild(alertContainer);
    document.body.removeChild(overlay);
  });
});

function mostrarFormulario(tipo) {
  const formularioContainer = document.createElement("div");
  formularioContainer.style.position = "fixed";
  formularioContainer.style.top = "50%";
  formularioContainer.style.left = "50%";
  formularioContainer.style.transform = "translate(-50%, -50%)";
  formularioContainer.style.padding = "20px";
  formularioContainer.style.backgroundColor = "#fff";
  formularioContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  formularioContainer.style.borderRadius = "8px";
  formularioContainer.style.textAlign = "center";
  formularioContainer.style.zIndex = "1000";
  formularioContainer.style.width = "400px";

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

  document
    .getElementById("btnCloseForm")
    .addEventListener("click", function () {
      document.body.removeChild(formularioContainer);
    });

  cargarDatosEnSelect("http://localhost:5501/nivel", "selectNivel");
  cargarDatosEnSelect(
    "http://localhost:5501/especialidad",
    "selectEspecialidad"
  );
  cargarDatosEnSelect("http://localhost:5501/etapa", "selectEtapa");

  document
    .getElementById("formEvaluacion")
    .addEventListener("submit", enviarFormulario);
}

async function cargarDatosEnSelect(url, idSelect) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const select = document.getElementById(idSelect);
    select.innerHTML = "<option value=''>Seleccione una opción</option>";
    data.forEach((item) => {
      const option = document.createElement("option");
      if (idSelect === "selectNivel") {
        option.value = item.Id_Nivel;
        option.textContent = item.Nombre_Nivel;
      } else if (idSelect === "selectEspecialidad") {
        option.value = item.Id_Especialidad;
        option.textContent = item.Nombre_Especialidad;
      } else if (idSelect === "selectEtapa") {
        option.value = item.id_etapa || item.Id_Etapa || item.idEtapa;
        option.textContent =
          item.nombre_etapa || item.porcentaje_etapa || item.Nombre_Etapa;
      }
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    alert("Error al cargar los datos. Intenta nuevamente.");
  }
}

// Nueva rubrica
async function enviarFormulario(event) {
  event.preventDefault();

  const nombre_Rubrica = document.getElementById("nombre").value.trim();
  const Id_Nivel = document.getElementById("selectNivel").value;
  const Id_Especialidad = document.getElementById("selectEspecialidad").value;
  const id_etapa = document.getElementById("selectEtapa").value;

  if (!nombre_Rubrica || !Id_Nivel || !Id_Especialidad || !id_etapa) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  if (!tipoEvaluacionSeleccionado) {
    alert(
      "Tipo de evaluación no seleccionado. Por favor, vuelve a intentarlo."
    );
    return;
  }

  const datosEvaluacion = {
    nombre_Rubrica,
    Id_Nivel: parseInt(Id_Nivel),
    Id_Especialidad: parseInt(Id_Especialidad),
    id_etapa: parseInt(id_etapa),
    Id_TipoEvaluacion: tipoEvaluacionSeleccionado,
    Año: "2025",
  };

  try {
    const response = await fetch("http://localhost:5501/api/rubricas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEvaluacion),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Evaluación guardada con éxito.");
      document.getElementById("formEvaluacion").reset();

      const nuevoId = result.id || result.Id || result.Id_Rubrica; // según como venga el id

      if (!nuevoId) {
        alert("No se pudo obtener el ID de la evaluación creada.");
        return;
      }

      if (tipoEvaluacionSeleccionado === 1) {
        window.location.href = `escala.html?id=${nuevoId}`;
      } else if (tipoEvaluacionSeleccionado === 2) {
        window.location.href = `newRubric.html?id=${nuevoId}`;
      }
    } else {
      alert(
        "Error: " +
          (result.message || result.error || "No se pudo guardar la evaluación")
      );
    }
  } catch (error) {
    console.error("Error al guardar la evaluación:", error);
    alert("Hubo un problema al guardar la evaluación.");
  }
}

// Mostrar rubricas
function mostrarRubricas(rubricas) {
  const contenedor = document.getElementById("contenedorRubricas");
  contenedor.innerHTML = "";

  rubricas.forEach((rubrica) => {
    const card = document.createElement("div");
    card.className = "cardRubrica";
    card.style.display = "flex";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    card.style.padding = "10px";
    card.style.borderRadius = "8px";
    card.style.backgroundColor = "#E0E0E0";
    card.style.marginBottom = "10px";
    card.style.cursor = "pointer"; 

    // Asignamos los atributos para poder usarlos en el evento
    card.dataset.id = rubrica.id_Rubrica;
    card.dataset.tipo = rubrica.Id_TipoEvaluacion;

    card.innerHTML = `
    <div>
      <div><strong>Nombre:</strong> ${rubrica.nombre_Rubrica}</div>
      <div><strong>Tipo de Evaluación:</strong> ${
        rubrica.nombre_TipoEvaluacion || "N/A"
      }</div>
    </div>
    <button class="btnEliminar" data-id="${rubrica.id_Rubrica}" style="
      background-color: #e74c3c; 
      color: white; 
      border: none; 
      padding: 6px 12px; 
      border-radius: 6px; 
      cursor: pointer;
    ">Eliminar</button>
  `;

    // Evento para navegar a la página según el tipo
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("btnEliminar")) return;

      const id = card.dataset.id;
      const tipo = parseInt(card.dataset.tipo);

      if (tipo === 1) {
        window.location.href = `escala.html?id=${id}`;
      } else if (tipo === 2) {
        window.location.href = `newRubric.html?id=${id}`;
      } else {
        alert("Tipo de evaluación no reconocido.");
      }
    });

    contenedor.appendChild(card);
  });

  contenedor.querySelectorAll(".btnEliminar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Quieres eliminar esta rúbrica?")) {
        try {
          const res = await fetch(`http://localhost:5501/api/rubricas/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            alert("Rúbrica eliminada");

            cargarRubricas();
          } else {
            alert("Error al eliminar la rúbrica");
          }
        } catch (error) {
          console.error("Error al eliminar:", error);
          alert("Error de red al eliminar");
        }
      }
    });
  });
}

async function cargarRubricas() {
  try {
    const response = await fetch("http://localhost:5501/api/rubricas");
    const data = await response.json();
    mostrarRubricas(data);
  } catch (error) {
    console.error("Error al cargar rúbricas:", error);
  }
}

window.onload = cargarRubricas;