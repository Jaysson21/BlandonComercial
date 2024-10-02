// Initialize products array
let products = [];
let nextId = 1; // Simulating auto-increment ID

// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const productList = document.getElementById('productList');
const noProductsRow = document.getElementById('noProductsRow');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editProductForm = document.getElementById('editProductForm');
const saveEditButton = document.getElementById('saveEditButton');

// Add product
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('productName');
    const descriptionInput = document.getElementById('productDescription');
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (name) {
        const newProduct = {
            id: nextId++,
            nombre: name,
            descripcion: description
        };

        products.push(newProduct);
        addProductToList(newProduct);
        nameInput.value = '';
        descriptionInput.value = '';
    }
});

// Add a single product to the list
function addProductToList(product) {
    const tbody = productList.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.dataset.id = product.id;
    tr.innerHTML = `
        <td>${product.id}</td>
        <td>${product.nombre}</td>
        <td>${product.descripcion}</td>
        <td>
            <button class="btn btn-sm btn-primary edit-button" data-id="${product.id}">Editar</button>
            <button class="btn btn-sm btn-danger delete-button" data-id="${product.id}">Eliminar</button>
        </td>
    `;
    tbody.insertBefore(tr, noProductsRow);
    updateNoProductsVisibility();
}

// Update "No products" row visibility
function updateNoProductsVisibility() {
    if (products.length === 0) {
        noProductsRow.style.display = 'table-row';
    } else {
        noProductsRow.style.display = 'none';
    }
}

// Edit and delete product
productList.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('edit-button')) {
        const productId = parseInt(target.dataset.id);
        openEditModal(productId);
    } else if (target.classList.contains('delete-button')) {
        const productId = parseInt(target.dataset.id);
        deleteProduct(productId);
    }
});

// Open edit modal
function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('editProductName').value = product.nombre;
        document.getElementById('editProductDescription').value = product.descripcion;
        editProductForm.dataset.productId = productId;
        editModal.show();
    }
}

// Save edited product
saveEditButton.addEventListener('click', () => {
    const productId = parseInt(editProductForm.dataset.productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        product.nombre = document.getElementById('editProductName').value.trim();
        product.descripcion = document.getElementById('editProductDescription').value.trim();
        updateProductInList(product);
        editModal.hide();
    }
});

// Update a single product in the list
function updateProductInList(product) {
    const tr = productList.querySelector(`tr[data-id="${product.id}"]`);
    if (tr) {
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nombre}</td>
            <td>${product.descripcion}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-button" data-id="${product.id}">Editar</button>
                <button class="btn btn-sm btn-danger delete-button" data-id="${product.id}">Eliminar</button>
            </td>
        `;
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        products = products.filter(p => p.id !== productId);
        const tr = productList.querySelector(`tr[data-id="${productId}"]`);
        if (tr) {
            tr.remove();
        }
        updateNoProductsVisibility();
    }
}

// Initial "No products" visibility check
updateNoProductsVisibility();