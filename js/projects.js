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

    let proyectosData = {tercerCiclo: [], bachillerato: []};
    let tipoActual = 'tercerCiclo';
    let nivelSeleccionado = null;

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
});