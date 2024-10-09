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
            <td>${client.cedula}</td>
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
        let nombres = row.cells[0].getAttribute('data-nombres');  // Obtener nombres guardados
        let apellidos = row.cells[0].getAttribute('data-apellidos'); //Obtener los apellidos
        let telefono = row.cells[1].innerText;  // Columna Teléfono
        let cedula = row.cells[2].innerText;  // Columna Cedula
        let direccion = row.cells[3].innerText;  // Columna Dirección

        // Rellenar el formulario del modal con los datos del cliente
        document.getElementById('editClientId').value = clientId;
        document.getElementById('editClientName').value = nombres;
        document.getElementById('editClientSurName').value = apellidos;
        document.getElementById('editClientPhone').value = telefono;
        document.getElementById('editClientCedula').value = cedula;
        document.getElementById('editClientAddress').value = direccion;

        // Mostrar el modal
        let editModal = new bootstrap.Modal(document.getElementById('editModalClient'));
        editModal.show();
    });
});

// Función para eliminar un cliente
function deleteClient(id, nombreCompleto) {
    Swal.fire({
        title: '¿Deseas eliminar al cliente: ' + nombreCompleto + '?',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        icon: 'warning'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Cliente eliminado exitosamente',
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            }).then(() => {
                // Redirigir para eliminar el cliente en el backend
                window.location.href = "/deleteClient/" + id;
            });
        }
    });
}

// Añadir evento click al botón de eliminar
document.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const clientId = this.getAttribute('data-id');
            const clientName = this.getAttribute('data-nombre');
            deleteClient(clientId, clientName);
        });
    });
});

// Inicializar la animación Lottie para el modal de carga
document.addEventListener('DOMContentLoaded', function () {
    lottie.loadAnimation({
        container: document.getElementById('loadingAnimation'), // ID del contenedor de la animación
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'src\static\assets\loading.' // Ruta al archivo JSON que subiste (ajusta según tu ruta)
    });
});


// Función para mostrar el modal de espera
function showLoadingModal() {
    let loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
}

// Función para ocultar el modal después de 1.5 segundos
function hideLoadingModal() {
    setTimeout(function () {
        let loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
        loadingModal.hide();
    }, 1500); // Espera de 1.5 segundos antes de ocultarlo
}

// Al enviar el formulario de agregar cliente
document.getElementById('addClientForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar el envío inmediato para mostrar la pantalla de espera

    showLoadingModal();

    // Simular un retraso de 1.5 segundos antes de enviar el formulario
    setTimeout(() => {
        this.submit(); // Enviar el formulario después del retraso
    }, 1500); // Espera de 1.5 segundos antes de enviar
});

// Al enviar el formulario de actualizar cliente
document.getElementById('editClientForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar el envío inmediato para mostrar la pantalla de espera

    showLoadingModal();

    // Simular un retraso de 1.5 segundos antes de enviar el formulario
    setTimeout(() => {
        this.submit(); // Enviar el formulario después del retraso
    }, 1500); // Espera de 1.5 segundos antes de enviar
});

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
