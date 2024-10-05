document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productoForm');
    const nombreProducto = document.getElementById('nombreProducto');
    const descripcionProducto = document.getElementById('descripcionProducto');
    const btnAddProduct = document.getElementById('btn-addProduct');

    document.getElementById('btn-addProduct').addEventListener('click', e => {
        // Prevenir el envío automático del formulario
        e.preventDefault();

        // Mostrar alerta de éxito con SweetAlert2
        Swal.fire({
            title: 'Producto Agregado Exitosamente',
            icon: 'success',
            showConfirmButton: false, // Eliminar el botón de confirmación
            timer: 1500 // Mostrar el mensaje durante 2 segundos
        });

        // Usar setTimeout para retrasar el envío del formulario
        setTimeout(() => {
            document.getElementById('productoForm').submit();
        }, 1500); // Retrasar 1.5 segundos antes de enviar el formulario
    });

    // Función para habilitar/deshabilitar el botón si los campos están llenos
    function checkForm() {
        // Si ambos campos tienen valor, habilitamos el botón
        if (nombreProducto.value.trim() !== '' && descripcionProducto.value.trim() !== '') {
            btnAddProduct.disabled = false;
        } else {
            btnAddProduct.disabled = true;
        }
    }

    // Escuchamos los eventos input en los campos del formulario
    nombreProducto.addEventListener('input', checkForm);
    descripcionProducto.addEventListener('input', checkForm);

    // Verificamos al cargar la página para el caso de que los campos ya tengan algún valor
    document.addEventListener('DOMContentLoaded', checkForm);

});

function deleteProduct(id) {
    Swal.fire({
        title: '¿Desea eliminar el producto? Sku: ' + id,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Producto eliminado exitosamente',
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            }).then((result) => {
                setTimeout(() => {
                    window.location.href = "/deleteProduct/" + id;
                }, 1000);

            })
        } else if (result.isDenied) {
            Swal.fire('El producto no ha sido eliminado', '', 'info')
        }
    })
}

