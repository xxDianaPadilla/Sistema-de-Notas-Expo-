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

    function cargarProyectos(tipo, filtroNivel = null) {
        fetch('http://localhost:5501/proyectos')
            .then(response => response.json())
            .then(data => {
                proyectosData = data;
                proyectosContainer.innerHTML = '';
                let count = 0;

                if (!data[tipo]) {
                    console.error('Error: No hay datos para el tipo', tipo);
                    return;
                }

                let proyectosFiltrados = data[tipo];

                if(filtroNivel !== null){
                    proyectosFiltrados = proyectosFiltrados.filter(p => p.Id_Nivel == filtroNivel);
                }

                if(proyectosFiltrados.length === 0){
                    proyectosContainer.innerHTML = `<tr><td colspan="3">No hay proyectos disponibles</td></tr>`;
                }else{
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
                            <button id="btn-link" onclick="window.open('${proyecto.Google_Sites}', '_blank')">Google Sites &nbsp;<img src="/link.png" alt=""></button>
                            <button id="btn-editar" onclick="editarProyecto(${proyecto.IdProyecto})">Editar &nbsp;<img src="/Vector.png" alt=""></button>
                        </td>
                    `;
                    proyectosContainer.appendChild(tr);
                });
            }

                totalProyectos.textContent = count;
            })
            .catch(error => console.error('Error cargando proyectos:', error));
    }

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
});