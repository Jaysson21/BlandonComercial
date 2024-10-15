// Función para realizar la búsqueda con AJAX
$('#buscador').on('keyup', function () {
    const query = $(this).val();

    // Verificar si el usuario ha escrito algo
    if (query.length > 0) {
        // Realizar la solicitud AJAX
        $.ajax({
            url: '/buscar_producto', // Ruta a tu API o servidor
            method: 'GET',
            data: { query: query },
            success: function (response) {
                // Limpiar resultados anteriores
                $('#listaResultados').empty();

                // Verificar si se encontraron resultados
                if (response.length > 0) {
                    // Agregar cada resultado como un <li> en la lista
                    response.forEach(function (producto) {
                        $('#listaResultados').append(
                            `<li class="list-group-item item" data-id="${producto.productoid}">${producto.nombre} - Código: ${producto.productoid}</li>`
                        );
                    });

                    document.querySelectorAll(".item").forEach(function (li) {
                        li.addEventListener("click", function () {

                            // Obtener el ID del cliente del botón
                            let productoID = this.getAttribute("data-id");
                            $('#listaResultados').empty();

                            $('#btn_code').append(`<button id="btn-close" type="button" class="btn-close ms-2" aria-label="Close" style="background-color:red;" onClick="removeFormProduct()"></button>`);

                            document.getElementById("buscador").setAttribute("disabled", true);
                            // Rellenar el formulario del modal con los datos del cliente
                            $('#formProduct').append(
                                `
                                <div class="mb-3">
                                    <label for="PrecioProducto" class="form-label">Precio:</label>
                                    <input type="text" class="form-control" id="PrecioProducto" placeholder="precio" required>
                                </div>
                                <div class="mb-3">
                                    <label for="CantidadProducto" class="form-label">Cantidad</label>
                                    <input type="number" class="form-control" id="CantidadProducto" placeholder="Ingrese la cantidad" required>
                                </div>
                                <button type="button" class="btn btn-success">Agregar</button>
                                `
                            );

                            document.getElementById("buscador").value = productoID;


                        });
                    });
                } else {
                    // Si no hay resultados
                    $('#listaResultados').append('<li class="list-group-item">No se encontraron productos.</li>');
                }
            }
        });
    } else {
        // Limpiar resultados si la búsqueda es muy corta
        $('#listaResultados').empty();
    }
});

$('#btn-searchClient').on('click', function () {
    const query = $("#cedulaCliente").val();
    // Verificar si el usuario ha escrito algo
    if (query.length > 0) {
        // Realizar la solicitud AJAX
        $.ajax({
            url: '/buscar_cliente', // Ruta a tu API o servidor
            method: 'GET',
            data: { query: query },
            success: function (response) {
                // Verificar si se encontraron resultados
                console.log(response);

                document.getElementById("btnInitSell").removeAttribute("aria-disabled");
                document.getElementById("NombreCliente").value = response.nombres + " " + response.apellidos;
                document.getElementById("direccionCliente").value = response.direccion;
                document.getElementById("telefonoCliente").value = response.telefono;

            }
        })
    }
});

function removeFormProduct() {
    let ul = document.getElementById("formProduct");
    // Limpia el <ul> eliminando todos sus elementos hijos
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    document.getElementById("buscador").removeAttribute("disabled");
    document.getElementById("buscador").value = "";
    document.getElementById('btn-close').remove();


}

