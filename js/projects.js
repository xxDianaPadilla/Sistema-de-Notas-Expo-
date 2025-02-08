document.addEventListener('DOMContentLoaded', () =>{
    const proyectosContainer = document.getElementById('proyectos-container');
    const tabs = document.querySelectorAll('.tab');

    function cargarProyectos(tipo){
        fetch('http://localhost:5501/proyectos')
        .then(response => response.json())
        .then(data =>{
            proyectosContainer.innerHTML = '';
            data[tipo].forEach(proyecto =>{
                const div = document.createElement('div');
                div.classList.add('proyecto');
                div.innerHTML = `
                        <span>${proyecto.Nombre_Proyecto} - ${proyecto.Estado}</span>
                        <div>
                           <button id="btn-link" onclick="window.open('${proyecto.Google_Sites}', '_blank')">Google Sites &nbsp;<img src="/link.png" alt=""></button>
                           <button id="btn-editar" onclick="editarProyecto(${proyecto.IdProyecto})">Editar &nbsp;<img src="/Vector.png" alt=""></button>
                        </div>
                    `;
                    proyectosContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error cargando proyectos:', error));
    }

    function cambiarTab(event){
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        cargarProyectos(event.target.dataset.tab);
    }

    tabs.forEach(tab => tab.addEventListener('click', cambiarTab));

    cargarProyectos('tercerCiclo');
});