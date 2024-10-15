// DOM Elements
const addPaymentForm = document.getElementById('addPaymentForm');
const paymentHistory = document.getElementById('paymentHistory');
const noPaymentsRow = document.getElementById('noPaymentsRow');
const editPaymentForm = document.getElementById('editPaymentForm');
const saveEditButton = document.getElementById('saveEditButton');
const searchInput = document.getElementById('searchInput');
const clientSelect = document.getElementById('customerSelect');
const saleSelect = document.getElementById('saleSelect');
const editClientSelect = document.getElementById('editClientSelect');
const editSaleSelect = document.getElementById('editSaleSelect');

//Cargar la pantalla
window.onload = function () {
    let loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    setTimeout(() => {
        loadingModal.hide();
    }, 500);  // Tiempo de espera para que la transición se complete
};

document.getElementById('searchSalesForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const clienteId = document.getElementById('customerSelect').value;

    if (clienteId) {

        showLoadingModal();
        
        fetch(`/SalesCustomer/${clienteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {

            hideLoadingModal();
        
            if (data.success) {
                // Llenar la tabla con las ventas del cliente seleccionado
                populateSalesTable(data.ventas);
            } else {
                alert('No se encontraron ventas para este cliente.');
            }
        })
        .catch(error => {
            hideLoadingModal();
            console.error('Error:', error);
            alert('Ocurrió un error al buscar las ventas.');
        });
    } else {
        alert('Por favor, seleccione un cliente.');
    }
});

//Manejo de errores
document.addEventListener("DOMContentLoaded", function () {
    // Si hay un mensaje de error (div.alert-danger), mostrar el modal
    if (document.querySelector(".alert-danger")) {
        let errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
        errorModal.show();
    }
});

//Funciones para mostrar y ocultar modal de espera
function showLoadingModal() {
    let loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
}

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

    if (ventas.length > 0) {
        ventas.forEach(venta => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', venta.ventaid);

            row.innerHTML = `
                <td>${venta.ventaid}</td>
                <td>${venta.nombres}</td>
                <td>${venta.monto}</td>
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

// Asignar la cedula del cliente seleccionado
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


