// Declarar la variable del modal para controlarlo
let loadingModal;

// Función para inicializar el modal solo una vez
function initLoadingModal() {
    if (!loadingModal) {
        loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    }
}

// Función para establecer la fecha actual por defecto en los inputs de fecha
window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("startDate").value = today;
    document.getElementById("endDate").value = today;
};

// Función para generar el reporte y enviar las fechas al backend
document.getElementById("filterForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Inicializar el modal y mostrarlo
    initLoadingModal();
    loadingModal.show();

    // Obtener las fechas seleccionadas
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    // Enviar las fechas al backend usando fetch
    fetch(`/GestionReportes/Carga?fecha_inicio=${startDate}&fecha_fin=${endDate}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("productReportTable");
            tableBody.innerHTML = ""; // Limpiar contenido de la tabla

            if (data.length === 0) {
                // Si no hay datos, mostrar un mensaje en la tabla
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="3" class="text-center">No se encontraron productos en el rango de fechas seleccionado</td>`;
                tableBody.appendChild(row);
            } else {
                // Si hay datos, llenar la tabla con los productos
                data.forEach(item => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${item.producto}</td><td>${item.total_vendido}</td><td>${item.totalingresos}</td>`;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error al generar el reporte:', error))
        .finally(() => {
            // Asegurarse de ocultar el modal después de que la consulta finalice
            loadingModal.hide();
        });
});

// Función para imprimir el reporte
function printReport() {
    const printContents = document.querySelector(".container").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
}
