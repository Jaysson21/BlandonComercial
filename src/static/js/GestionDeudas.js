// DOM Elements
const addPaymentForm = document.getElementById('addPaymentForm');
const paymentHistory = document.getElementById('paymentHistory');
const noPaymentsRow = document.getElementById('noPaymentsRow');
//const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editPaymentForm = document.getElementById('editPaymentForm');
const saveEditButton = document.getElementById('saveEditButton');
const searchInput = document.getElementById('searchInput');
const clientSelect = document.getElementById('customerSelect');
const saleSelect = document.getElementById('saleSelect');
const editClientSelect = document.getElementById('editClientSelect');
const editSaleSelect = document.getElementById('editSaleSelect');

document.getElementById('searchSalesForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Evitar el comportamiento por defecto del formulario

    debugger
    const clienteId = document.getElementById('customerSelect').value;

    if (clienteId) {
        // Mostrar el modal de carga
        showLoadingModal();
        debugger
        // Hacer la solicitud POST al backend usando fetch API
        fetch(`/SalesCustomer/${clienteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            // Ocultar el modal de carga
            hideLoadingModal();
            debugger
            if (data.success) {
                // Llenar la tabla con las ventas del cliente seleccionado
                populateSalesTable(data.ventas);
            } else {
                alert('No se encontraron ventas para este cliente.');
            }
        })
        .catch(error => {
            // Ocultar el modal de carga en caso de error
            hideLoadingModal();
            console.error('Error:', error);
            alert('Ocurrió un error al buscar las ventas.');
        });
    } else {
        alert('Por favor, seleccione un cliente.');
    }
});

// Función para mostrar el modal de carga
function showLoadingModal() {
    let loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
}

// Función para ocultar el modal de carga
function hideLoadingModal() {
    let loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (loadingModal) {
        loadingModal.hide();
    }
}

// Función para rellenar la tabla de ventas
function populateSalesTable(ventas) {
    const tbody = document.querySelector('#paymentHistory tbody');
    tbody.innerHTML = '';  // Limpiar el contenido actual

    debugger
    if (ventas.length > 0) {
        ventas.forEach(venta => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', venta.ventaid);

            row.innerHTML = `
                <td>${venta.ventaid}</td>
                <td>${venta.clienteid}</td>
                <td>${venta.monto}</td>
                <td>${venta.direccion}</td>
                <td>${venta.fechaventa}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Ver Detalles</button>
                    <button class="btn btn-sm btn-danger delete-button" data-id="${venta.ventaid}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = '<tr id="noSalesRow"><td colspan="6" class="text-center">No se encontraron ventas.</td></tr>';
    }
}

// Asignar la cédula seleccionada al campo de cédula en el formulario
document.getElementById('customerSelect').addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const cedula = selectedOption.getAttribute('data-cedula');
    document.getElementById('clientCedula').value = cedula || '';
});

