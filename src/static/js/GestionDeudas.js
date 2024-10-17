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
                <td>C$${venta.montoventa.toFixed(2)}</td>
                <td>${new Date(venta.fechaventa).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron ventas para este cliente.</td></tr>';
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