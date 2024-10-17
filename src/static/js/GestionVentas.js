// Función para realizar la búsqueda con AJAX
//Monto total de la venta
var montoTotal = 0.00;

$('#btn-searchClient').on('click', function () {
    const query = $("#cedulaCliente").val();
    document.getElementById("NombreCliente").value = "";
    document.getElementById("direccionCliente").value = "";
    document.getElementById("telefonoCliente").value = "";
    // Verificar si el usuario ha escrito algo
    if (query.length > 0) {
        showLoadingModal();
        // Realizar la solicitud AJAX
        $.ajax({
            url: '/buscar_cliente', // Ruta a tu API o servidor
            method: 'GET',
            data: { query: query },
            success: function (response) {

                // Verificar si se encontraron resultados
                if (response && response.nombres && response.apellidos) {
                    // Si hay datos de cliente
                    document.getElementById("btnInitSell").removeAttribute("aria-disabled");
                    document.getElementById("NombreCliente").value = response.nombres + " " + response.apellidos;
                    document.getElementById("direccionCliente").value = response.direccion;
                    document.getElementById("telefonoCliente").value = response.telefono;

                    // Habilita botón para ventas
                    document.getElementById("btnInitSell").classList.remove('disabled');
                    hideLoadingModal();

                } else {
                    hideLoadingModal();
                    // Si no se encontraron resultados
                    showErrorgModal();
                }
            },
            error: function () {
                hideLoadingModal();
                // Manejo de errores si la solicitud AJAX falla
                showErrorgModal();
            }
        });
    } else {
        hideLoadingModal();
        alert("Por favor, ingrese una cédula.");
    }
});

$('#btnInitSell').on('click', function () {
    //Deshabilita boton de la venta
    document.getElementById("btnInitSell").classList.add('disabled');

    //agregar busqueda de productos
    $('#contetn-gestProduct').append(`
        <div class="card-header">Buscar Producto</div>
        <div class="card-body">
            <form id="productoForm">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="codigoProducto" class="form-label">Código del Producto</label>
                        <div class="mb-4">
                            <div id="btn_code">
                                <input style="width: auto; display: inline;" type="text" id="buscador"
                                class="form-control" placeholder="Buscar productos...">
                            </div>
                            
                            <!-- Lista de resultados -->
                            <ul style="position: relative;" id="listaResultados" class="list-group mt-2">
                                <!-- Los resultados de la búsqueda se llenarán aquí dinámicamente -->
                            </ul>
                        </div>

                    </div>
                    <div class="col-md-6">
                        <div id="formProduct" class="formProduct">

                        </div>
                    </div>
                </div>
            </form>
        </div>
        
        `);


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
                                `<li class="list-group-item item" data-id="${producto.productoid}" data-name="${producto.nombre}" data-description="${producto.descripcion}">${producto.nombre} - ${producto.descripcion} - Código: ${producto.productoid}</li>`
                            );
                        });

                        document.querySelectorAll(".item").forEach(function (li) {
                            li.addEventListener("click", function () {

                                // Obtener el ID del cliente del botón
                                let productoID = this.getAttribute("data-id");
                                let productName = this.getAttribute("data-name");
                                let productDescripcion = this.getAttribute("data-description");
                                let productQuantity = "";
                                let productPrice = "";


                                $('#listaResultados').empty();

                                $('#btn_code').append(`<button id="btn-close" type="button" class="btn-close ms-2" aria-label="Close" style="background-color:red;" onClick="removeFormProduct()"></button>`);

                                document.getElementById("buscador").setAttribute("disabled", true);
                                // Rellenar el formulario del modal con los datos del cliente
                                $('#formProduct').append(
                                    `
                                        <div class="mb-3">
                                            <label for="NombreProducto" class="form-label">Nombre | Descripcion:</label>
                                            <input type="text" class="form-control" id="NombreProducto" placeholder="nombre" value="${productName} - ${productDescripcion}" disabled>
                                        </div>
                                        <div class="mb-3">
                                            <label for="PrecioProducto" class="form-label">Precio:</label>
                                            <input type="number" class="form-control" id="PrecioProducto" placeholder="precio" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="CantidadProducto" class="form-label">Cantidad</label>
                                            <input type="number" class="form-control" id="CantidadProducto" placeholder="Ingrese la cantidad" required>
                                        </div>
                                        <button id="addProductList" type="button" class="btn btn-success">Agregar</button>
                                        `
                                );

                                document.getElementById("buscador").value = productoID;

                                //Agregar productos
                                $('#addProductList').on('click', function () {
                                    window.location.href = "#tableProducts";
                                    if (document.getElementById("PrecioProducto").value != '' && document.getElementById("CantidadProducto").value != '') {

                                        productPrice = document.getElementById("PrecioProducto").value;
                                        productQuantity = document.getElementById("CantidadProducto").value;

                                        //Suma al monto total
                                        montoTotal = montoTotal + (productPrice * productQuantity);

                                        //Agrega productos a la tabla
                                        $('#tablaProductos').append(
                                            `
                                            <tr data-id="${productoID}">
                                                <td>${productoID}</td>
                                                <td>${productName} - ${productDescripcion}</td>
                                                <td>${productQuantity}</td>
                                                <td>${productPrice}</td>
                                                <td>
                                                    <button type="button" class="btn-close" aria-label="Close" style="background-color:red;"></button>
                                                </td>
                                            </tr>
                                            `
                                        )

                                        //habilita boton de guardar venta
                                        document.getElementById("btn-guardarVenta").removeAttribute("disabled");
                                        //muestra monto total
                                        document.getElementById("montoTotal").textContent = montoTotal;

                                    } else {
                                        alert("completa los campos");
                                    }

                                });

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

// Función para mostrar el modal de carga
function showLoadingModal() {
    let loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
}

function showErrorgModal() {
    let loadingModal = new bootstrap.Modal(document.getElementById('errorModal'));
    loadingModal.show();
}

// Función para ocultar el modal de carga
function hideLoadingModal() {
    let loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (loadingModal) {
        loadingModal.hide();
    }
}
