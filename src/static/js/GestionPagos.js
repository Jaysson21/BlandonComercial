// Initialize arrays
let clients = [];
let sales = [];
let payments = [];
let nextPaymentId = 1;

// DOM Elements
const addPaymentForm = document.getElementById('addPaymentForm');
const paymentHistory = document.getElementById('paymentHistory');
const noPaymentsRow = document.getElementById('noPaymentsRow');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editPaymentForm = document.getElementById('editPaymentForm');
const saveEditButton = document.getElementById('saveEditButton');
const searchInput = document.getElementById('searchInput');
const clientSelect = document.getElementById('clientSelect');
const saleSelect = document.getElementById('saleSelect');
const editClientSelect = document.getElementById('editClientSelect');
const editSaleSelect = document.getElementById('editSaleSelect');

// Función para cargar los clientes pasados desde el backend
function populateClients(clientsFromServer) {
    clients = clientsFromServer; // Asignar los clientes recibidos desde el backend
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
        
        const editOption = option.cloneNode(true);
        editClientSelect.appendChild(editOption);
    });
}

// Función para cargar ventas basadas en el cliente seleccionado
function populateSaleSelect(clientId, selectElement) {
    selectElement.innerHTML = '<option value="">Seleccione una venta</option>';
    const clientSales = sales.filter(sale => sale.clientId === parseInt(clientId));
    clientSales.forEach(sale => {
        const option = document.createElement('option');
        option.value = sale.id;
        option.textContent = `Venta #${sale.id} - $${sale.amount}`;
        selectElement.appendChild(option);
    });
}

// Event listeners para cambios en el select de clientes
clientSelect.addEventListener('change', (e) => populateSaleSelect(e.target.value, saleSelect));
editClientSelect.addEventListener('change', (e) => populateSaleSelect(e.target.value, editSaleSelect));

// Modal de espera
const waitModal = new bootstrap.Modal(document.getElementById('waitModal'));

// Añadir pago
addPaymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const clientId = parseInt(clientSelect.value);
    const saleId = parseInt(saleSelect.value);
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;

    if (clientId && saleId && amount && date) {
        waitModal.show();
        setTimeout(() => {
            const newPayment = {
                id: nextPaymentId++,
                clientId: clientId,
                saleId: saleId,
                amount: amount,
                date: date
            };

            payments.push(newPayment);
            addPaymentToHistory(newPayment);
            addPaymentForm.reset();
            waitModal.hide();

        }, 3000); // 5 segundos de espera simulada
    }
});

// Agregar un pago al historial
function addPaymentToHistory(payment) {
    const tbody = paymentHistory.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.dataset.id = payment.id;
    const client = clients.find(c => c.id === payment.clientId);
    const sale = sales.find(s => s.id === payment.saleId);
    tr.innerHTML = `
        <td>${client ? client.name : 'N/A'}</td>
        <td>Venta #${payment.saleId} - $${sale ? sale.amount.toFixed(2) : 'N/A'}</td>
        <td>$${payment.amount.toFixed(2)}</td>
        <td>${payment.date}</td>
        <td>
            <button class="btn btn-sm btn-primary edit-button" data-id="${payment.id}">Editar</button>
            <button class="btn btn-sm btn-danger delete-button" data-id="${payment.id}">Eliminar</button>
        </td>
    `;
    tbody.insertBefore(tr, noPaymentsRow);
    updateNoPaymentsVisibility();
}

// Mostrar/ocultar fila de "No hay pagos"
function updateNoPaymentsVisibility() {
    const visiblePayments = paymentHistory.querySelectorAll('tbody tr:not([style*="display: none"]):not(#noPaymentsRow)');
    noPaymentsRow.style.display = visiblePayments.length === 0 ? 'table-row' : 'none';
}

// Inicializar
populateClientSelect();
updateNoPaymentsVisibility();
