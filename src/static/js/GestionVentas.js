
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
                            `<li class="list-group-item">${producto.nombre} - Código: ${producto.productoid}</li>`
                        );
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

/*
// Función para buscar cliente (Simulación)
function buscarCliente() {
    // Aquí puedes hacer una solicitud AJAX para buscar el cliente en la base de datos
    // Datos simulados del cliente encontrados
    document.getElementById('direccionCliente').value = 'Calle Falsa 123';
    document.getElementById('telefonoCliente').value = '123-456-7890';
}

let productos = [];
let total = 0;

// Función para agregar productos a la tabla
function agregarProducto() {
    const codigo = document.getElementById('codigoProducto').value;
    const nombre = document.getElementById('nombreProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const cantidad = parseInt(document.getElementById('cantidadProducto').value);

    if (!codigo || !nombre || !precio || !cantidad) {
        alert('Por favor, completa todos los campos del producto.');
        return;
    }

    const subtotal = precio * cantidad;
    total += subtotal;

    // Agregar producto al array
    productos.push({ codigo, nombre, precio, cantidad, subtotal });

    // Actualizar tabla de productos
    const tablaProductos = document.getElementById('tablaProductos');
    const fila = `<tr>
                <td>${codigo}</td>
                <td>${nombre}</td>
                <td>$${precio.toFixed(2)}</td>
                <td>${cantidad}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>`;
    tablaProductos.innerHTML += fila;

    // Actualizar total
    document.getElementById('montoTotal').innerText = total.toFixed(2);

    // Limpiar campos de producto
    document.getElementById('codigoProducto').value = '';
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precioProducto').value = '';
    document.getElementById('cantidadProducto').value = 1;
}*/