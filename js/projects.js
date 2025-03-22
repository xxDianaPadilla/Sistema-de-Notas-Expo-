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

    let proyectosData = {tercerCiclo: [], bachillerato: []};
    let tipoActual = 'tercerCiclo';
    let nivelSeleccionado = null;
    let nivelesData = [];
    let seccionesData = [];
    let especialidadesData = [];

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
                const especialidad = especialidadesData.find(e => e.Id_SeccionGrupo == seccionId);
                const nivel = nivelesData.find(n => n.Id_Nivel) == nivelId;
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
            proyectos.forEach(proyecto =>{
                const match = proyecto.id_Proyecto.match(/[A-Z0-9]{2}(\d{2})-\d{2}/);
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
});