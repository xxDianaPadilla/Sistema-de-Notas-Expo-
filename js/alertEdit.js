import Swal from 'sweetalert2'
const Swal = require('sweetalert2')

Swal.btn({
    title: "¿Quieres guardar los cambios?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    denyButtonText: `No guardar`
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Swal.btn("Guardado!", "", "Se ha guadado existosamente");
    } else if (result.isDenied) {
      Swal.btn("Los cambios no se han guadado", "", "info");
    }
  });


