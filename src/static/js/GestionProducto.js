document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productoForm');
    const nombreProducto = document.getElementById('nombreProducto');
    const descripcionProducto = document.getElementById('descripcionProducto');

    document.getElementById('btnFormAddProd').addEventListener('click', e => {
        nombreProducto.value = '';
        descripcionProducto.value = '';
        var btnGuardar = document.getElementById('btn-editProduct');
        btnGuardar.id = 'btn-addProduct';
    });

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
        var btnAddProduct = document.getElementById('btn-addProduct');
        if (!btnAddProduct) {
            btnAddProduct = document.getElementById('btn-editProduct');
        }

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

document.querySelectorAll('.btnEditProduct').forEach(function (button) {
    button.addEventListener('click', function () {

        // Obtener la fila de la tabla correspondiente al cliente
        let row = this.closest('tr');
        let producId = row.cells[0].innerText;
        let nombre = row.cells[1].innerText;  // Columna Nombres
        let descripcion = row.cells[2].innerText;  // Columna Apellidos

        // Rellenar el formulario del modal con los datos del cliente
        document.getElementById('nombreProducto').value = nombre;
        document.getElementById('descripcionProducto').value = descripcion;

        // Mostrar el modal
        let editModal = new bootstrap.Modal(document.getElementById('productoModal'));
        // Selecciona el formulario
        var formulario = document.getElementById('productoForm');
        var btnGuardar = document.getElementById('btn-addProduct');

        btnGuardar.id = 'btn-editProduct';

        // Cambia la ruta de acción del formulario
        formulario.action = '/updateProduct/' + producId;

        document.getElementById('btn-editProduct').addEventListener('click', e => {
            // Prevenir el envío automático del formulario
            e.preventDefault();

            // Mostrar alerta de éxito con SweetAlert2
            Swal.fire({
                title: 'Producto modificado Exitosamente',
                icon: 'success',
                showConfirmButton: false, // Eliminar el botón de confirmación
                timer: 1500 // Mostrar el mensaje durante 2 segundos
            });

            // Usar setTimeout para retrasar el envío del formulario
            setTimeout(() => {
                document.getElementById('productoForm').submit();
            }, 1500); // Retrasar 1.5 segundos antes de enviar el formulario

        });

        editModal.show();


    });
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

