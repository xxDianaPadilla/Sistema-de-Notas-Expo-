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
});