const menuHamburguesa = document.querySelector(".menu-hamburguesa");
const menuLateral = document.querySelector(".menu-lateral");
const overlay = document.querySelector(".overlay");

menuHamburguesa.addEventListener("click", () => {
  menuLateral.classList.toggle("mostrar"); 
  overlay.classList.toggle("mostrar");
});

overlay.addEventListener("click", () => {
  menuLateral.classList.remove("mostrar");
  overlay.classList.remove("mostrar");
});
