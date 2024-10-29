// DOM Elements
const clientSelect = document.getElementById("customerSelect");
const paymentHistory = document.getElementById("paymentHistory");

// Filtrar las ventas por cliente en el objeto 'sales_data'
function filtrarVentasPorCliente(clienteId) {
    return sales_data.filter((deuda) => deuda.clienteid == clienteId);
}

// Función para mostrar alertas con la nueva animación desde arriba
function mostrarAlertaBootstrap(mensaje, tipo) {
    const alertPlaceholder = document.getElementById("alertPlaceholder");

    // Limpiar alertas previas antes de mostrar una nueva
    alertPlaceholder.innerHTML = "";

    // Crear nueva alerta
    const alert = document.createElement("div");
    alert.className = `alert alert-${tipo} alert-dismissible fade show showing`; // Añadimos clase 'showing' para animación
    alert.role = "alert";
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertPlaceholder.appendChild(alert);

    setTimeout(() => {
        alert.classList.remove("showing");
        alert.classList.add("hiding");

        setTimeout(() => {
            alert.remove();
        }, 500);
    }, 2000);
}

// Evento para manejar el clic en "Buscar Ventas"
document
    .getElementById("buscarVentasBtn")
    .addEventListener("click", function (e) {
        e.preventDefault();

        const clienteId = document.getElementById("customerSelect").value;

        if (clienteId) {
            const ventasFiltradas = filtrarVentasPorCliente(clienteId);
            actualizarTablaVentas(ventasFiltradas);
            updateTotal();
        } else {
            mostrarAlertaBootstrap(
                "Por favor, seleccione un cliente antes de buscar las ventas.",
                "warning"
            );
        }
    });

// Actualizar la tabla de ventas
function actualizarTablaVentas(ventasFiltradas) {
    const tbody = paymentHistory.querySelector("tbody");
    tbody.innerHTML = "";

    if (ventasFiltradas.length > 0) {
        ventasFiltradas.forEach((deuda) => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", deuda.ventaid);
            row.innerHTML = `
                <td>${deuda.deudaid}</td>
                <td>${deuda.ventaid}</td>
                <td>${deuda.nombres} ${deuda.apellidos}</td>
                <td>C$ ${Number(deuda.montodeuda).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}</td>
                <td>${deuda.fechaventa}</td>
                <td>
                    <button class="btn btn-sm btn-primary" data-id="${deuda.ventaid}">Ver detalles</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML =
            '<tr><td colspan="5" class="text-center">No se encontraron deudas para este cliente.</td></tr>';
    }
}

// Actualizar el total basado en los valores de la columna 'Monto'
function updateTotal() {
    const rows = document.querySelectorAll("#paymentHistory tbody tr");
    let total = 0;

    rows.forEach((row) => {
        const montoCell = row.querySelector("td:nth-child(4)");
        if (montoCell) {
            const monto = parseFloat(
                montoCell.textContent.replace("C$", "").replace(/,/g, "").trim()
            );
            if (!isNaN(monto)) {
                total += monto;
            }
        }
    });

    const totalElement = document.getElementById("total");
    totalElement.innerHTML = `<strong>Total Deuda: C$ ${total.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}</strong>`;
}

// Asignar la cédula del cliente seleccionado
$(document).ready(function () {
    $("#customerSelect").select2({
        placeholder: "Seleccione un cliente",
        allowClear: true,
    });

    $("#customerSelect").on("select2:select", function (e) {
        const cedula = $("#customerSelect option:selected").data("cedula");
        $("#clientCedula").val(cedula || "");
    });
});

// Mostrar detalles de las ventas en el modal
document.addEventListener("click", function (event) {
    if (event.target && event.target.matches("button.btn-primary")) {
        const ventaId = event.target.getAttribute("data-id"); // Obtener el ID directamente del botón

        if (ventaId) {
            const venta = sales_data.find((v) => v.ventaid == ventaId);
            if (venta) {
                const clienteNombre = `${venta.nombres} ${venta.apellidos}`;

                const montoVenta = venta.montoventa
                    ? Number(venta.montoventa).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })
                    : "0.00";
                const fechaVenta = venta.fechaventa;

                document.getElementById("clienteNombre").textContent = clienteNombre || "N/A";
                document.getElementById("fechaVenta").textContent = fechaVenta || "N/A";
                document.getElementById("ventaTotal").textContent = `C$ ${montoVenta}`;

                document.getElementById(
                    "detallesVentaModalLabel"
                ).textContent = `Detalles de la Venta (${ventaId})`;
                mostrarDetallesVenta(ventaId);
            } else {
                console.error(`No se encontró la venta con ID ${ventaId}`);
            }
        } else {
            console.error("No se encontró el atributo data-id en el botón.");
        }
    }
});

// Función para obtener y mostrar los productos en el modal de detalles
function mostrarDetallesVenta(ventaId) {
    fetch(`/detallesVentas/${ventaId}`)
        .then((response) => response.json())
        .then((data) => {
            const productosTableBody = document.getElementById("productosTableBody");
            productosTableBody.innerHTML = ""; // Limpiar la tabla actual

            if (data.success && data.productos.length > 0) {
                let totalVenta = 0;

                data.productos.forEach((producto) => {
                    const subtotal = producto.preciounitario * producto.cantidad;
                    totalVenta += subtotal;

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${producto.nombre}</td>
                        <td>${producto.cantidad}</td>
                        <td>C$${producto.preciounitario.toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</td>
                        <td>C$${subtotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}</td>
                    `;
                    productosTableBody.appendChild(row);
                });

                document.getElementById("ventaTotal").textContent =
                    totalVenta.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
            } else {
                productosTableBody.innerHTML =
                    '<tr><td colspan="4" class="text-center">No se encontraron productos para esta venta.</td></tr>';
            }

            let detallesModal = new bootstrap.Modal(
                document.getElementById("detallesVentaModal")
            );
            detallesModal.show();
        })
        .catch((error) => {
            console.error("Error al obtener los productos:", error);
        });
}

// Obtener todos los ventaid de las ventas mostradas en la tabla
function obtenerVentaIds() {
    const ventaIds = [];
    const rows = document.querySelectorAll("#paymentHistory tbody tr");
    rows.forEach((row) => {
        const ventaId = row.getAttribute("data-id");
        if (ventaId) {
            ventaIds.push(ventaId);
        }
    });
    return ventaIds;
}

// Función para mostrar el modal de pago con la información de la deuda
function mostrarPagoModal(clienteNombre, ventaIds, totalDeuda) {
    document.getElementById("nombreClientePago").textContent = clienteNombre;
    document.getElementById("ventaIdsPago").textContent = ventaIds.join(", ");

    const montoInput = document.getElementById("montoParcialInput");
    montoInput.value = totalDeuda.toFixed(2);
    montoInput.disabled = true;

    let pagoModal = new bootstrap.Modal(document.getElementById("pagoModal"));
    pagoModal.show();

    // Eliminar event listeners anteriores si existen
    const botonPago = document.getElementById("confirmarPagoBtn");
    const botonPagoClon = botonPago.cloneNode(true);
    botonPago.parentNode.replaceChild(botonPagoClon, botonPago);

    botonPagoClon.addEventListener("click", function () {
        const clienteId = document.getElementById("customerSelect").value;
        const montoAbono = document.getElementById("montoParcialInput").value;

        if (clienteId && montoAbono) {
            fetch("/registrarPago", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clienteid: clienteId,
                    montoabono: montoAbono,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        mostrarAlertaBootstrap("Pago registrado exitosamente", "success");
                        pagoModal.hide();
                        window.location.reload();
                    } else {
                        mostrarAlertaBootstrap(
                            "Error al registrar el pago: " + data.message,
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        } else {
            mostrarAlertaBootstrap(
                "Por favor complete los campos de cliente y monto",
                "warning"
            );
        }
    });

    // Habilitar/deshabilitar el campo de pago parcial
    document
        .getElementById("pagoModal")
        .addEventListener("shown.bs.modal", function () {
            document
                .getElementById("pagoParcial")
                .addEventListener("change", function () {
                    montoInput.disabled = false;

                    // Limpiar el campo
                    montoInput.addEventListener("focus", function () {
                        montoInput.value = "";
                    });
                });

            document
                .getElementById("pagoTotal")
                .addEventListener("change", function () {
                    montoInput.value = totalDeuda.toFixed(2);
                    montoInput.disabled = true;
                });
        });
}

// Manejar el clic en el botón "Realizar Pago" para abrir el modal de pago
document
    .getElementById("realizarPagoBtn")
    .addEventListener("click", function () {
        const ventaIds = obtenerVentaIds();
        let totalDeuda = 0;

        if (ventaIds.length > 0) {
            const clienteNombre =
                document.getElementById("customerSelect").selectedOptions[0]
                    .textContent;

            const rows = document.querySelectorAll("#paymentHistory tbody tr");
            rows.forEach((row) => {
                const montoCell = row.querySelector("td:nth-child(4)");
                const monto = parseFloat(
                    montoCell.textContent.replace("C$", "").replace(/,/g, "").trim()
                );
                if (!isNaN(monto)) {
                    totalDeuda += monto;
                }
            });

            mostrarPagoModal(clienteNombre, ventaIds, totalDeuda);
        } else {
            mostrarAlertaBootstrap(
                "No hay ventas disponibles para realizar el pago.",
                "warning"
            );
        }
    });

// Función para mostrar el historial de pagos en el modal
function cargarHistorialPago(historial) {
    const historialTableBody = document
        .getElementById("historialPagoTable")
        .querySelector("tbody");
    historialTableBody.innerHTML = ""; // Limpiar la tabla antes de agregar los datos

    if (!Array.isArray(historial) || historial.length === 0) {
        // Si no hay historial de pagos, mostrar un mensaje en la tabla
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" class="text-center">No se han registrado pagos para este cliente.</td>`;
        historialTableBody.appendChild(row);
    } else {
        // Si hay historial de pagos, agregar filas a la tabla
        historial.forEach((pago) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pago.pagoid || "N/A"}</td>
                <td>${pago.deudaid || "N/A"}</td>
                <td>C$ ${pago.montoabono.toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2,})}</td>
                <td>${pago.fechapago || "N/A"}</td>
                <td>${pago.tipopago || "N/A"}</td>
                <td>
                 <button class="btn btn-sm btn-danger delete-button" data-id="${pago.pagoid}">Eliminar</button>
                </td>
                
            `;
            historialTableBody.appendChild(row);
        });
    }

    // Filtrar las filas de la tabla según el texto de búsqueda
    document
        .getElementById("historialPagoSearch")
        .addEventListener("input", function () {
            const searchValue = this.value.toLowerCase();
            const rows = document.querySelectorAll("#historialPagoTable tbody tr");

            rows.forEach((row) => {
                const rowText = row.innerText.toLowerCase();
                row.style.display = rowText.includes(searchValue) ? "" : "none";
            });
        });
}

// Función para abrir el modal de historial de pagos
function mostrarHistorialPagoModal(clienteNombre, clienteCedula,  historialPago) {
    document.getElementById("nombreClienteHistorial").textContent = clienteNombre;
    document.getElementById("cedulaClienteHistorial").textContent = clienteCedula;

    cargarHistorialPago(historialPago);

    const historialPagoModal = new bootstrap.Modal(
        document.getElementById("historialPagoModal")
    );
    historialPagoModal.show();
}

// Evento click en el botón "Historial de Pagos"
document.getElementById("historialPagosBtn").addEventListener("click", function () {
        const clienteId = document.getElementById("customerSelect").value;
        const clienteNombre = document.getElementById("customerSelect").selectedOptions[0].textContent;
        const clienteCedula = document.getElementById("clientCedula").value;

        if (clienteId) {
            console.log(
                `Solicitando historial de pagos para el cliente ID: ${clienteId}`
            );

            fetch(`/getHistorialPagos/${clienteId}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Datos recibidos del backend:", data); // Verifica los datos recibidos en la consola
                    if (data.success) {
                        mostrarHistorialPagoModal(clienteNombre, clienteCedula, data.historial);
                    } else {
                        mostrarAlertaBootstrap(
                            "Error al cargar el historial de pagos: " + data.message,
                            "danger"
                        );
                    }
                })
                .catch((error) => {
                    console.error("Error al realizar la solicitud:", error);
                    mostrarAlertaBootstrap(
                        "Error al cargar el historial de pagos.",
                        "danger"
                    );
                });
        } else {
            mostrarAlertaBootstrap(
                "Seleccione un cliente para ver su historial de pagos.",
                "warning"
            );
        }
    });
