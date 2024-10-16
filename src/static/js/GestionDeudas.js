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

// Escuchar el evento click del botón Buscar Ventas
document.getElementById('buscarVentasBtn').addEventListener('click', function (e) {
    updateTotal();
});


// Actualizar total basado en los valores de la columna 'Monto'
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

// Mostrar detalles de las ventas
document.addEventListener('click', function (event) {
    if (event.target && event.target.matches('button.btn-primary')) {
        const row = event.target.closest('tr');

        if (row) {
            // Obtener los valores desde los atributos data-*
            const ventaId = row.getAttribute('data-id');
            const clienteNombre = row.getAttribute('data-nombres');
            const montoVenta = row.getAttribute('data-monto');
            const fechaVenta = row.getAttribute('data-fecha');

            document.getElementById('clienteNombre').textContent = clienteNombre || 'N/A';
            document.getElementById('fechaVenta').textContent = fechaVenta || 'N/A';
            document.getElementById('ventaMonto').textContent = `${montoVenta || '0.00'}`;

            let detallesModal = new bootstrap.Modal(document.getElementById('detallesModal'));
            detallesModal.show();
        }
    }
});


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


