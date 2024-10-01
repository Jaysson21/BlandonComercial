// Sample data
const products = [
    { id: '1', name: 'Arroz', price: 19.99 },
    { id: '2', name: 'Frijoles', price: 29.99 },
    { id: '3', name: 'Maíz', price: 39.99 },
];

const customers = [
    { id: '1', name: 'Juan Pérez', email: 'juan@ejemplo.com' },
    { id: '2', name: 'María García', email: 'maria@ejemplo.com' },
    { id: '3', name: 'Carlos Rodríguez', email: 'carlos@ejemplo.com' },
];

let saleItems = [];

// DOM Elements
const customerSelect = document.getElementById('customerSelect');
const productSelect = document.getElementById('productSelect');
const quantityInput = document.getElementById('quantity');
const manualPriceInput = document.getElementById('manualPrice');
const useManualPriceCheckbox = document.getElementById('useManualPrice');
const addProductButton = document.getElementById('addProduct');
const saleItemsTable = document.getElementById('saleItems');
const totalElement = document.getElementById('total');
const generateSaleButton = document.getElementById('generateSale');
const editModal = document.getElementById('editModal');
const editQuantityInput = document.getElementById('editQuantity');
const editManualPriceInput = document.getElementById('editManualPrice');
const saveEditButton = document.getElementById('saveEdit');
const closeModalButton = document.getElementById('closeModal');

// Populate selects
function populateSelect(selectElement, items) {
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });
}

populateSelect(customerSelect, customers);
populateSelect(productSelect, products);

// Add product to sale
addProductButton.addEventListener('click', () => {
    const productId = productSelect.value;
    const product = products.find(p => p.id === productId);
    if (product && parseInt(quantityInput.value) > 0) {
        const newItem = {
            product,
            quantity: parseInt(quantityInput.value),
            manualPrice: useManualPriceCheckbox.checked ? parseFloat(manualPriceInput.value) : undefined
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
            <td data-label="Producto">${item.product.name}</td>
            <td data-label="Precio">$${(item.manualPrice !== undefined ? item.manualPrice : item.product.price).toFixed(2)}${item.manualPrice !== undefined ? ' (Manual)' : ''}</td>
            <td data-label="Cantidad">${item.quantity}</td>
            <td data-label="Subtotal">$${((item.manualPrice !== undefined ? item.manualPrice : item.product.price) * item.quantity).toFixed(2)}</td>
            <td data-label="Acciones">
                <button class="edit-button" data-index="${index}">Editar</button>
                <button class="remove-button" data-index="${index}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    updateTotal();
}

// Update total
function updateTotal() {
    const total = saleItems.reduce((sum, item) => {
        const price = item.manualPrice !== undefined ? item.manualPrice : item.product.price;
        return sum + price * item.quantity;
    }, 0);
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Reset product form
function resetProductForm() {
    productSelect.value = '';
    quantityInput.value = '1';
    manualPriceInput.value = '';
    useManualPriceCheckbox.checked = false;
}

// Remove product from sale
saleItemsTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-button')) {
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

    const customer = customers.find(c => c.id === selectedCustomerId);
    const total = saleItems.reduce((sum, item) => {
        const price = item.manualPrice !== undefined ? item.manualPrice : item.product.price;
        return sum + price * item.quantity;
    }, 0);

    // Here you would typically send this data to your backend
    console.log('Venta generada:', {
        customer,
        items: saleItems,
        total
    });

    alert(`Venta para ${customer.name} por un total de $${total.toFixed(2)} ha sido creada.`);

    // Reset the form
    saleItems = [];
    updateSaleItemsTable();
    customerSelect.value = '';
});

// Toggle manual price input
useManualPriceCheckbox.addEventListener('change', (e) => {
    manualPriceInput.disabled = !e.target.checked;
});