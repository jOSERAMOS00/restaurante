document.addEventListener("DOMContentLoaded", function () { 
    console.log("Documento cargado, ejecutando cargarPedidos...");
    cargarPedidos();
});

// Función para obtener y mostrar los pedidos en la tabla   
function cargarPedidos() {
    fetch("http://localhost:3005/pedidos")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("tbody");
            tbody.innerHTML = "";
            data.forEach(pedido => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${pedido.platillo}</td>
                    <td>${pedido.mesa}</td>
                    <td>${pedido.estado}</td>
                    <td>
                        <button class="btn btn-primary"     onclick="abrirModalEditar(${pedido.id}, '${pedido.platillo}', ${pedido.mesa}, '${pedido.estado}', 
                       ${pedido.precio}, ${pedido.cantidad}, '${pedido.observaciones}', '${pedido.cliente}', '${pedido.fecha}')">
                          Editar
                        </button>


                        <button class="btn btn-danger" onclick="eliminarPedido(${pedido.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(error => console.error("Error al cargar los pedidos:", error));
}

// Función para abrir el modal con la información del pedido seleccionado
function abrirModalEditar(id, platillo, mesa, estado, precio, cantidad, observaciones, cliente, fecha) {
    console.log("Mesa recibida:", mesa); // Verifica si llega bien

    document.getElementById("pedidoId").value = id;
    document.getElementById("inputPlatillo").value = platillo;
    document.getElementById("inputMesa").value = mesa;
    document.getElementById("inputEstado").value = estado;
    document.getElementById("inputPrecio").value = precio;
    document.getElementById("inputCantidad").value = cantidad;
    document.getElementById("inputObservaciones").value = observaciones;
    document.getElementById("inputCliente").value = cliente;
    document.getElementById("inputFecha").value = fecha;
    
    new bootstrap.Modal(document.getElementById("modalEditarPedido")).show();
}

// Función para actualizar el pedido

// Función para actualizar el pedido
function guardarCambiosPedido() {
    const id = document.getElementById("pedidoId").value;
    const platillo = document.getElementById("inputPlatillo").value;
    const mesa = document.getElementById("inputMesa").value;
    const estado = document.getElementById("inputEstado").value;
    const precio = parseFloat(document.getElementById("inputPrecio").value);
    const cantidad = parseInt(document.getElementById("inputCantidad").value);
    const observaciones = document.getElementById("inputObservaciones").value;
    const cliente = document.getElementById("inputCliente").value;
    const fecha = document.getElementById("inputFecha").value;

    if (!id || !platillo || isNaN(precio) || isNaN(cantidad) || !cliente || !fecha || !estado) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    fetch("http://localhost:3005/pedido", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, platillo, precio, mesa, cantidad, observaciones, cliente, fecha, estado })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Pedido actualizado con éxito.");
            cargarPedidos();



            // Cerrar modal correctamente
            const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarPedido"));
            if (modal) modal.hide();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al actualizar el pedido:", error));
}



// Función para eliminar un pedido
function eliminarPedido(id) {
    if (confirm("¿Está seguro de que desea eliminar este pedido?")) {
        fetch("http://localhost:3005/pedido", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        })
        .then(response => response.json())
        .then(() => {
            alert("Pedido eliminado");
            cargarPedidos();
        })
        .catch(error => console.error("Error al eliminar el pedido:", error));
    }
}
