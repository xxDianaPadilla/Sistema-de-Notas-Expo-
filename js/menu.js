/*const menuHamburguesa = document.querySelector(".menu-hamburguesa");
const menuLateral = document.querySelector(".menu-lateral");
const overlay = document.querySelector(".overlay");

menuHamburguesa.addEventListener("click", () => {
  menuLateral.classList.toggle("mostrar"); 
  overlay.classList.toggle("mostrar");
});

overlay.addEventListener("click", () => {
  menuLateral.classList.remove("mostrar");
  overlay.classList.remove("mostrar");
});*/


document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
});

async function cargarProgreso() {
  try {
      const res = await fetch('http://localhost:5501/etapa-actual');
      const etapa = await res.json();

      const colores = {
          'Anteproyecto': 'gray',
          '30%': '#E00526',
          '50%': '#F7C100',
          '80%': 'purple',
          '100%': '#4CAF50'
      };

      const progreso = document.querySelector('#progreso');
      const porcentaje = document.querySelector('#porcentaje');
      
      if (etapa.porcentaje_etapa) {
          porcentaje.textContent = etapa.porcentaje_etapa;
          progreso.style.width = etapa.porcentaje_etapa;
          progreso.style.backgroundColor = colores[etapa.porcentaje_etapa] || 'white';
      } else {
          porcentaje.textContent = 'Sin etapa activa';
          progreso.style.width = '0%';
          progreso.style.backgroundColor = 'white';
      }
  } catch (err) {
      console.error('Error al cargar la etapa actual:', err);
  }
}