let saleItems = [];

// DOM Elements
const customerSelect = document.getElementById('customerSelect');
const productSelect = document.getElementById('productSelect');
const quantityInput = document.getElementById('quantity');
const manualPriceInput = document.getElementById('manualPrice');
const addProductButton = document.getElementById('addProduct');
const saleItemsTable = document.getElementById('saleItems');
const totalElement = document.getElementById('total');
const generateSaleButton = document.getElementById('generateSale');
const editModal = document.getElementById('editModal');
const editQuantityInput = document.getElementById('editQuantity');
const editManualPriceInput = document.getElementById('editManualPrice');
const saveEditButton = document.getElementById('saveEdit');
const closeModalButton = document.getElementById('closeModal');

// Add product to sale
addProductButton.addEventListener('click', () => {
    const productId = productSelect.value;
    const selectElement = document.getElementById('productSelect');
    const product = selectElement.options[selectElement.selectedIndex].text;

    if (product && parseInt(quantityInput.value) > 0) {
        const newItem = {
            product,
            quantity: parseInt(quantityInput.value),
            manualPrice: parseFloat(manualPriceInput.value) // Always use manual price entered by the user
        };
        saleItems.push(newItem);
        updateSaleItemsTable();
        resetProductForm();
    }
});

// Update sale items table
function updateSaleItemsTable() {
    const tbody = saleItemsTable.querySelector('tbody');
    tbody.innerHTML = '';
    saleItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Producto">${item.product}</td>
            <td data-label="Precio">$${item.manualPrice.toFixed(2)}</td>
            <td data-label="Cantidad">${item.quantity}</td>
            <td data-label="Subtotal">$${(item.manualPrice * item.quantity).toFixed(2)}</td>
            <td data-label="Acciones">
                <button class="btn btn-sm btn-primary edit-button" data-index="${index}">Editar</button>
                <button class="btn btn-sm btn-danger delete-button" data-index="${index}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    updateTotal();
}

// Update total
function updateTotal() {
    const total = saleItems.reduce((sum, item) => {
        return sum + item.manualPrice * item.quantity;
    }, 0);
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Reset product form
function resetProductForm() {
    productSelect.value = '';
    quantityInput.value = '1';
    manualPriceInput.value = '';
}

// Remove product from sale
saleItemsTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-button')) {
        const index = parseInt(e.target.dataset.index);
        saleItems.splice(index, 1);
        updateSaleItemsTable();
    } else if (e.target.classList.contains('edit-button')) {
        const index = parseInt(e.target.dataset.index);
        openEditModal(index);
    }
});

// Edit product
let editingIndex = -1;

function openEditModal(index) {
    editingIndex = index;
    const item = saleItems[index];
    editQuantityInput.value = item.quantity;
    editManualPriceInput.value = item.manualPrice !== undefined ? item.manualPrice : '';
    editModal.style.display = 'block';
}

saveEditButton.addEventListener('click', () => {
    if (editingIndex !== -1) {
        saleItems[editingIndex].quantity = parseInt(editQuantityInput.value);
        const manualPrice = parseFloat(editManualPriceInput.value);
        saleItems[editingIndex].manualPrice = !isNaN(manualPrice) ? manualPrice : undefined;
        updateSaleItemsTable();
        closeEditModal();
    }
});

closeModalButton.addEventListener('click', closeEditModal);

function closeEditModal() {
    editModal.style.display = 'none';
    editingIndex = -1;
}

// Generate sale
generateSaleButton.addEventListener('click', () => {
    const selectedCustomerId = customerSelect.value;
    if (saleItems.length === 0 || !selectedCustomerId) {
        alert('Por favor, seleccione un cliente y añada al menos un producto a la venta.');
        return;
    }

    // Obtenemos los datos del cliente directamente del select
    const selectedCustomerName = customerSelect.options[customerSelect.selectedIndex].text;
    const total = saleItems.reduce((sum, item) => {
        return sum + item.manualPrice * item.quantity;
    }, 0);

    // Aquí normalmente enviarías los datos al backend
    console.log('Venta generada:', {
        cliente: { id: selectedCustomerId, name: selectedCustomerName },
        items: saleItems,
        total
    });

    alert(`Venta para ${selectedCustomerName} por un total de $${total.toFixed(2)} ha sido creada.`);

    // Reset the form
    saleItems = [];
    updateSaleItemsTable();
    customerSelect.value = '';
});
