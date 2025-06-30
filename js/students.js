document.addEventListener("DOMContentLoaded", () => {
    const tipoCat1 = document.querySelector('.tipoCat1');
    const tipoCat2 = document.querySelector('.tipoCat2');
    const bachilleratoTab = document.querySelector('.tipoBachillerato');
    const tercerCicloTab = document.querySelector('.tipoTercerCiclo');
    const tercerCicloFilters = document.querySelector('.tercer-ciclo-filters');
    const bachilleratoFilters = document.querySelector('.bachillerato-filters');
    const tercerCicloFilterSelect = document.getElementById('tercerCicloFilter');
    const bachilleratoFilterSelect = document.getElementById('bachilleratoFilter');
    const searchInput = document.getElementById('searchInput');
    const cardContainer = document.getElementById('cardContainer2');
    const modal = document.getElementById('editModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const form = document.getElementById('editStudentForm');
    const levelSelect = document.getElementById('editStudentLevel');
    const especialidadGroup = document.getElementById('especialidadGroup');

    document.getElementById('btn-delete-students').addEventListener('click', function () {
        Swal.fire({
            title: '⚠️ ¡ATENCIÓN!',
            html: `
            <div style="text-align: left; margin: 20px 0;">
                <p><strong>Esta acción eliminará TODOS los datos:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Todos los estudiantes registrados</li>
                    <li>Todos los proyectos existentes</li>
                </ul>
                <p style="color: #d33; font-weight: bold;">⚠️ Esta acción NO se puede deshacer</p>
                <p>¿Está completamente seguro de que desea continuar?</p>
            </div>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar todo',
            cancelButtonText: 'Cancelar',
            focusCancel: true,
            reverseButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Confirmación final',
                    text: 'Escriba "ELIMINAR TODO" para confirmar',
                    input: 'text',
                    inputPlaceholder: 'Escriba: ELIMINAR TODO',
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Proceder',
                    cancelButtonText: 'Cancelar',
                    inputValidator: (value) => {
                        if (value !== 'ELIMINAR TODO') {
                            return 'Debe escribir exactamente "ELIMINAR TODO" para continuar';
                        }
                    }
                }).then((finalResult) => {
                    if (finalResult.isConfirmed) {
                        eliminarTodosLosEstudiantesYProyectos();
                    }
                });
            }
        });
    });

    function eliminarTodosLosEstudiantesYProyectos() {
        Swal.fire({
            title: 'Eliminando datos...',
            html: 'Por favor espere mientras se eliminan todos los estudiantes y proyectos.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        fetch('/api/eliminar-todos-estudiantes-proyectos', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminación completada',
                    html: `
                <div style="text-align: left;">
                    <p><strong>Datos eliminados exitosamente:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Estudiantes eliminados: ${data.estudiantesEliminados}</li>
                        <li>Proyectos eliminados: ${data.proyectosEliminados}</li>
                    </ul>
                </div>
            `,
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    if (typeof loadStudents === 'function') {
                        loadStudents(currentTab, 0);
                    } else {
                        location.reload();
                    }
                });
            })
            .catch(error => {
                console.error('Error al eliminar estudiantes y proyectos: ', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error el eliminar los datos. Por favor, intente nuevamente.',
                    confirmButtonText: 'Aceptar'
                });
            });
    }

    if (window.location.pathname.includes('students.html')) {
        tipoCat2.classList.add('active');
        tipoCat1.classList.remove('active');
    } else {
        tipoCat1.classList.add('active');
        tipoCat2.classList.remove('active');
    }

    tipoCat1.addEventListener('click', () => {
        tipoCat1.classList.add('active');
        tipoCat2.classList.remove('active');
        location.href = '/users.html';
    });

    tipoCat2.addEventListener('click', () => {
        tipoCat2.classList.add('active');
        tipoCat1.classList.remove('active');
        location.href = '/students.html';
    });

    let currentTab = 'bachillerato';

    loadStudents('bachillerato', 0);

    tercerCicloTab.addEventListener('click', function () {
        setActiveTab('tercerCiclo');
        loadStudents('tercerCiclo', 0);
    });

    bachilleratoTab.addEventListener('click', function () {
        setActiveTab('bachillerato');
        loadStudents('bachillerato', 0);
    });

    tercerCicloFilterSelect.addEventListener('change', function () {
        loadStudents('tercerCiclo', this.value);
    });

    bachilleratoFilterSelect.addEventListener('change', function () {
        loadStudents('bachillerato', this.value);
    });

    searchInput.addEventListener('input', function () {
        if (currentTab === 'tercerCiclo') {
            loadStudents('tercerCiclo', tercerCicloFilterSelect.value, this.value);
        } else {
            loadStudents('bachillerato', bachilleratoFilterSelect.value, this.value);
        }
    });

    function setActiveTab(tab) {
        currentTab = tab;

        if (tab === 'tercerCiclo') {
            tercerCicloTab.classList.add('active');
            bachilleratoTab.classList.remove('active');
            tercerCicloFilters.classList.add('active');
            bachilleratoFilters.classList.remove('active');
        } else {
            bachilleratoTab.classList.add('active');
            tercerCicloTab.classList.remove('active');
            bachilleratoFilters.classList.add('active');
            tercerCicloFilters.classList.remove('active');
        }
    }

    function loadStudents(tabType, nivelId, searchTerm = '') {
        let minNivel, maxNivel;

        if (tabType === 'tercerCiclo') {
            minNivel = 1;
            maxNivel = 3;
        } else {
            minNivel = 4;
            maxNivel = 6;
        }

        let url = '/api/estudiantes?';

        if (nivelId && nivelId != 0) {
            url += `nivel=${nivelId}`;
        } else {
            url += `minNivel=${minNivel}&maxNivel=${maxNivel}`;
        }

        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(students => {
                cardContainer.innerHTML = '';

                students.forEach(student => {
                    const card = document.createElement('div');
                    card.className = 'student-card';
                    card.innerHTML = `
                                <div class="student-info">${student.nombre_Estudiante} ${student.apellido_Estudiante}</div>
                                <div class="student-id">#${student.Codigo_Carnet}</div>
                                <div class="action-buttons">
                                    <button class="btn btn-edit" 
                                      data-id="${student.id_Estudiante}" 
                                      data-codigo="${student.Codigo_Carnet}"
                                      data-nombre="${student.nombre_Estudiante}" 
                                      data-apellido="${student.apellido_Estudiante}" 
                                      data-nivel="${student.Id_Nivel}"
                                      data-seccion="${student.Id_SeccionGrupo}"
                                      data-especialidad="${student.Id_Especialidad || ''}"
                                      data-proyecto="${student.id_Proyecto || ''}">Editar</button>
                                    <button class="btn btn-delete" 
                                      data-id="${student.id_Estudiante}" 
                                      data-nombre="${student.nombre_Estudiante}">Eliminar</button>
                                </div>
                            `;
                    cardContainer.appendChild(card);
                });

                if (students.length === 0) {
                    cardContainer.innerHTML = '<p>No se encontraron estudiantes con los criterios seleccionados.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching students:', error);
                cardContainer.innerHTML = '<p>Error al cargar los estudiantes. Por favor, intente nuevamente.</p>';
            });
    }

    loadNiveles();
    loadSecciones();
    loadEspecialidades();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) closeModal();
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            openEditModal(e.target);
        }
    });

    levelSelect.addEventListener('change', () => {
        const nivelId = parseInt(levelSelect.value);

        if (nivelId >= 4 && nivelId <= 6) {
            especialidadGroup.style.display = 'block';
            document.getElementById('editStudentSpeciality').required = true;
        } else {
            especialidadGroup.style.display = 'none';
            document.getElementById('editStudentSpeciality').required = false;
            document.getElementById('editStudentSpeciality').value = '';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        updateStudent();
    });

    function openEditModal(button) {
        const studentId = button.getAttribute('data-id');
        const studentCode = button.getAttribute('data-codigo');
        const studentName = button.getAttribute('data-nombre');
        const studentLastName = button.getAttribute('data-apellido');
        const nivelId = button.getAttribute('data-nivel');
        const seccionId = button.getAttribute('data-seccion');
        const especialidadId = button.getAttribute('data-especialidad');
        const proyectoId = button.getAttribute('data-proyecto');

        document.getElementById('editStudentId').value = studentId;
        document.getElementById('editStudentCode').value = studentCode;
        document.getElementById('editStudentName').value = studentName;
        document.getElementById('editStudentLastName').value = studentLastName;
        document.getElementById('editStudentLevel').value = nivelId;
        document.getElementById('editStudentSection').value = seccionId;

        if (parseInt(nivelId) >= 4 && parseInt(nivelId) <= 6) {
            especialidadGroup.style.display = 'block';
            if (especialidadId) {
                document.getElementById('editStudentSpeciality').value = especialidadId;
            }
            document.getElementById('editStudentSpeciality').required = true;
        } else {
            especialidadGroup.style.display = 'none';
            document.getElementById('editStudentSpeciality').required = false;
        }

        if (proyectoId) {
            loadProjectInfo(proyectoId);
        } else {
            document.getElementById('editStudentProject').value = 'No asignado';
        }

        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        form.reset();
    }

    async function loadNiveles() {
        try {
            const response = await fetch('/api/niveles');
            if (!response.ok) throw new Error('Error al cargar niveles');

            const niveles = await response.json();
            const select = document.getElementById('editStudentLevel');

            select.innerHTML = '<option value="">Seleccione un nivel</option>';

            niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.Id_Nivel;
                option.textContent = nivel.Nombre_Nivel;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('No se puedieron cargar los niveles');
        }
    }

    async function loadSecciones() {
        try {
            const response = await fetch('/api/secciones');
            if (!response.ok) throw new Error('Error al cargar secciones');

            const secciones = await response.json();
            const select = document.getElementById('editStudentSection');

            select.innerHTML = '<option value="">Seleccione una sección</option>';

            secciones.forEach(seccion => {
                const option = document.createElement('option');
                option.value = seccion.Id_SeccionGrupo;
                option.textContent = seccion.Nombre_SeccionGrupo;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar las secciones');
        }
    }

    async function loadEspecialidades() {
        try {
            const response = await fetch('/api/especialidades');
            if (!response.ok) throw new Error('Error al cargar especialidades');

            const especialidades = await response.json();
            const select = document.getElementById('editStudentSpeciality');

            select.innerHTML = '<option value="">Seleccione una especialidad</option>';

            especialidades.forEach(especialidad => {
                const option = document.createElement('option');
                option.value = especialidad.Id_Especialidad;
                option.textContent = especialidad.Nombre_Especialidad;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargas las especialidades');
        }
    }

    async function loadProjectInfo(proyectoId) {
        try {
            const response = await fetch(`/api/proyectos/${proyectoId}`);
            if (!response.ok) throw new Error('Error al cargar proyecto');

            const proyecto = await response.json();
            document.getElementById('editStudentProject').value = `${proyecto.nombre_Proyecto} (${proyecto.id_Proyecto})`;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('editStudentProject').value = 'Error al cargar proyecto';
        }
    }

    async function updateStudent() {
        const studentId = document.getElementById('editStudentId').value;
        const studentName = document.getElementById('editStudentName').value;
        const studentLastName = document.getElementById('editStudentLastName').value;
        const niveld = document.getElementById('editStudentLevel').value;
        const seccionId = document.getElementById('editStudentSection').value;
        let especialidadId = null;

        if (parseInt(niveld) >= 4 && parseInt(niveld) <= 6) {
            especialidadId = document.getElementById('editStudentSpeciality').value;
            if (!especialidadId) {
                alert('Debe seleccionar una especialidad para estudiantes de bachillerato');
                return;
            }
        }

        try {
            const response = await fetch(`/api/estudiantes/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre_Estudiante: studentName,
                    apellido_Estudiante: studentLastName,
                    Id_Nivel: parseInt(niveld),
                    Id_SeccionGrupo: parseInt(seccionId),
                    Id_Especialidad: especialidadId ? parseInt(especialidadId) : null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar estudiante');
            }

            alert('Estudiante actualizado exitosamente');
            closeModal();

            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('btn-delete')) {
            const studentId = e.target.getAttribute('data-id');
            const studentName = e.target.getAttribute('data-nombre');

            if (confirm(`¿Está seguro que desea eliminar a ${studentName}?`)) {
                deleteStudent(studentId);
            }
        }
    });

    function deleteStudent(studentId) {
        fetch(`/api/eliminarEstudiantes/${studentId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                const cardToRemove = document.querySelector(`.btn-delete[data-id="${studentId}"]`).closest('.student-card');

                cardToRemove.style.transition = 'opacity 0.3s, transform 0.3s';
                cardToRemove.style.opacity = '0';
                cardToRemove.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    cardToRemove.remove();

                    if (cardContainer.children.length === 0) {
                        cardContainer.innerHTML = '<p>No se encontraron estudiantes con los criterios seleccionados.</p>';
                    }

                    alert(data.message);
                }, 300);
            })
            .catch(error => {
                console.error('Error al eliminar estudiante:', error);
                alert('Error al eliminar estudiante. Por favor, intente nuevamente.');
            });
    }

    document.getElementById('newUser2').addEventListener('click', function () {
        Swal.fire({
            title: 'Agregar estudiante',
            html: `
            <p class="question-text">¿Cómo desea agregar los estudiantes?</p>
            <div class="button-container">
            <button id="btnFormulario" class="form-button primary-button">
                 Un estudiante (Formulario)
            </button>
            <button id="btnExcel" class="form-button success-button">
                 Varios estudiantes (Excel)
            </button>
            </div>
          `,
            showConfirmButton: false,
            showCloseButton: true,
            didOpen: () => {
                document.getElementById('btnFormulario').addEventListener('click', function () {
                    Swal.close();
                    mostrarFormularioEstudiante();
                });

                document.getElementById('btnExcel').addEventListener('click', function () {
                    Swal.close();
                    importarExcel();
                });
            }
        });
    });

    async function mostrarFormularioEstudiante() {
        const niveles = await obtenerNiveles();
        const secciones = await obtenerSecciones();
        const especialidades = await obtenerEspecialidades();

        const nivelesOptions = niveles.map(nivel => `<option value="${nivel.Id_Nivel}">${nivel.Nombre_Nivel}</option>`).join('');

        const seccionesOptions = secciones.map(seccion => `<option value="${seccion.Id_SeccionGrupo}">${seccion.Nombre_SeccionGrupo}</option>`).join('');

        const especialidadesOptions = especialidades.map(especialidad => `<option value="${especialidad.Id_Especialidad}">${especialidad.Nombre_Especialidad}</option>`).join('');

        Swal.fire({
            title: 'Agregar estudiante',
            html: `
      <form id="formEstudiante" class="text-left">
        <div class="form-group mb-3">
          <label for="codigo">Código/Carnet:</label>
          <input type="number" id="codigo" class="form-control" required>
        </div>
        <div class="form-group mb-3">
          <label for="nombres">Nombres:</label>
          <input type="text" id="nombres" class="form-control" required>
        </div>
        <div class="form-group mb-3">
          <label for="apellidos">Apellidos:</label>
          <input type="text" id="apellidos" class="form-control" required>
        </div>
        <div class="form-group mb-3">
          <label for="nivel">Nivel:</label>
          <select id="nivel" class="form-control" required>
            <option value="">Seleccione un nivel</option>
            ${nivelesOptions}
          </select>
        </div>
        <div class="form-group mb-3">
          <label for="seccion">Sección/Grupo:</label>
          <select id="seccion" class="form-control" required>
            <option value="">Seleccione una sección</option>
            ${seccionesOptions}
          </select>
        </div>
        <div class="form-group mb-3" id="especialidadContainer" style="display: none;">
          <label for="especialidad">Especialidad:</label>
          <select id="especialidad" class="form-control">
            <option value="">Seleccione una especialidad</option>
            ${especialidadesOptions}
          </select>
        </div>
      </form>
    `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                document.getElementById('nivel').addEventListener('change', function () {
                    const nivelId = parseInt(this.value);
                    const esBachillerato = esBachilleratoNivel(nivelId, niveles);
                    document.getElementById('especialidadContainer').style.display = esBachillerato ? 'block' : 'none';

                    if (!esBachillerato) {
                        document.getElementById('especialidad').value = '';
                    }
                });
            },
            preConfirm: () => {
                const formulario = document.getElementById('formEstudiante');
                if (!formulario.checkValidity()) {
                    Swal.showValidationMessage('Por favor complete todos los campos obligatorios');
                    return false;
                }

                return {
                    codigo: document.getElementById('codigo').value,
                    nombres: document.getElementById('nombres').value,
                    apellidos: document.getElementById('apellidos').value,
                    idNivel: document.getElementById('nivel').value,
                    idSeccion: document.getElementById('seccion').value,
                    idEspecialidad: document.getElementById('especialidad').value || null
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                guardarEstudiante(result.value);
            }
        });
    }

    function esBachilleratoNivel(idNivel, niveles) {
        const nivel = niveles.find(n => n.Id_Nivel === parseInt(idNivel));

        return nivel && (
            (nivel.Id_Nivel >= 4 && nivel.Id_Nivel <= 6) ||
            nivel.Nombre_Nivel.toLowerCase().includes('bachillerato')
        );
    }

    async function obtenerNiveles() {
        try {
            const response = await fetch('/api/niveles');
            if (!response.ok) throw new Error('Error al obtener niveles');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async function obtenerSecciones() {
        try {
            const response = await fetch('/api/secciones');
            if (!response.ok) throw new Error('Error al obtener secciones');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async function obtenerEspecialidades() {
        try {
            const response = await fetch('/api/especialidades');
            if (!response.ok) throw new Error('Error al obtener especialidades');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async function guardarEstudiante(estudiante) {
        try {
            const response = await fetch('/api/guardarEstudiantes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(estudiante)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el estudiante');
            }

            const result = await response.json();

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Estudiante guardado correctamente',
            });
            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al guardar el estudiante',
            });
        }
    }

    function importarExcel() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx, xls';

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            Swal.fire({
                title: 'Procesando archivo',
                html: 'Por favor espere mientras se procesa el archivo Excel...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            try {
                const formData = new FormData();
                formData.append('excelFile', file);

                const response = await fetch('/api/estudiantes/importar', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al procesar el archivo');
                }

                const result = await response.json();

                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: `Se han importado ${result.insertados} estudiantes correctamente`,
                });
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al procesar el archivo Excel',
                });
            }
        });

        fileInput.click();
    }
});