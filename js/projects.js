document.addEventListener('DOMContentLoaded', () =>{
    const proyectosContainer = document.getElementById('proyectos-container');
    const totalProyectos = document.getElementById('totalProyectos');
    const tabs = document.querySelectorAll('.tab');

    function cargarProyectos(tipo) {
        fetch('http://localhost:5501/proyectos')
            .then(response => response.json())
            .then(data => {
                proyectosContainer.innerHTML = '';
                let count = 0;

                data[tipo].forEach(proyecto => {
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

                totalProyectos.textContent = count;
            })
            .catch(error => console.error('Error cargando proyectos:', error));
    }

    function cambiarTab(event){
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        cargarProyectos(event.target.dataset.tab);
    }

    tabs.forEach(tab => tab.addEventListener('click', cambiarTab));

    function filtrarProyectos() {
        const search = document.getElementById('buscar').value.toLowerCase();
        const rows = document.querySelectorAll('#proyectos-container tr');

        rows.forEach(row => {
            const nombre = row.querySelector('td.estado').textContent.toLowerCase();
            row.style.display = nombre.includes(search) ? '' : 'none';
        });
    }

    cargarProyectos('tercerCiclo');
});