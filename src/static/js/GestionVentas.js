// Función para realizar la búsqueda con AJAX
//Monto total de la venta
var montoTotal = 0.00;
var ClienteID = 0;

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
                    ClienteID = response.clienteid;
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
        Swal.fire({
            title: "No se encontro resultados",
            text: 'Por favor, ingrese una cédula.',
            icon: "info",
        });
    }
});

$('#btnInitSell').on('click', function () {
    showModaTipoVenta();

    $('#btnGuardarTipoVenta').on('click', function () {
        //Deshabilita boton de la venta
        document.getElementById('btnInitSell').classList.add('disabled');
        hideModalTipoVenta();

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
                                                <label for="PrecioProducto" class="form-label">Precio C$:</label>
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
                                        window.location.href = "#containerProducts";
                                        if (document.getElementById("PrecioProducto").value != '' && document.getElementById("CantidadProducto").value != '') {

                                            productPrice = document.getElementById("PrecioProducto").value;
                                            productQuantity = document.getElementById("CantidadProducto").value;

                                            //Suma al monto total
                                            montoTotal = montoTotal + (productPrice * productQuantity);

                                            //Agrega productos a la tabla
                                            $('#tablaProductos').append(
                                                `
                                                <tr data-id="${productoID}">
                                                    <td class="Codigo">${productoID}</td>
                                                    <td>${productName} - ${productDescripcion}</td>
                                                    <td class="Precio">${productPrice}</td>
                                                    <td class="Cantidad">${productQuantity}</td>
                                                    <td>
                                                        <button type="button" class="btn-close" aria-label="Close" style="background-color:red;" onClick="dltProduct(this,${productPrice},${productQuantity})"></button>
                                                    </td>
                                                </tr>
                                                `
                                            )

                                            //habilita boton de guardar venta 
                                            //muestra monto total
                                            document.getElementById("montoTotal").textContent = montoTotal;


                                            removeFormProduct();

                                        } else {
                                            Swal.fire({
                                                title: "No se pudo agregar producto",
                                                text: 'Porfavor complete los campos',
                                                icon: "info",
                                            });
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
});



function removeFormProduct() {
    let ul = document.getElementById("formProduct");
    // Limpia el <ul> eliminando todos sus elementos hijos
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    const tabla = document.getElementById('tableProducts');

    var filas = tabla.getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;

    if (filas > 0) {

        document.getElementById("btnGuardarVenta").removeAttribute("disabled");
    }

    document.getElementById("buscador").removeAttribute("disabled");
    document.getElementById("buscador").value = "";
    document.getElementById('btn-close').remove();


}

// Función para eliminar una fila
function dltProduct(btn, price, quantity) {
    // Obtener la fila en la que se encuentra el botón
    const fila = btn.parentNode.parentNode;

    // Obtener la tabla
    const tabla = document.getElementById('tableProducts');


    montoTotal = montoTotal - (price * quantity);

    document.getElementById("montoTotal").textContent = montoTotal;

    // Eliminar la fila de la tabla
    tabla.deleteRow(fila.rowIndex);


    var filas = tabla.getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;

    if (filas == 0) {
        document.getElementById("btnGuardarVenta").setAttribute("disabled", true);
    }
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

function showModalPagoInicial() {
    let modalPagoInicial = new bootstrap.Modal(document.getElementById("modalPagoInicial"));
    modalPagoInicial.show();
}

function hideModalPagoInicial() {
    let modalPagoInicial = bootstrap.Modal.getInstance(document.getElementById("modalPagoInicial"));

    if (modalPagoInicial) {
        modalPagoInicial.hide();
    }

}

function showModaTipoVenta() {
    let modalTipoVenta = new bootstrap.Modal(document.getElementById("modalTipoVenta"));
    modalTipoVenta.show();
}

function hideModalTipoVenta() {
    let modalTipoVenta = bootstrap.Modal.getInstance(document.getElementById("modalTipoVenta"));

    if (modalTipoVenta) {
        modalTipoVenta.hide();
    }

}

//Guardar ventas
$('#btnGuardarVenta').on('click', function () {
    Swal.fire({
        title: '¿Desea realizar un pago inicial?',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            // Recoger los datos del formulario
            const cliente_id = ClienteID;
            const usuario_id = 0;
            const tipo_venta = $('#selectTipoVenta').val(); // Radio button
            const pagoInicial = 0;
            const observacion = $('#observacion').val();

            console.log(tipo_venta);

            if (tipo_venta == "Credito") {
                showModalPagoInicial();
            } else {
                succesSale(cliente_id,
                    usuario_id,
                    tipo_venta,
                    pagoInicial,
                    observacion);
            }

            $('#guardarVenta').on('click', function () {

                hideModalPagoInicial();
                // Recoger los datos del formulario
                const cliente_id = ClienteID;
                const usuario_id = 0;
                const tipo_venta = $('#selectTipoVenta').val(); // Radio button
                const pagoInicial = $('#pagoInicial').val();
                const observacion = $('#observacion').val();

                succesSale(cliente_id,
                    usuario_id,
                    tipo_venta,
                    pagoInicial,
                    observacion);
            });
        } else if (result.isDenied) {
            // Recoger los datos del formulario
            const cliente_id = ClienteID;
            const usuario_id = 0;
            const tipo_venta = $('#selectTipoVenta').val(); // Radio button
            const pagoInicial = 0;
            const observacion = $('#observacion').val();

            console.log(tipo_venta);

            if (tipo_venta == "Credito") {
                showModalPagoInicial();
            } else {
                succesSale(cliente_id,
                    usuario_id,
                    tipo_venta,
                    pagoInicial,
                    observacion);
            }

            $('#guardarVenta').on('click', function () {

                hideModalPagoInicial();
                // Recoger los datos del formulario
                const cliente_id = ClienteID;
                const usuario_id = 0;
                const tipo_venta = $('#selectTipoVenta').val(); // Radio button
                const pagoInicial = '0.00';
                const observacion = $('#observacion').val();

                succesSale(cliente_id,
                    usuario_id,
                    tipo_venta,
                    pagoInicial,
                    observacion);
            });
        }
    })




});

function succesSale(cliente_id,
    usuario_id,
    tipo_venta,
    pagoInicial,
    observacion) {
    //showLoadingModal();
    // Recoger los productos de la tabla de productos
    let productos = [];
    $('#tableProducts tbody tr').each(function () {
        const productoid = $(this).find('.Codigo').text();
        const cantidad = parseFloat($(this).find('.Cantidad').text());
        const preciounitario = parseFloat($(this).find('.Precio').text());


        if (cantidad > 0 && preciounitario > 0) {
            productos.push({
                productoid: productoid,
                cantidad: cantidad,
                preciounitario: preciounitario
            });
        }
    });

    // Validar que al menos haya un producto
    if (productos.length === 0) {
        //hideLoadingModal();
        Swal.fire({
            title: "Error en venta",
            text: 'Debe agregar al menos un producto a la venta',
            icon: "info",
        });
        return;
    }

    // Crear el objeto de datos para enviar al servidor
    const datosVenta = {
        cliente_id: cliente_id,
        usuario_id: usuario_id,
        tipo_venta: tipo_venta,
        productos: productos,
        montoPagoInicial: pagoInicial,
        observacion: observacion
    };

    // Enviar la solicitud AJAX al servidor
    $.ajax({
        url: '/saveSale', // URL donde está tu ruta para guardar la venta
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(datosVenta),
        success: function (response) {
            if (response.status === 'success') {
                //hideLoadingModal();
                // Mostrar SweetAlert de éxito y recargar la página
                Swal.fire({
                    title: "Venta registrada exitosamente",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1000,
                }).then(() => {
                    // Recargar la página después de eliminar
                    //window.location.reload();
                    abrirFacturaParaImprimir(response.NumFact);
                    window.location.reload();
                });
            } else {
                //hideLoadingModal();
                // Si hubo un error, mostrar el mensaje de error
                Swal.fire({
                    title: "Error en venta",
                    text: data.message,
                    icon: "error",
                });
            }
        },
        error: function (xhr, status, error) {
            //hideLoadingModal();
            Swal.fire({
                title: "Error en venta",
                text: 'Ocurrió un error al registrar la venta. Inténtalo de nuevo',
                icon: "error",
            });
        }
    });


}

async function abrirFacturaParaImprimir(ventaId) {
    try {
        const response = await fetch(`/ver_factura/${ventaId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al descargar el PDF: ${response.statusText}`);
        }

        // Convertir la respuesta en un blob
        const blob = await response.blob();

        // Usar FileSaver para forzar la descarga
        saveAs(blob, `factura_${ventaId}.pdf`);


    } catch (error) {
        console.error('Error al descargar el PDF:', error);
    }
}


