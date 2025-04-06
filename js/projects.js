let editarProyectoGlobal;

document.addEventListener('DOMContentLoaded', () =>{
    const proyectosContainer = document.getElementById('proyectos-container');
    const totalProyectos = document.getElementById('totalProyectos');
    const tabs = document.querySelectorAll('.tab');
    const filtrarBtn = document.getElementById('filtrarBtn');
    const filtroMenu = document.getElementById('filtro-menu');
    const addProjectBtn = document.getElementById('add-button');
    const modal = document.getElementById('projectFormModal');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn');
    const projectLevelSelect = document.getElementById('projectLevel');
    const projectSectionSelect = document.getElementById('projectSection');
    const projectEspecialidadSelect = document.getElementById('projectEspecialidad');
    const projectIdInput = document.getElementById('projectID');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModalOverlay = document.getElementById('studentsModalOverlay');
    const nivelFilter = document.getElementById('nivelFilter');
    const studentSearch = document.getElementById('studentSearch');
    const availablesStudentesList = document.getElementById('availableStudentsList');
    const selectStudentsBtn = document.getElementById('selectStudentBtn');
    const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
    const studentListContainer = document.getElementById('studentList');
    const projectForm = document.getElementById('projectForm');
    const projectNameInput = document.getElementById('projectName');
    const projectStatusInput = document.getElementById('projectStatus');
    const projectStatusText = document.createElement('span');

    let proyectosData = {tercerCiclo: [], bachillerato: []};
    let tipoActual = 'tercerCiclo';
    let nivelSeleccionado = null;
    let nivelesData = [];
    let seccionesData = [];
    let especialidadesData = [];
    let selectedStudents = [];
    let availableStudents = [];
    let nivelMapping = {
        1: 'Séptimo',
        2: 'Octavo',
        3: 'Noveno',
        4: '1° Bachillerato',
        5: '2° Bachillerato',
        6: '3° Bachillerato'
    };

    function cambiarTab(event){
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');

        tipoActual = event.target.dataset.tab;
        nivelSeleccionado = null;
        cargarProyectos(tipoActual);
        actualizarFiltroMenu();

        filtroMenu.classList.remove('visible');
    }

    function actualizarFiltroMenu(){
        filtroMenu.innerHTML = '';

        const niveles = tipoActual === 'tercerCiclo'
        ? [{id: 1, nombre: 'Séptimo'}, {id: 2, nombre: 'Octavo'}, {id: 3, nombre: 'Noveno'}]
        : [{id: 4, nombre: '1° Bachillerato'}, {id: 5, nombre: '2° Bachillerato'}, {id: 6, nombre: '3° Bachillerato'}];

        console.log('Niveles generados:', niveles);

        niveles.forEach(nivel => {
            const option = document.createElement('div');
            option.classList.add('filtro-opcion');
            option.textContent = nivel.nombre;
            option.dataset.nivel = nivel.id;
            option.addEventListener('click', () =>{
                nivelSeleccionado = nivel.id;
                cargarProyectos(tipoActual, nivelSeleccionado);
                filtroMenu.classList.remove('visible');
            });
            filtroMenu.appendChild(option);
        });

        console.log('Opciones dentro del filtro:', filtroMenu.innerHTML);
    }

    filtrarBtn.addEventListener('click', () =>{
        event.stopPropagation();
        actualizarFiltroMenu(); 
        filtroMenu.classList.toggle('visible');
    });

    document.addEventListener('click', (event) => {
        if (!filtrarBtn.contains(event.target) && !filtroMenu.contains(event.target)) {
            filtroMenu.classList.remove('visible');
        }
    });

    tabs.forEach(tab => tab.addEventListener('click', cambiarTab));

    cargarProyectos('tercerCiclo');
    actualizarFiltroMenu();

    if (addProjectBtn && modal) {
        addProjectBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    function cargarNiveles(){
        fetch('http://localhost:5501/niveles')
        .then(response => response.json())
        .then(niveles =>{
            nivelesData = niveles;
            projectLevelSelect.innerHTML = '';
            niveles.forEach(nivel =>{
                const option = document.createElement('option');
                option.value = nivel.Id_Nivel;
                option.textContent = nivel.Nombre_Nivel;
                option.dataset.letra = nivel.letra_nivel;
                projectLevelSelect.appendChild(option);
            });

            toggleEspecialidadSelect();
        })
        .catch(error => console.error('Error cargando niveles:', error));
    }

    cargarNiveles();

    function cargarSeccionGrupo(){
        fetch('http://localhost:5501/seccionGrupo')
        .then(response => response.json())
        .then(secciones =>{
            seccionesData = secciones;
            projectSectionSelect.innerHTML = '';
            secciones.forEach(seccion =>{
                const option = document.createElement('option');
                option.value = seccion.Id_SeccionGrupo;
                option.textContent = seccion.Nombre_SeccionGrupo;
                projectSectionSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando las secciones y grupos', error));
    }

    cargarSeccionGrupo();

    function cargarEspecialidad(){
        fetch('http://localhost:5501/especialidad')
        .then(response => response.json())
        .then(especialidades =>{
            especialidadesData = especialidades;
            projectEspecialidadSelect.innerHTML = '';
            especialidades.forEach(especialidad =>{
                const option = document.createElement('option');
                option.value = especialidad.Id_Especialidad;
                option.textContent = especialidad.Nombre_Especialidad;
                option.dataset.letra = especialidad.letra_especialidad;
                projectEspecialidadSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando las especialidades', error));
    }

    function toggleEspecialidadSelect(){
        const nivelId = parseInt(projectLevelSelect.value);

        const esBachillerato = nivelId >= 4 && nivelId <= 6;

        projectEspecialidadSelect.disabled = !esBachillerato;

        generarIdProyecto();
    }

    async function obtenerNumeroProyecto(){
        const nivelId = projectLevelSelect.value;
        const seccionId = projectSectionSelect.value;
        const especialidadId = projectEspecialidadSelect.value;
    
        if(!nivelId || !seccionId || (projectEspecialidadSelect.disabled === false && !especialidadId)){
            return "01";
        }
    
        try{
            let prefijo;
            if(parseInt(nivelId) >= 4 && parseInt(nivelId) <= 6){
                const especialidad = especialidadesData.find(e => e.Id_Especialidad == especialidadId);
                const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
                if(!especialidad || !nivel) return "01";
                prefijo = especialidad.letra_especialidad + nivel.letra_nivel;
            }else{
                const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
                const seccion = seccionesData.find(s => s.Id_SeccionGrupo == seccionId);
                if(!nivel || !seccion) return "01";
                prefijo = nivel.letra_nivel + seccion.Nombre_SeccionGrupo;
            }
    
            const response = await fetch(`http://localhost:5501/proyectosId?prefijo=${prefijo}`);
            const proyectos = await response.json();
    
            if(!proyectos || proyectos.length === 0){
                return "01";
            }
    
            let maxNumero = 0;
            proyectos.forEach(proyecto => {
                const match = proyecto.id_Proyecto.match(/[A-Z0-9]+(\d{2})-\d{2}/);
                if(match && match[1]){
                    const num = parseInt(match[1]);
                    if(num > maxNumero){
                        maxNumero = num;
                    }
                }
            });
    
            return (maxNumero + 1).toString().padStart(2, '0');
        }catch(error){
            console.error('Error obteniendo el número de proyectos:', error);
            return "01";
        }
    }

    async function generarIdProyecto() {
        const nivelId = projectLevelSelect.value;
        const seccionId = projectSectionSelect.value;
        const especialidadId = projectEspecialidadSelect.value;
        
        if (!nivelId || !seccionId || (projectEspecialidadSelect.disabled === false && !especialidadId)) {
            projectIdInput.value = "";
            return;
        }
        
        const year = "25";

        const numeroProyecto = await obtenerNumeroProyecto();
        
        let idProyecto = "";
        
        if (parseInt(nivelId) >= 4 && parseInt(nivelId) <= 6) {
            const especialidad = especialidadesData.find(e => e.Id_Especialidad == especialidadId);
            const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
            
            if (especialidad && nivel) {
                idProyecto = especialidad.letra_especialidad + nivel.letra_nivel + numeroProyecto + "-" + year;
            }
        } else {
            const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
            const seccion = seccionesData.find(s => s.Id_SeccionGrupo == seccionId);
            
            if (nivel && seccion) {
                idProyecto = nivel.letra_nivel + seccion.Nombre_SeccionGrupo + numeroProyecto + "-" + year;
            }
        }
    
        projectIdInput.value = idProyecto;
    }

    projectLevelSelect.addEventListener('change', toggleEspecialidadSelect);
    projectSectionSelect.addEventListener('change', generarIdProyecto);
    projectEspecialidadSelect.addEventListener('change', generarIdProyecto);

    cargarNiveles();
    cargarSeccionGrupo();
    cargarEspecialidad();

    addStudentBtn.addEventListener('click', openStudentModal);

    closeBtn.addEventListener('click', closeStudentModal);
    cancelSelectionBtn.addEventListener('click', closeStudentModal);

    studentModalOverlay.addEventListener('click', function(e){
        if(e.target === studentModalOverlay){
            closeStudentModal();
        }
    });

    nivelFilter.addEventListener('change', filterStudents);
    studentSearch.addEventListener('input', filterStudents);

    function openStudentModal(){
        fetchAvailablesStudents();
        studentModalOverlay.style.display = 'flex';
    }

    function closeStudentModal(){
        studentModalOverlay.style.display = 'none';

        nivelFilter.value = '0';
        studentSearch.value = '';
    }

    function fetchAvailablesStudents(){
        availablesStudentesList.innerHTML = '<li class="student-item">Cargando estudiantes...</li>';

        fetch('/estudiantes')
        .then(response => {
            if(!response.ok){
                throw new Error('Error al obtener estudiantes');
            }
            return response.json();
        })
        .then(data =>{
            availableStudents = data;
            renderStudentList();
        })
        .catch(error => {
            console.error('Error:', error);
            availablesStudentesList.innerHTML = '<li class="student-item">Error al cargar estudiantes. Intente nuevamente.</li>';
        });
    }

    function renderStudentList(){
        if(!availableStudents.length){
            availablesStudentesList.innerHTML = '<li class="student-item">No hay estudiantes disponibles</li>';
            return;
        }

        filterStudents();
    }

    function filterStudents(){
        const nivelId = parseInt(nivelFilter.value);
        const searchTerm = studentSearch.value.toLowerCase();

        let filteredStudents = availableStudents;

        if(nivelId > 0){
            filteredStudents = filteredStudents.filter(student => student.Id_Nivel === nivelId);
        }

        if(searchTerm){
            filteredStudents = filteredStudents.filter(student =>{
                const fullName = `${student.nombre_Estudiante} ${student.apellido_Estudiante}`.toLowerCase();
                const carnet = student.Codigo_Carnet.toString();
                return fullName.includes(searchTerm) || carnet.includes(searchTerm);
            });
        }

        renderFilteredStudents(filteredStudents);
    }

    function renderFilteredStudents(students){
        availablesStudentesList.innerHTML = '';

        if(!students.length){
            availablesStudentesList.innerHTML = '<li class="student-item">No se encontraron estudiantes con estos criterios</li>';
            return;
        }

        students.forEach(student =>{
            const fullName = `${student.nombre_Estudiante} ${student.apellido_Estudiante}`;
            const isAssigned = student.id_Proyecto !== null;
            const isSelected = selectedStudents.some(s => s.id_Estudiante === student.id_Estudiante);

            const studentItem = document.createElement('li');
            studentItem.className = `student-item ${isAssigned ? 'assigned' : ''}`;

            const levelText = nivelMapping[student.Id_Nivel] || `Nivel ${student.Id_Nivel}`;

            studentItem.innerHTML = `
            <input type="checkbox" class="student-checkbox" 
                   ${isAssigned ? 'disabled' : ''} 
                   ${isSelected ? 'checked' : ''}
                   data-id="${student.id_Estudiante}">
            <div class="student-info">
                <span>${fullName}</span>
                <span class="student-carnet">Carnet: ${student.Codigo_Carnet}</span>
                <span class="level-badge">${levelText}</span>
                ${isAssigned ? '<span class="student-assigned-tag">Asignado</span>' : ''}
            </div>
        `;

        if(!isAssigned){
            const checkBox = studentItem.querySelector('.student-checkbox');
            checkBox.addEventListener('change', function(){
                if(this.checked){
                    addToSelectedStudents(student);
                }else{
                    removeFromSelectedStudents(student.id_Estudiante);
                }
            });
        }

        availablesStudentesList.appendChild(studentItem);
        });

        function addToSelectedStudents(student){
            if(!selectedStudents.some(s => s.id_Estudiante === student.id_Estudiante)){
                selectedStudents.push(student);
            }
        }

        function removeFromSelectedStudents(studentId){
            selectedStudents = selectedStudents.filter(s => s.id_Estudiante !== studentId);
        }

        function confirmStudentSelection(){
            updateStudentListView();
            closeStudentModal();
        }

        function updateStudentListView(){
            studentListContainer.innerHTML = '';

            if(!selectedStudents.length){
                return;
            }

            selectedStudents.forEach(student =>{
                const fullName = `${student.nombre_Estudiante} ${student.apellido_Estudiante}`;
                const levelText = nivelMapping[student.Id_Nivel] || `Nivel ${student.Id_Nivel}`;

                const studentElement = document.createElement('div');
                studentElement.className = 'selected-student';
                studentElement.innerHTML = `
            <input type="hidden" name="selectedStudentIds[]" value="${student.id_Estudiante}">
            <div>
                <span>${fullName}</span>
                <span class="level-badge">${levelText}</span>
            </div>
            <span class="remove-student" data-id="${student.id_Estudiante}">&times;</span>
        `;

        const removeBtn = studentElement.querySelector('.remove-student');
        removeBtn.addEventListener('click', function(){
            const studentId = parseInt(this.getAttribute('data-id'));
            removeFromSelectedStudents(studentId);
            updateStudentListView();

            if(studentModalOverlay.style.display === 'flex'){
                const checkbox = document.querySelector(`.student-checkbox[data-id="${studentId}"]`);
                if(checkbox){
                    checkbox.checked = false;
                }
            }
        });

        studentListContainer.appendChild(studentElement);
            });
        }

        selectStudentsBtn.addEventListener('click', confirmStudentSelection);
    }

    projectStatusText.id = 'statusText';
    projectStatusText.textContent = 'Activo';
    projectStatusText.classList.add('status-text');

    const switchLabel = document.querySelector('.switch');
    switchLabel.parentNode.insertBefore(projectStatusText, switchLabel.nextSibling);

    function updateStatusText(){
        projectStatusText.textContent = projectStatusInput.checked ? 'Activo' : 'Inactivo';
    }

    projectStatusInput.addEventListener('change', updateStatusText);

    projectStatusInput.checked = true;
    updateStatusText();

    projectForm.addEventListener('submit', function(event){
        event.preventDefault();

        if(!projectNameInput.value.trim()){
            alert('Por favor, ingrese un nombre para el proyecto');
            return;
        }

        const projectData = {
            nombre: projectNameInput.value.trim(),
            nivelId: parseInt(projectLevelSelect.value),
            seccionId: parseInt(projectSectionSelect.value),
            especialidadId: projectEspecialidadSelect.disabled ? null : parseInt(projectEspecialidadSelect.value),
            idProyecto: projectIdInput.value,
            estado: projectStatusInput.checked,
            estudiantesIds: selectedStudents.map(student => student.id_Estudiante)
        };

        if(!projectData.nivelId || !projectData.seccionId || !projectData.idProyecto){
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }

        fetch('http://localhost:5501/creacionProyectos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        })
        .then(response =>{
            if(!response.ok){
                throw new Error('Error al crear el proyecto');
            }
            return response.json();
        })
        .then(data =>{
            if(data.success){
                mostrarAlerta('Proyecto creado exitosamente', 'success');

                projectForm.reset();
                selectedStudents = [];
                updateStudentListView();

                modal.style.display = 'none';

                cargarProyectos(tipoActual, nivelSeleccionado);
            }else{
                mostrarAlerta(data.error || 'Error desconocido al crear el proyecto', 'error');
            }
        })
        .catch(error =>{
            console.error('Error:', error);
            mostrarAlerta('Error al crear el proyecto', 'error');
        });
    });

    function mostrarAlerta(mensaje, tipo){
        const alertaDiv = document.createElement('div');
        alertaDiv.className = `alerta ${tipo}`;
        alertaDiv.textContent = mensaje;

        document.body.appendChild(alertaDiv);

        setTimeout(() =>{
            alertaDiv.classList.add('mostrar');
            setTimeout(() =>{
                alertaDiv.classList.remove('mostrar');
                setTimeout(() =>{
                    alertaDiv.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    if(typeof updateStudentListView !== 'function'){
        function updateStudentListView(){
            studentListContainer.innerHTML = '';

            if(!selectedStudents.length){
                return;
            }

            selectedStudents.forEach(student =>{
                const fullName = `${student.nombre_Estudiante} ${student.apellido_Estudiante}`;
                const levelText = nivelMapping[student.Id_Nivel] || `Nivel ${student.Id_Nivel}`;

                const studentElement = document.createElement('div');
                studentElement.className = 'selected-student';
                studentElement.innerHTML = `
                    <input type="hidden" name="selectedStudentIds[]" value="${student.id_Estudiante}">
                    <div>
                        <span>${fullName}</span>
                        <span class="level-badge">${levelText}</span>
                    </div>
                    <span class="remove-student" data-id="${student.id_Estudiante}">&times;</span>
                `;

                const removeBtn = studentElement.querySelector('.remove-student');
                removeBtn.addEventListener('click', function(){
                    const studentId = parseInt(this.getAttribute('data-id'));
                    removeFromSelectedStudents(studentId);
                    updateStudentListView();

                    if(studentModalOverlay.style.display === 'flex'){
                        const checkbox = document.querySelector(`.student-checkbox[data-id="${studentId}"]`);
                        if(checkbox){
                            checkbox.checked = false;
                        }
                    }
                });

                studentListContainer.appendChild(studentElement);
            });
        }
    }

    if(typeof removeFromSelectedStudents !== 'function'){
        function removeFromSelectedStudents(studentId){
            selectedStudents = selectedStudents.filter(s => s.id_Estudiante !== studentId);
        }
    }

    const editProjectModal = document.createElement('div');
    editProjectModal.id = 'editProjectFormModal';
    editProjectModal.className = 'modal';

editProjectModal.innerHTML = `
    <div class="modal-content" style="background-color: #f2f2f2;">
        <span class="close-edit-btn">&times;</span>
        <h2>Editar Proyecto</h2>
        <form id="editProjectForm">
            <input type="hidden" id="editProjectId">
            <label>Nombre del proyecto</label>
            <input type="text" id="editProjectName" required>
            <label>Nivel</label>
            <select id="editProjectLevel">
                <option value="">Selecciona un nivel</option>
            </select>
            <label class="labels">Sección/Grupo</label>
            <select id="editProjectSection">
                <option value="">Selecciona una sección o grupo</option>
            </select>
            <label class="labels">Especialidad</label>
            <select id="editProjectEspecialidad">
                <option value="">Selecciona una especialidad</option>
            </select>
            <label class="labels">ID del Proyecto</label>
            <input type="text" id="editProjectID" readonly>
            <label>Estudiantes</label>
            <div id="editStudentList"></div>
            <button type="button" id="editAddStudentBtn">Agregar Estudiante</button>
            <label>Estado</label>
            <label class="switch">
                <input type="checkbox" id="editProjectStatus">
                <span class="slider"></span>
            </label>
            <span id="editStatusText" class="status-text">Activo</span>
            <div class="form-buttons">
                <button type="submit" class="update-btn">Actualizar Proyecto</button>&nbsp;
                <button type="button" id="editCancelBtn" class="cancel-btn">Cancelar</button>
            </div>
        </form>
    </div>
`;

document.body.appendChild(editProjectModal);

    const closeEditBtn = document.querySelector('.close-edit-btn');
    const editCancelBtn = document.getElementById('editCancelBtn');
    const editProjectLevelSelect = document.getElementById('editProjectLevel');
    const editProjectSectionSelect = document.getElementById('editProjectSection');
    const editProjectEspecialidadSelect = document.getElementById('editProjectEspecialidad');
    const editProjectIdInput = document.getElementById('editProjectID');
    const editProjectNameInput = document.getElementById('editProjectName');
    const editProjectStatusInput = document.getElementById('editProjectStatus');
    const editStatusText = document.getElementById('editStatusText');
    const editAddStudentBtn = document.getElementById('editAddStudentBtn');
    const editStudentListContainer = document.getElementById('editStudentList');
    const editProjectForm = document.getElementById('editProjectForm');

const editStudentModalOverlay = document.createElement('div');
editStudentModalOverlay.id = 'editStudentsModalOverlay';
editStudentModalOverlay.className = 'modal-overlay';

editStudentModalOverlay.innerHTML = `
    <div class="students-modal">
        <div class="students-modal-header">
            <h2>Seleccionar Estudiantes</h2>
            <span class="close-edit-student-btn">&times;</span>
        </div>
        <div class="filter-container">
            <select id="editNivelFilter">
                <option value="0">Todos los niveles</option>
                <option value="1">Séptimo</option>
                <option value="2">Octavo</option>
                <option value="3">Noveno</option>
                <option value="4">1° Bachillerato</option>
                <option value="5">2° Bachillerato</option>
                <option value="6">3° Bachillerato</option>
            </select>
            <input type="text" id="editStudentSearch" placeholder="Buscar por nombre o carnet">
        </div>
        <ul id="editAvailableStudentsList" class="available-students-list"></ul>
        <div class="modal-buttons">
            <button id="editSelectStudentBtn">Seleccionar</button>
            <button id="editCancelSelectionBtn">Cancelar</button>
        </div>
    </div>
`;

document.body.appendChild(editStudentModalOverlay);

const closeEditStudentBtn = document.querySelector('.close-edit-student-btn');
const editNivelFilter = document.getElementById('editNivelFilter');
const editStudentSearch = document.getElementById('editStudentSearch');
const editAvailableStudentsList = document.getElementById('editAvailableStudentsList');
const editSelectStudentBtn = document.getElementById('editSelectStudentBtn');
const editCancelSelectionBtn = document.getElementById('editCancelSelectionBtn');

let editSelectedStudents = [];
let editAvailableStudents = [];
let currentProjectId = null;
let projectStudents = [];

function editarProyecto(idProyecto) {
    console.log('Editing project:', idProyecto);
    currentProjectId = idProyecto;

    projectStudents = [];
    editSelectedStudents = [];

    const editStudentListContainer = document.getElementById('editStudentList');
    if (editStudentListContainer) {
        editStudentListContainer.innerHTML = '';
    }
    
    window.loadingProjectForEdit = true;
    
    editProjectModal.style.display = 'block';
    
    fetch(`http://localhost:5501/proyectos/${idProyecto}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Project data loaded:', data);
            
            if (!data || !data.proyecto) {
                console.error('Invalid data structure received from server:', data);
                mostrarAlerta('Error en la estructura de datos del servidor', 'error');
                return;
            }
            
            const proyecto = data.proyecto;
            
            if (!proyecto.idProyecto && !proyecto.id_Proyecto) {
                console.error('Missing required project ID field:', proyecto);
                mostrarAlerta('Datos de proyecto incompletos', 'error');
                return;
            }
            
            const projectId = proyecto.idProyecto || proyecto.id_Proyecto; 
            const projectName = proyecto.nombre_Proyecto; 
            const nivelId = proyecto.Id_Nivel;
            const seccionId = proyecto.Id_SeccionGrupo;
            const especialidadId = proyecto.Id_Especialidad;
            const estado = proyecto.Estado;
            
            window.originalProjectId = projectId;
            
            editProjectIdInput.value = projectId;
            editProjectNameInput.value = projectName || '';
            
            cargarNivelesEdicion(nivelId, () => {
                cargarSeccionGrupoEdicion(seccionId, () => {
                    cargarEspecialidadEdicion(especialidadId);
                    
                    setTimeout(() => {
                        window.loadingProjectForEdit = false;
                    }, 100);
                });
            });
            
            editProjectStatusInput.checked = estado === 'Activo' || estado === true;
            updateEditStatusText();
            
            cargarEstudiantesProyecto(idProyecto);
        })
        .catch(error => {
            console.error('Error loading project data:', error);
            mostrarAlerta('Error al cargar datos del proyecto: ' + error.message, 'error');
            window.loadingProjectForEdit = false;
        });
}

function cargarNivelesEdicion(nivelSeleccionado, callback) {
    console.log('Cargando niveles, seleccionado:', nivelSeleccionado);
    editProjectLevelSelect.innerHTML = '<option value="">Selecciona un nivel</option>';
    
    if (!nivelesData || nivelesData.length === 0) {
        console.error('No hay datos de niveles disponibles');
        if (callback) callback();
        return;
    }
    
    nivelesData.forEach(nivel => {
        const option = document.createElement('option');
        option.value = nivel.Id_Nivel;
        option.textContent = nivel.Nombre_Nivel;
        option.dataset.letra = nivel.letra_nivel;
        option.selected = nivel.Id_Nivel == nivelSeleccionado;
        editProjectLevelSelect.appendChild(option);
    });
    
    toggleEditEspecialidadSelect();
    
    if (callback) callback();
}

function cargarSeccionGrupoEdicion(seccionSeleccionada, callback) {
    console.log('Cargando secciones, seleccionada:', seccionSeleccionada);
    editProjectSectionSelect.innerHTML = '<option value="">Selecciona una sección o grupo</option>';
    
    if (!seccionesData || seccionesData.length === 0) {
        console.error('No hay datos de secciones disponibles');
        if (callback) callback();
        return;
    }
    
    seccionesData.forEach(seccion => {
        const option = document.createElement('option');
        option.value = seccion.Id_SeccionGrupo;
        option.textContent = seccion.Nombre_SeccionGrupo;
        option.selected = seccion.Id_SeccionGrupo == seccionSeleccionada;
        editProjectSectionSelect.appendChild(option);
    });
    
    if (callback) callback();
}

function cargarEspecialidadEdicion(especialidadSeleccionada) {
    console.log('Cargando especialidades, seleccionada:', especialidadSeleccionada);
    editProjectEspecialidadSelect.innerHTML = '<option value="">Selecciona una especialidad</option>';
    
    if (!especialidadesData || especialidadesData.length === 0) {
        console.error('No hay datos de especialidades disponibles');
        return;
    }
    
    especialidadesData.forEach(especialidad => {
        const option = document.createElement('option');
        option.value = especialidad.Id_Especialidad;
        option.textContent = especialidad.Nombre_Especialidad;
        option.dataset.letra = especialidad.letra_especialidad;
        option.selected = especialidad.Id_Especialidad == especialidadSeleccionada;
        editProjectEspecialidadSelect.appendChild(option);
    });
}

function cargarEstudiantesProyecto(idProyecto) {
    console.log('Cargando estudiantes del proyecto:', idProyecto);
    
    fetch(`http://localhost:5501/proyectos/${idProyecto}/estudiantes`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar estudiantes: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Estudiantes cargados:', data);
            
            if (!data || !data.estudiantes) {
                console.warn('No se encontraron estudiantes o formato incorrecto:', data);
                projectStudents = [];
                editSelectedStudents = [];
            } else {
                projectStudents = data.estudiantes;
                editSelectedStudents = [...projectStudents];
            }
            
            updateEditStudentListView();
        })
        .catch(error => {
            console.error('Error cargando estudiantes del proyecto:', error);
            mostrarAlerta('Error al cargar estudiantes', 'error');
        });
}

function updateEditStatusText() {
    editStatusText.textContent = editProjectStatusInput.checked ? 'Activo' : 'Inactivo';
}

function toggleEditEspecialidadSelect() {
    const nivelId = parseInt(editProjectLevelSelect.value);
    const esBachillerato = nivelId >= 4 && nivelId <= 6;
    
    editProjectEspecialidadSelect.disabled = !esBachillerato;
    
    if (!esBachillerato) {
        editProjectEspecialidadSelect.value = "";
    }
    
    generarIdProyectoEdicion();
}

function openEditStudentModal() {
    fetchEditAvailableStudents();
    editStudentModalOverlay.style.display = 'flex';
}

function closeEditStudentModal() {
    editStudentModalOverlay.style.display = 'none';
    editNivelFilter.value = '0';
    editStudentSearch.value = '';
}

function fetchEditAvailableStudents() {
    editAvailableStudentsList.innerHTML = '<li class="student-item">Cargando estudiantes...</li>';
    
    fetch('/estudiantes')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener estudiantes: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Estudiantes disponibles cargados:', data);
            editAvailableStudents = data;
            renderEditStudentList();
        })
        .catch(error => {
            console.error('Error:', error);
            editAvailableStudentsList.innerHTML = '<li class="student-item">Error al cargar estudiantes. Intente nuevamente.</li>';
        });
}

function renderEditStudentList() {
    if (!editAvailableStudents.length) {
        editAvailableStudentsList.innerHTML = '<li class="student-item">No hay estudiantes disponibles</li>';
        return;
    }
    
    filterEditStudents();
}

function filterEditStudents() {
    const nivelId = parseInt(editNivelFilter.value);
    const searchTerm = editStudentSearch.value.toLowerCase();
    
    let filteredStudents = editAvailableStudents;
    
    if (nivelId > 0) {
        filteredStudents = filteredStudents.filter(student => student.Id_Nivel === nivelId);
    }
    
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => {
            const fullName = `${student.nombre_Estudiante} ${student.apellido_Estudiante}`.toLowerCase();
            const carnet = student.Codigo_Carnet ? student.Codigo_Carnet.toString() : '';
            return fullName.includes(searchTerm) || carnet.includes(searchTerm);
        });
    }
    
    renderEditFilteredStudents(filteredStudents);
}

function renderEditFilteredStudents(students) {
    editAvailableStudentsList.innerHTML = '';
    
    if (!students.length) {
        editAvailableStudentsList.innerHTML = '<li class="student-item">No se encontraron estudiantes con estos criterios</li>';
        return;
    }
    
    students.forEach(student => {
        const fullName = `${student.nombre_Estudiante} ${student.apellido_Estudiante}`;
        const isAssigned = student.id_Proyecto !== null && student.id_Proyecto != currentProjectId;
        const isSelected = editSelectedStudents.some(s => s.id_Estudiante === student.id_Estudiante);
        
        const studentItem = document.createElement('li');
        studentItem.className = `student-item ${isAssigned ? 'assigned' : ''}`;
        
        const levelText = nivelMapping[student.Id_Nivel] || `Nivel ${student.Id_Nivel}`;
        
        studentItem.innerHTML = `
            <input type="checkbox" class="student-checkbox" 
                   ${isAssigned ? 'disabled' : ''} 
                   ${isSelected ? 'checked' : ''}
                   data-id="${student.id_Estudiante}">
            <div class="student-info">
                <span>${fullName}</span>
                <span class="student-carnet">Carnet: ${student.Codigo_Carnet}</span>
                <span class="level-badge">${levelText}</span>
                ${isAssigned ? '<span class="student-assigned-tag">Asignado</span>' : ''}
            </div>
        `;
        
        if (!isAssigned) {
            const checkBox = studentItem.querySelector('.student-checkbox');
            checkBox.addEventListener('change', function() {
                if (this.checked) {
                    addToEditSelectedStudents(student);
                } else {
                    removeFromEditSelectedStudents(student.id_Estudiante);
                }
            });
        }
        
        editAvailableStudentsList.appendChild(studentItem);
    });
}

function addToEditSelectedStudents(student) {
    if (!editSelectedStudents.some(s => s.id_Estudiante === student.id_Estudiante)) {
        editSelectedStudents.push(student);
    }
}

function removeFromEditSelectedStudents(studentId) {
    editSelectedStudents = editSelectedStudents.filter(s => s.id_Estudiante !== studentId);
}

function confirmEditStudentSelection() {
    updateEditStudentListView();
    closeEditStudentModal();
}

function updateEditStudentListView() {
    console.log('Actualizando lista de estudiantes:', editSelectedStudents);
    
    editStudentListContainer.innerHTML = '';
    
    if (!editSelectedStudents || editSelectedStudents.length === 0) {
        editStudentListContainer.innerHTML = '<p class="text-muted">No hay estudiantes asignados a este proyecto.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Carnet</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Acciones</th>
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    editSelectedStudents.forEach(estudiante => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${estudiante.Codigo_Carnet || ''}</td>
            <td>${estudiante.nombre_Estudiante || ''}</td>
            <td>${estudiante.apellido_Estudiante || ''}</td>
            <td>
                <button class="btn btn-sm btn-danger remove-student" 
                        data-id="${estudiante.id_Estudiante}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    editStudentListContainer.appendChild(table);
    
    document.querySelectorAll('.remove-student').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            removeStudentFromProject(studentId);
        });
    });
}

function removeStudentFromProject(studentId) {
    console.log('Eliminando estudiante:', studentId);
    
    editSelectedStudents = editSelectedStudents.filter(
        estudiante => estudiante.id_Estudiante.toString() !== studentId.toString()
    );
    
    updateEditStudentListView();
    
    mostrarAlerta('Estudiante eliminado del proyecto', 'success');
}

editProjectLevelSelect.addEventListener('change', toggleEditEspecialidadSelect);
    editProjectStatusInput.addEventListener('change', updateEditStatusText);
    editAddStudentBtn.addEventListener('click', openEditStudentModal);
    closeEditBtn.addEventListener('click', () => {
        editProjectModal.style.display = 'none';
    });
    editCancelBtn.addEventListener('click', () => {
        editProjectModal.style.display = 'none';
    });
    closeEditStudentBtn.addEventListener('click', closeEditStudentModal);
    editCancelSelectionBtn.addEventListener('click', closeEditStudentModal);
    editSelectStudentBtn.addEventListener('click', confirmEditStudentSelection);
    editNivelFilter.addEventListener('change', filterEditStudents);
    editStudentSearch.addEventListener('input', filterEditStudents);

    editProjectForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!editProjectNameInput.value.trim()) {
            alert('Por favor, ingrese un nombre para el proyecto');
            return;
        }
        
        const projectData = {
            idProyecto: editProjectIdInput.value,
            nombre: editProjectNameInput.value.trim(),
            nivelId: parseInt(editProjectLevelSelect.value),
            seccionId: parseInt(editProjectSectionSelect.value),
            especialidadId: editProjectEspecialidadSelect.disabled ? null : parseInt(editProjectEspecialidadSelect.value),
            estado: editProjectStatusInput.checked,
            estudiantesIds: editSelectedStudents.map(student => student.id_Estudiante)
        };
        
        if (!projectData.nivelId || !projectData.seccionId) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        console.log('Enviando datos de actualización:', projectData);
        
        fetch('http://localhost:5501/actualizarProyecto', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al actualizar el proyecto: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                mostrarAlerta('Proyecto actualizado exitosamente', 'success');
                editProjectModal.style.display = 'none';
                cargarProyectos(tipoActual, nivelSeleccionado);
            } else {
                mostrarAlerta(data.error || 'Error desconocido al actualizar el proyecto', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('Error al actualizar el proyecto: ' + error.message, 'error');
        });
    });

    function cargarProyectos(tipo, filtroNivel = null) {
        fetch('http://localhost:5501/proyectos')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar proyectos: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Proyectos cargados:', data);
                proyectosData = data;
                proyectosContainer.innerHTML = '';
                let count = 0;

                if (!data[tipo]) {
                    console.error('Error: No hay datos para el tipo', tipo);
                    proyectosContainer.innerHTML = `<tr><td colspan="3">No hay proyectos disponibles para ${tipo}</td></tr>`;
                    totalProyectos.textContent = 0;
                    return;
                }

                let proyectosFiltrados = data[tipo];

                if(filtroNivel !== null) {
                    proyectosFiltrados = proyectosFiltrados.filter(p => p.Id_Nivel == filtroNivel);
                }

                if(proyectosFiltrados.length === 0) {
                    proyectosContainer.innerHTML = `<tr><td colspan="3">No hay proyectos disponibles</td></tr>`;
                    totalProyectos.textContent = 0;
                } else {
                    proyectosFiltrados.forEach(proyecto => {
                        count++;
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="estado">
                                <div class="circulo ${proyecto.Estado === 'Activo' ? 'verde' : 'rojo'}"></div>
                                ${proyecto.Nombre_Proyecto}
                            </td>
                            <td>${proyecto.Estado}</td>
                            <td>
                                <button id="btn-link" data-url="${proyecto.Google_Sites || '#'}">Google Sites &nbsp;<img src="/link.png" alt=""></button>
                                <button class="btn-editar" data-id="${proyecto.IdProyecto}">Editar &nbsp;<img src="/Vector.png" alt=""></button>
                            </td>
                        `;
                        proyectosContainer.appendChild(tr);
                        
                        const editBtn = tr.querySelector('.btn-editar');
                        if (editBtn) {
                            editBtn.addEventListener('click', function() {
                                const projectId = this.getAttribute('data-id');
                                console.log('Edit button clicked with ID:', projectId);
                                if (projectId) {
                                    editarProyecto(projectId);
                                }
                            });
                        }
                        
                        const linkBtn = tr.querySelector('#btn-link');
                        if (linkBtn) {
                            linkBtn.addEventListener('click', function() {
                                const url = this.getAttribute('data-url');
                                if (url && url !== '#') {
                                    window.open(url, '_blank');
                                }
                            });
                        }
                    });
                }

                totalProyectos.textContent = count;
            })
            .catch(error => {
                console.error('Error cargando proyectos:', error);
                proyectosContainer.innerHTML = `<tr><td colspan="3">Error al cargar proyectos: ${error.message}</td></tr>`;
                totalProyectos.textContent = 0;
            });
    }
    
    window.editarProyecto = editarProyecto;
    editarProyectoGlobal = editarProyecto;

    editProjectLevelSelect.addEventListener('change', function() {
        toggleEditEspecialidadSelect();
        generarIdProyectoEdicion();
    });

    editProjectSectionSelect.addEventListener('change', function() {
        generarIdProyectoEdicion();
    });

    editProjectEspecialidadSelect.addEventListener('change', function() {
        generarIdProyectoEdicion();
    });

    async function obtenerNumeroProyectoEdicion(idProyectoActual) {
        const nivelId = editProjectLevelSelect.value;
        const seccionId = editProjectSectionSelect.value;
        const especialidadId = editProjectEspecialidadSelect.value;
        
        if (!nivelId || !seccionId || (editProjectEspecialidadSelect.disabled === false && !especialidadId)) {
            return "01";
        }
        
        try {
            let prefijo;
            if (parseInt(nivelId) >= 4 && parseInt(nivelId) <= 6) {
                const especialidad = especialidadesData.find(e => e.Id_Especialidad == especialidadId);
                const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
                if (!especialidad || !nivel) return "01";
                prefijo = especialidad.letra_especialidad + nivel.letra_nivel;
            } else {
                const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
                const seccion = seccionesData.find(s => s.Id_SeccionGrupo == seccionId);
                if (!nivel || !seccion) return "01";
                prefijo = nivel.letra_nivel + seccion.Nombre_SeccionGrupo;
            }
            
            const idActualParts = idProyectoActual.match(/([A-Z0-9]+)(\d{2})-(\d{2})/);
            if (idActualParts && idActualParts[1] === prefijo) {
                return idActualParts[2];
            }
            
            const response = await fetch(`http://localhost:5501/proyectosId?prefijo=${prefijo}`);
            const proyectos = await response.json();
            
            if (!proyectos || proyectos.length === 0) {
                return "01";
            }
            
            let maxNumero = 0;
            proyectos.forEach(proyecto => {
                const match = proyecto.id_Proyecto.match(/[A-Z0-9]+(\d{2})-\d{2}/);
                if (match && match[1]) {
                    const num = parseInt(match[1]);
                    if (num > maxNumero) {
                        maxNumero = num;
                    }
                }
            });
            
            return (maxNumero + 1).toString().padStart(2, '0');
        } catch (error) {
            console.error('Error obteniendo el número de proyectos:', error);
            return "01";
        }
    }

    async function generarIdProyectoEdicion() {
        if (window.loadingProjectForEdit) {
            console.log('Cargando proyecto, no se regenera ID');
            return;
        }
        
        const nivelId = editProjectLevelSelect.value;
        const seccionId = editProjectSectionSelect.value;
        const especialidadId = editProjectEspecialidadSelect.value;
        
        const idProyectoActual = window.originalProjectId || editProjectIdInput.value;
        
        if (!nivelId || !seccionId || (editProjectEspecialidadSelect.disabled === false && !especialidadId)) {
            return;
        }
        
        const year = "25"; 
        
        const numeroProyecto = await obtenerNumeroProyectoEdicion(idProyectoActual);
        
        let idProyecto = "";
        
        if (parseInt(nivelId) >= 4 && parseInt(nivelId) <= 6) {
            const especialidad = especialidadesData.find(e => e.Id_Especialidad == especialidadId);
            const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
            
            if (especialidad && nivel) {
                idProyecto = especialidad.letra_especialidad + nivel.letra_nivel + numeroProyecto + "-" + year;
            }
        } else {
            const nivel = nivelesData.find(n => n.Id_Nivel == nivelId);
            const seccion = seccionesData.find(s => s.Id_SeccionGrupo == seccionId);
            
            if (nivel && seccion) {
                idProyecto = nivel.letra_nivel + seccion.Nombre_SeccionGrupo + numeroProyecto + "-" + year;
            }
        }
        
        if (idProyecto && idProyecto !== idProyectoActual) {
            console.log(`ID del proyecto cambiado: ${idProyectoActual} -> ${idProyecto}`);
        }
        
        if (idProyecto) {
            editProjectIdInput.value = idProyecto;
        }
    }
});