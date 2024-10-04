// Initialize clients array (no longer needed to simulate ID)
let clients = [];  // This will be filled from the backend

// DOM Elements
const addClientForm = document.getElementById('addClientForm');
const clientList = document.getElementById('clientList');
const noClientsRow = document.getElementById('noClientsRow');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editClientForm = document.getElementById('editClientForm');
const saveEditButton = document.getElementById('saveEditButton');
const searchInput = document.getElementById('searchInput');

// Populate clients from server-side data
function populateClients(clientsFromServer) {
    clients = clientsFromServer;
    clients.forEach(client => addClientToList(client));
}

// Add client
addClientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const address = document.getElementById('clientAddress').value.trim();

    if (name) {
        const newClient = {
            id: clients.length > 0 ? clients[clients.length - 1].id + 1 : 1,  // Generate new ID
            nombre: name,
            telefono: phone,
            email: email,
            direccion: address,
            fechaRegistro: new Date().toISOString()
        };

        clients.push(newClient);
        addClientToList(newClient);
        addClientForm.reset();

        // Aquí podrías enviar el nuevo cliente al backend con una llamada AJAX si es necesario.
    }
});

// Add a single client to the list
function addClientToList(client) {
    const tbody = clientList.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.dataset.id = client.id;
    tr.innerHTML = `
        <td>${client.id}</td>
        <td>${client.nombre}</td>
        <td>${client.telefono}</td>
        <td>${client.email}</td>
        <td>${client.direccion}</td>
        <td>${new Date(client.fechaRegistro).toLocaleString()}</td>
        <td>
            <button class="btn btn-sm btn-primary edit-button" data-id="${client.id}">Editar</button>
            <button class="btn btn-sm btn-danger delete-button" data-id="${client.id}">Eliminar</button>
        </td>
    `;
    tbody.insertBefore(tr, noClientsRow);
    updateNoClientsVisibility();
}

// Update "No clients" row visibility
function updateNoClientsVisibility() {
    const visibleClients = clientList.querySelectorAll('tbody tr:not([style*="display: none"])');
    if (visibleClients.length === 0) {
        noClientsRow.style.display = 'table-row';
    } else {
        noClientsRow.style.display = 'none';
    }
}

// Edit and delete client
clientList.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('edit-button')) {
        const clientId = parseInt(target.dataset.id);
        openEditModal(clientId);
    } else if (target.classList.contains('delete-button')) {
        const clientId = parseInt(target.dataset.id);
        deleteClient(clientId);
    }
});

// Open edit modal
function openEditModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        document.getElementById('editClientName').value = client.nombre;
        document.getElementById('editClientPhone').value = client.telefono;
        document.getElementById('editClientEmail').value = client.email;
        document.getElementById('editClientAddress').value = client.direccion;
        editClientForm.dataset.clientId = clientId;
        editModal.show();
    }
}

// Save edited client
saveEditButton.addEventListener('click', () => {
    const clientId = parseInt(editClientForm.dataset.clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
        client.nombre = document.getElementById('editClientName').value.trim();
        client.telefono = document.getElementById('editClientPhone').value.trim();
        client.email = document.getElementById('editClientEmail').value.trim();
        client.direccion = document.getElementById('editClientAddress').value.trim();
        updateClientInList(client);
        editModal.hide();

        // Aquí podrías enviar los cambios al backend con una llamada AJAX si es necesario.
    }
});

// Update a single client in the list
function updateClientInList(client) {
    const tr = clientList.querySelector(`tr[data-id="${client.id}"]`);
    if (tr) {
        tr.innerHTML = `
            <td>${client.id}</td>
            <td>${client.nombre}</td>
            <td>${client.telefono}</td>
            <td>${client.email}</td>
            <td>${client.direccion}</td>
            <td>${new Date(client.fechaRegistro).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-button" data-id="${client.id}">Editar</button>
                <button class="btn btn-sm btn-danger delete-button" data-id="${client.id}">Eliminar</button>
            </td>
        `;
    }
}

// Delete client
function deleteClient(clientId) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
        clients = clients.filter(c => c.id !== clientId);
        const tr = clientList.querySelector(`tr[data-id="${clientId}"]`);
        if (tr) {
            tr.remove();
        }
        updateNoClientsVisibility();

        // Aquí podrías enviar la solicitud de eliminación al backend con una llamada AJAX si es necesario.
    }
}

// Search functionality
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = clientList.querySelectorAll('tbody tr:not(#noClientsRow)');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateNoClientsVisibility();
});


updateNoClientsVisibility();
