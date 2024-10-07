// Initialize clients array (no longer needed to simulate ID)
let clients = [];  // This will be filled from the backend

// DOM Elements
const addClientForm = document.getElementById('addClientForm');
const clientList = document.getElementById('clientList');
const noClientsRow = document.getElementById('noClientsRow');
const editClientForm = document.getElementById('editClientForm');
const saveEditButton = document.getElementById('saveEditButton');
const searchInput = document.getElementById('searchInput');

// Populate clients from server-side data
function populateClients(clientsFromServer) {
    clients = clientsFromServer;
    clients.forEach(client => addClientToList(client));
}

// Update a single client in the list
function updateClientInList(client) {
    const tr = clientList.querySelector(`tr[data-id="${client.id}"]`);
    if (tr) {
        tr.innerHTML = `
            <td>${client.id}</td>
            <td>${client.nombres}</td>
            <td>${client.apellidos}</td>
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

document.querySelectorAll('.edit-button').forEach(function(button) {
    button.addEventListener('click', function() {
        // Obtener el ID del cliente del botón
        let clientId = this.getAttribute('data-id');
        
        // Obtener la fila de la tabla correspondiente al cliente
        let row = this.closest('tr');
        let nombres = row.cells[0].innerText;  // Columna Nombres
        let apellidos = row.cells[1].innerText;  // Columna Apellidos
        let telefono = row.cells[2].innerText;  // Columna Teléfono
        let email = row.cells[3].innerText;  // Columna Email
        let direccion = row.cells[4].innerText;  // Columna Dirección

        // Rellenar el formulario del modal con los datos del cliente
        document.getElementById('editClientId').value = clientId;
        document.getElementById('editClientName').value = nombres;
        document.getElementById('editClientSurName').value = apellidos;
        document.getElementById('editClientPhone').value = telefono;
        document.getElementById('editClientEmail').value = email;
        document.getElementById('editClientAddress').value = direccion;

        // Mostrar el modal
        let editModal = new bootstrap.Modal(document.getElementById('editModalClient'));
        editModal.show();
    });
});

function deleteProduct(id) {
    Swal.fire({
        title: '¿Desea eliminar el producto? Sku: ' + id,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Producto eliminado exitosamente',
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            }).then((result) => {
                setTimeout(() => {
                    window.location.href = "/deleteProduct/" + id;
                }, 1000);

            })
        } else if (result.isDenied) {
            Swal.fire('El producto no ha sido eliminado', '', 'info')
        }
    })
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
