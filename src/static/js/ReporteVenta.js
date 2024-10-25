


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
