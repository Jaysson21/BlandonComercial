const salesData = [
    { producto: 'Producto A', cliente: 'Cliente 1', cantidad: 10, total: 500, fecha: '2024-10-10' },
    { producto: 'Producto B', cliente: 'Cliente 2', cantidad: 5, total: 250, fecha: '2024-10-12' },
    { producto: 'Producto C', cliente: 'Cliente 3', cantidad: 8, total: 400, fecha: '2024-10-14' },
    { producto: 'Producto D', cliente: 'Cliente 4', cantidad: 12, total: 600, fecha: '2024-10-15' },
    { producto: 'Producto E', cliente: 'Cliente 5', cantidad: 6, total: 300, fecha: '2024-10-17' },
    { producto: 'Producto F', cliente: 'Cliente 6', cantidad: 15, total: 750, fecha: '2024-10-18' },
    { producto: 'Producto G', cliente: 'Cliente 7', cantidad: 9, total: 450, fecha: '2024-10-19' },
    { producto: 'Producto H', cliente: 'Cliente 8', cantidad: 4, total: 200, fecha: '2024-10-20' },
    { producto: 'Producto A', cliente: 'Cliente 9', cantidad: 20, total: 1000, fecha: '2024-10-21' },
    { producto: 'Producto B', cliente: 'Cliente 10', cantidad: 7, total: 350, fecha: '2024-10-22' },
    { producto: 'Producto C', cliente: 'Cliente 11', cantidad: 18, total: 900, fecha: '2024-10-23' },
    { producto: 'Producto D', cliente: 'Cliente 12', cantidad: 3, total: 150, fecha: '2024-10-24' },
    { producto: 'Producto E', cliente: 'Cliente 1', cantidad: 11, total: 550, fecha: '2024-10-25' },
    { producto: 'Producto F', cliente: 'Cliente 2', cantidad: 6, total: 300, fecha: '2024-10-26' },
    { producto: 'Producto G', cliente: 'Cliente 3', cantidad: 9, total: 450, fecha: '2024-10-27' },
    { producto: 'Producto H', cliente: 'Cliente 4', cantidad: 14, total: 700, fecha: '2024-10-28' },
    { producto: 'Producto A', cliente: 'Cliente 5', cantidad: 13, total: 650, fecha: '2024-10-29' },
    { producto: 'Producto B', cliente: 'Cliente 6', cantidad: 8, total: 400, fecha: '2024-10-30' },
    { producto: 'Producto C', cliente: 'Cliente 7', cantidad: 16, total: 800, fecha: '2024-11-01' },
    { producto: 'Producto D', cliente: 'Cliente 8', cantidad: 5, total: 250, fecha: '2024-11-02' },
    { producto: 'Producto E', cliente: 'Cliente 9', cantidad: 10, total: 500, fecha: '2024-11-03' },
    { producto: 'Producto F', cliente: 'Cliente 10', cantidad: 7, total: 350, fecha: '2024-11-04' },
    { producto: 'Producto G', cliente: 'Cliente 11', cantidad: 20, total: 1000, fecha: '2024-11-05' },
    { producto: 'Producto H', cliente: 'Cliente 12', cantidad: 8, total: 400, fecha: '2024-11-06' },
    { producto: 'Producto A', cliente: 'Cliente 1', cantidad: 15, total: 750, fecha: '2024-11-07' },
    { producto: 'Producto B', cliente: 'Cliente 2', cantidad: 9, total: 450, fecha: '2024-11-08' },
    { producto: 'Producto C', cliente: 'Cliente 3', cantidad: 12, total: 600, fecha: '2024-11-09' },
    { producto: 'Producto D', cliente: 'Cliente 4', cantidad: 4, total: 200, fecha: '2024-11-10' },
    { producto: 'Producto E', cliente: 'Cliente 5', cantidad: 6, total: 300, fecha: '2024-11-11' },
    { producto: 'Producto F', cliente: 'Cliente 6', cantidad: 10, total: 500, fecha: '2024-11-12' }
];


let filteredSales = [...salesData];

// Función para llenar la tabla
function fillSalesTable(sales) {
    const tableBody = document.getElementById('salesReportBody');
    tableBody.innerHTML = '';  // Limpiar la tabla antes de llenarla

    sales.forEach(sale => {
        const row = `
            <tr>
                <td>${sale.producto}</td>
                <td>${sale.cliente}</td>
                <td>${sale.cantidad}</td>
                <td>C$ ${sale.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${sale.fecha}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Llenar la tabla con todas las ventas al cargar la página
fillSalesTable(salesData);

// Función para aplicar todos los filtros
function applyFilters() {
    const productQuery = document.getElementById('filterProduct').value.toLowerCase();
    const clientQuery = document.getElementById('filterClient').value.toLowerCase();
    const startDate = document.getElementById('filterDateStart').value;
    const endDate = document.getElementById('filterDateEnd').value;

    filteredSales = salesData.filter(sale => {
        const saleDate = new Date(sale.fecha);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const matchesProduct = sale.producto.toLowerCase().includes(productQuery);
        const matchesClient = sale.cliente.toLowerCase().includes(clientQuery);
        const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);

        return matchesProduct && matchesClient && matchesDate;
    });

    fillSalesTable(filteredSales);
}

// Escuchar los cambios en los filtros
document.getElementById('filterProduct').addEventListener('input', applyFilters);
document.getElementById('filterClient').addEventListener('input', applyFilters);
document.getElementById('filterDateStart').addEventListener('change', applyFilters);
document.getElementById('filterDateEnd').addEventListener('change', applyFilters);

// Función para imprimir solo productos y cantidades en PDF
document.getElementById('btnImprimir').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yOffset = 10;  // Posición inicial en el PDF

    // Título del PDF
    doc.text('Productos y Cantidades', 10, yOffset);
    yOffset += 10;

    // Imprimir solo productos y cantidades
    filteredSales.forEach(sale => {
        doc.text(`Producto: ${sale.producto}`, 10, yOffset);
        doc.text(`Cantidad: ${sale.cantidad}`, 70, yOffset);
        yOffset += 10;
    });

    // Descargar el PDF
    doc.save('productos_y_cantidades.pdf');
});
