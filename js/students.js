document.addEventListener("DOMContentLoaded", () => {
    const tipoCat1 = document.querySelector('.tipoCat1');
    const tipoCat2 = document.querySelector('.tipoCat2');
    const bachilleratoTab   = document.querySelector('.tipoBachillerato');
    const tercerCicloTab  = document.querySelector('.tipoTercerCiclo');
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

    // Resaltar la sección activa al cargar la página
    if (window.location.pathname.includes('students.html')) {
        tipoCat2.classList.add('active');
        tipoCat1.classList.remove('active');
    } else {
        tipoCat1.classList.add('active');
        tipoCat2.classList.remove('active');
    }

    // Agregar evento de clic para tipoCat1
    tipoCat1.addEventListener('click', () => {
        tipoCat1.classList.add('active');
        tipoCat2.classList.remove('active');
        location.href = '/users.html'; // Navegar a usuarios
    });

    // Agregar evento de clic para tipoCat2
    tipoCat2.addEventListener('click', () => {
        tipoCat2.classList.add('active');
        tipoCat1.classList.remove('active');
        location.href = '/students.html'; // Navegar a estudiantes
    });

    let currentTab = 'bachillerato';

    loadStudents('bachillerato', 0);

    tercerCicloTab.addEventListener('click', function(){
        setActiveTab('tercerCiclo');
        loadStudents('tercerCiclo', 0);
    });

    bachilleratoTab.addEventListener('click', function(){
        setActiveTab('bachillerato');
        loadStudents('bachillerato', 0);
    });

    tercerCicloFilterSelect.addEventListener('change', function(){
        loadStudents('tercerCiclo', this.value);
    });

    bachilleratoFilterSelect.addEventListener('change', function(){
        loadStudents('bachillerato', this.value);
    });

    searchInput.addEventListener('input', function(){
        if(currentTab === 'tercerCiclo'){
            loadStudents('tercerCiclo', tercerCicloFilterSelect.value, this.value);
        }else{
            loadStudents('bachillerato', bachilleratoFilterSelect.value, this.value);
        }
    });

    function setActiveTab(tab){
        currentTab = tab;

        if(tab === 'tercerCiclo'){
            tercerCicloTab.classList.add('active');
            bachilleratoTab.classList.remove('active');
            tercerCicloFilters.classList.add('active');
            bachilleratoFilters.classList.remove('active');
        }else{
            bachilleratoTab.classList.add('active');
            tercerCicloTab.classList.remove('active');
            bachilleratoFilters.classList.add('active');
            tercerCicloFilters.classList.remove('active');
        }
    }

    function loadStudents(tabType, nivelId, searchTerm = ''){
        let minNivel, maxNivel;

        if(tabType === 'tercerCiclo'){
            minNivel = 1;
            maxNivel = 3;
        }else{
            minNivel = 4;
            maxNivel = 6;
        }

        let url = '/api/estudiantes?';

        if(nivelId && nivelId != 0){
            url += `nivel=${nivelId}`;
        }else{
            url += `minNivel=${minNivel}&maxNivel=${maxNivel}`;
        }

        if(searchTerm){
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        fetch(url)
        .then(response => response.json())
        .then(students =>{
            cardContainer.innerHTML = '';

            students.forEach(student =>{
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

            if(students.length === 0){
                cardContainer.innerHTML = '<p>No se encontraron estudiantes con los criterios seleccionados.</p>';
            }
        })
        .catch(error =>{
            console.error('Error fetching students:', error);
            cardContainer.innerHTML = '<p>Error al cargar los estudiantes. Por favor, intente nuevamente.</p>';
        });
    }

    loadNiveles();
    loadSecciones();
    loadEspecialidades();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) =>{
        if(e.target == modal) closeModal();
    });

    document.addEventListener('click', (e) =>{
        if(e.target.classList.contains('btn-edit')){
            openEditModal(e.target);
        }
    });

    levelSelect.addEventListener('change', () =>{
        const nivelId = parseInt(levelSelect.value);

        if(nivelId >= 4 && nivelId <= 6){
            especialidadGroup.style.display = 'block';
            document.getElementById('editStudentSpeciality').required = true;
        }else{
            especialidadGroup.style.display = 'none';
            document.getElementById('editStudentSpeciality').required = false;
            document.getElementById('editStudentSpeciality').value = '';
        }
    });

    form.addEventListener('submit', (e) =>{
        e.preventDefault();
        updateStudent();
    });

    function openEditModal(button){
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

        if(proyectoId){
            loadProjectInfo(proyectoId);
        }else{
            document.getElementById('editStudentProject').value = 'No asignado';
        }

        modal.style.display = 'block';
    }

    function closeModal(){
        modal.style.display = 'none';
        form.reset();
    }

    async function loadNiveles(){
        try{
            const response = await fetch('/api/niveles');
            if(!response.ok) throw new Error('Error al cargar niveles');

            const niveles = await response.json();
            const select = document.getElementById('editStudentLevel');

            select.innerHTML = '<option value="">Seleccione un nivel</option>';

            niveles.forEach(nivel =>{
                const option = document.createElement('option');
                option.value = nivel.Id_Nivel;
                option.textContent = nivel.Nombre_Nivel;
                select.appendChild(option);
            });
        }catch(error){
            console.error('Error:', error);
            alert('No se puedieron cargar los niveles');
        }
    }

    async function loadSecciones(){
        try{
            const response = await fetch('/api/secciones');
            if(!response.ok) throw new Error('Error al cargar secciones');

            const secciones = await response.json();
            const select = document.getElementById('editStudentSection');

            select.innerHTML = '<option value="">Seleccione una sección</option>';

            secciones.forEach(seccion =>{
                const option = document.createElement('option');
                option.value = seccion.Id_SeccionGrupo;
                option.textContent = seccion.Nombre_SeccionGrupo;
                select.appendChild(option);
            });
        }catch(error){
            console.error('Error:', error);
            alert('No se pudieron cargar las secciones');
        }
    }

    async function loadEspecialidades(){
        try{
            const response = await fetch('/api/especialidades');
            if(!response.ok) throw new Error('Error al cargar especialidades');

            const especialidades = await response.json();
            const select = document.getElementById('editStudentSpeciality');

            select.innerHTML = '<option value="">Seleccione una especialidad</option>';

            especialidades.forEach(especialidad =>{
                const option = document.createElement('option');
                option.value = especialidad.Id_Especialidad;
                option.textContent = especialidad.Nombre_Especialidad;
                select.appendChild(option);
            });
        }catch(error){
            console.error('Error:', error);
            alert('No se pudieron cargas las especialidades');
        }
    }

    async function loadProjectInfo(proyectoId){
        try {
            const response = await fetch(`/api/proyectos/${proyectoId}`);
            if(!response.ok) throw new Error('Error al cargar proyecto');

            const proyecto = await response.json();
            document.getElementById('editStudentProject').value = `${proyecto.nombre_Proyecto} (${proyecto.id_Proyecto})`;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('editStudentProject').value = 'Error al cargar proyecto';
        }
    }

    async function updateStudent(){
        const studentId = document.getElementById('editStudentId').value;
        const studentName = document.getElementById('editStudentName').value;
        const studentLastName = document.getElementById('editStudentLastName').value;
        const niveld = document.getElementById('editStudentLevel').value;
        const seccionId = document.getElementById('editStudentSection').value;
        let especialidadId = null;

        if(parseInt(niveld) >= 4 && parseInt(niveld) <= 6){
            especialidadId = document.getElementById('editStudentSpeciality').value;
            if(!especialidadId){
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

            if(!response.ok){
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
});