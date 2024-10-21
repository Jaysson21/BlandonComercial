// DOM Elements
const clientSelect = document.getElementById('customerSelect');
const paymentHistory = document.getElementById('paymentHistory');

// Filtrar las ventas por cliente en el objeto 'sales_data'
function filtrarVentasPorCliente(clienteId) {
    return sales_data.filter(deuda => deuda.clienteid == clienteId);
}

// Evento para manejar el clic en "Buscar Ventas"
document.getElementById('buscarVentasBtn').addEventListener('click', function (e) {
    e.preventDefault();

    const clienteId = document.getElementById('customerSelect').value;

    if (clienteId) {
        const ventasFiltradas = filtrarVentasPorCliente(clienteId);
        actualizarTablaVentas(ventasFiltradas);
        updateTotal();
    } else {
        alert('Por favor, seleccione un cliente antes de buscar las ventas.');
    }
});

// Actualizar la tabla de ventas
function actualizarTablaVentas(ventasFiltradas) {
    const tbody = paymentHistory.querySelector('tbody');
    tbody.innerHTML = '';

    if (ventasFiltradas.length > 0) {
        ventasFiltradas.forEach(deuda => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', deuda.ventaid);
            row.innerHTML = `
                <td>${deuda.deudaid}</td>
                <td>${deuda.ventaid}</td>
                <td>${deuda.nombres} ${deuda.apellidos}</td>
                <td>C$ ${(deuda.montodeuda) ? Number(deuda.montodeuda).toFixed(2) : '0.00'}</td>
                <td>${deuda.fechaventa}</td>
                <td>
                    <button class="btn btn-sm btn-primary" data-id="${deuda.ventaid}">Ver detalles</button>
                    <button class="btn btn-sm btn-danger delete-button" data-id="${deuda.ventaid}">Eliminar</button>
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
        const montoCell = row.querySelector('td:nth-child(4)');
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

        if (ventaId) {
            const venta = sales_data.find(v => v.ventaid == ventaId);
            if (venta) {
                const clienteNombre = `${venta.nombres} ${venta.apellidos}`;
                const montoVenta = venta.montoventa ? Number(venta.montoventa).toFixed(2) : '0.00';
                const fechaVenta = venta.fechaventa;

                document.getElementById('clienteNombre').textContent = clienteNombre || 'N/A';
                document.getElementById('fechaVenta').textContent = fechaVenta || 'N/A';
                document.getElementById('ventaTotal').textContent = `C$ ${montoVenta}`;

                document.getElementById('detallesVentaModalLabel').textContent = `Detalles de la Venta (${ventaId})`;
                mostrarDetallesVenta(ventaId);
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
                document.getElementById('ventaTotal').textContent = totalVenta.toFixed(2);
            } else {
                productosTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron productos para esta venta.</td></tr>';
            }

            let detallesModal = new bootstrap.Modal(document.getElementById('detallesVentaModal'));
            detallesModal.show();
        })
        .catch(error => {
            console.error('Error al obtener los productos:', error);
        });
}

// Obtener todos los ventaid de las ventas mostradas en la tabla
function obtenerVentaIds() {
    const ventaIds = [];
    const rows = document.querySelectorAll('#paymentHistory tbody tr');
    rows.forEach(row => {
        const ventaId = row.getAttribute('data-id');
        if (ventaId) {
            ventaIds.push(ventaId);
        }
    });
    return ventaIds;
}

// Función para mostrar el modal de pago con la información de la deuda
function mostrarPagoModal(clienteNombre, ventaIds, totalDeuda) {
    document.getElementById('nombreClientePago').textContent = clienteNombre;
    document.getElementById('ventaIdsPago').textContent = ventaIds.join(', ');

    const montoInput = document.getElementById('montoParcialInput');
    montoInput.value = totalDeuda.toFixed(2);  
    montoInput.disabled = true;  

    let pagoModal = new bootstrap.Modal(document.getElementById('pagoModal'));
    pagoModal.show();

    // Eliminar event listeners anteriores si existen
    const botonPago = document.getElementById('confirmarPagoBtn');
    const botonPagoClon = botonPago.cloneNode(true);
    botonPago.parentNode.replaceChild(botonPagoClon, botonPago);

    botonPagoClon.addEventListener('click', function () {
        const clienteId = document.getElementById('customerSelect').value;
        const montoAbono = document.getElementById('montoParcialInput').value;

        if (clienteId && montoAbono) {
            fetch('/registrarPago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clienteid: clienteId,
                    montoabono: montoAbono
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Pago registrado exitosamente");

                    // Cerrar el modal
                    pagoModal.hide();

                    // Recargar la página
                    window.location.reload();
                } else {
                    alert("Error al registrar el pago: " + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            alert('Por favor complete los campos de cliente y monto.');
        }
    });

    // Habilitar/deshabilitar el campo de pago parcial según la opción seleccionada
    document.getElementById('pagoModal').addEventListener('shown.bs.modal', function () {
        document.getElementById('pagoParcial').addEventListener('change', function () {
            montoInput.disabled = false;  // Habilitar el campo de pago parcial

            // Limpiar el campo solo cuando el usuario haga clic (focus) en él
            montoInput.addEventListener('focus', function () {
                montoInput.value = '';  // Limpiar el campo al hacer clic (focus)
            });
        });

        document.getElementById('pagoTotal').addEventListener('change', function () {
            montoInput.value = totalDeuda.toFixed(2);  // Restablecer el monto total
            montoInput.disabled = true;   // Deshabilitar el campo de pago parcial
        });
    });
}


// Manejar el clic en el botón "Realizar Pago" para abrir el modal de pago
document.getElementById('realizarPagoBtn').addEventListener('click', function () {
    const ventaIds = obtenerVentaIds();
    let totalDeuda = 0;

    if (ventaIds.length > 0) {
        const clienteNombre = document.getElementById('customerSelect').selectedOptions[0].textContent;

        const rows = document.querySelectorAll('#paymentHistory tbody tr');
        rows.forEach(row => {
            const montoCell = row.querySelector('td:nth-child(4)');
            const monto = parseFloat(montoCell.textContent.replace('C$', '').trim());
            if (!isNaN(monto)) {
                totalDeuda += monto;
            }
        });

        mostrarPagoModal(clienteNombre, ventaIds, totalDeuda);
    } else {
        alert('No hay ventas disponibles para realizar el pago.');
    }
});
