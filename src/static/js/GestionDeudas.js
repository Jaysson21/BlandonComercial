// DOM Elements
const clientSelect = document.getElementById('customerSelect');
const paymentHistory = document.getElementById('paymentHistory');

// Filtrar las ventas por cliente en el objeto 'sales_data'
function filtrarVentasPorCliente(clienteId) {
    return sales_data.filter(venta => venta.clienteid == clienteId);
}

// Evento para manejar el clic en "Buscar Ventas"
document.getElementById('buscarVentasBtn').addEventListener('click', function (e) {
    e.preventDefault();

    const clienteId = document.getElementById('customerSelect').value;

    if (clienteId) {
        // Filtrar las ventas del cliente seleccionado
        const ventasFiltradas = filtrarVentasPorCliente(clienteId);

        // Actualizar la tabla con las ventas filtradas
        actualizarTablaVentas(ventasFiltradas);

        // Actualizar el total
        updateTotal();
    } else {
        alert('Por favor, seleccione un cliente antes de buscar las ventas.');
    }
});

// Actualizar la tabla de ventas
function actualizarTablaVentas(ventasFiltradas) {
    const tbody = paymentHistory.querySelector('tbody');
    tbody.innerHTML = '';  // Limpiar la tabla actual

    if (ventasFiltradas.length > 0) {
        ventasFiltradas.forEach(venta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${venta.ventaid}</td>
                <td>${venta.nombres} ${venta.apellidos}</td>
                <td>C$${(venta.montoventa) ? Number(venta.montoventa).toFixed(2) : '0.00'}</td>
                <td>${new Date(venta.fechaventa).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" data-id="${venta.ventaid}">Ver detalles</button>
                    <button class="btn btn-sm btn-danger delete-button" data-id="${venta.ventaid}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron ventas para este cliente.</td></tr>';
    }
}

// Actualizar el total basado en los valores de la columna 'Monto'
function updateTotal() {
    const rows = document.querySelectorAll('#paymentHistory tbody tr');
    let total = 0;

    rows.forEach(row => {
        const montoCell = row.querySelector('td:nth-child(3)');
        if (montoCell) {
            const monto = parseFloat(montoCell.textContent.replace('C$', '').trim());
            if (!isNaN(monto)) {
                total += monto;
            }
        }
    });

    const totalElement = document.getElementById('total');
    totalElement.innerHTML = `<strong>Total: C$${total.toFixed(2)}</strong>`;
}

// Asignar la cédula del cliente seleccionado
$(document).ready(function() {
    $('#customerSelect').select2({
        placeholder: 'Seleccione un cliente',
        allowClear: true
    });

    $('#customerSelect').on('select2:select', function(e) {
        const cedula = $('#customerSelect option:selected').data('cedula');
        $('#clientCedula').val(cedula || '');
    });
});

// Mostrar detalles de las ventas en el modal
document.addEventListener('click', function (event) {
    if (event.target && event.target.matches('button.btn-primary')) {
        
        const ventaId = event.target.getAttribute('data-id');  // Obtener el ID directamente del botón
        console.log(ventaId);

        if (ventaId) {
            // Buscar los detalles de la venta en 'sales_data' usando el 'ventaId'
            const venta = sales_data.find(v => v.ventaid == ventaId);

            if (venta) {
                // Llenar el modal con la información de la venta
                const clienteNombre = `${venta.nombres} ${venta.apellidos}`;
                const montoVenta = venta.montoventa ? Number(venta.montoventa).toFixed(2) : '0.00';
                const fechaVenta = new Date(venta.fechaventa).toLocaleDateString();

                document.getElementById('clienteNombre').textContent = clienteNombre || 'N/A';
                document.getElementById('fechaVenta').textContent = fechaVenta || 'N/A';
                document.getElementById('ventaTotal').textContent = `C$${montoVenta}`;

                // Llamar a la función que ya tienes para obtener los productos por venta
                mostrarDetallesVenta(ventaId);

                // Mostrar el modal
                let detallesModal = new bootstrap.Modal(document.getElementById('detallesVentaModal'));
                detallesModal.show();
            } else {
                console.error(`No se encontró la venta con ID ${ventaId}`);
            }
        } else {
            console.error("No se encontró el atributo data-id en el botón.");
        }
    }
});


// Función para obtener y mostrar los productos en el modal de detalles
function mostrarDetallesVenta(ventaId) {
    fetch(`/detallesVentas/${ventaId}`)
        .then(response => response.json())
        .then(data => {
            const productosTableBody = document.getElementById('productosTableBody');
            productosTableBody.innerHTML = ''; // Limpiar la tabla actual
            
            if (data.success && data.productos.length > 0) {
                let totalVenta = 0;
                
                data.productos.forEach(producto => {
                    const subtotal = producto.preciounitario * producto.cantidad;
                    totalVenta += subtotal;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${producto.nombre}</td>
                        <td>${producto.cantidad}</td>
                        <td>C$${producto.preciounitario.toFixed(2)}</td>
                        <td>C$${subtotal.toFixed(2)}</td>
                    `;
                    productosTableBody.appendChild(row);
                });
                console.log(productos);

                // Actualizar el total en el modal
                document.getElementById('ventaTotal').textContent = totalVenta.toFixed(2);
            } else {
                // Si no se encuentran productos, mostrar un mensaje
                productosTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron productos para esta venta.</td></tr>';
            }

            // Mostrar el modal
            let detallesModal = new bootstrap.Modal(document.getElementById('detallesVentaModal'));
            detallesModal.show();
        })
        .catch(error => {
            console.error('Error al obtener los productos:', error);
        });
}