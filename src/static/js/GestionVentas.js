
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

                            console.log("button");
                            // Obtener el ID del cliente del botón
                            let productoID = this.getAttribute("data-id");

                            // Rellenar el formulario del modal con los datos del cliente
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

