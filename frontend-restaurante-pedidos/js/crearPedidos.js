document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".btn-pedido").forEach(btn => {
        btn.addEventListener("click", function () {
            console.log("✅ Botón 'Pedir' clickeado");
            crearPedido(this);
        });
    });
});

function crearPedido(boton) {
    // Buscar el formulario más cercano al botón presionado
    const formulario = boton.closest("form");

    if (!formulario) {
        console.error("❌ Error: No se encontró el formulario asociado al botón.");
        alert("⚠️ Error: No se pudo encontrar el formulario.");
        return;
    }

    // Capturar los valores dentro de este formulario
    const platillo = formulario.querySelector("select[name='platillo']").value;
    const precio = formulario.querySelector("#precio").value;
    const mesa = formulario.querySelector("#mesa").value;
    const cantidad = formulario.querySelector(".cantidad").value;
    const observaciones = formulario.querySelector("#observaciones").value;
    const cliente = formulario.querySelector(".cliente").value;
    const fecha = formulario.querySelector(".fecha").value;

    // Verificar que los campos no estén vacíos
    if (!platillo || !precio || !mesa || !cantidad || !cliente || !fecha) {
        alert("⚠️ Todos los campos son obligatorios.");
        return;
    }

    // Crear objeto del pedido
    const pedido = {
        platillo,
        precio: parseFloat(precio),
        mesa: parseInt(mesa),
        cantidad: parseInt(cantidad),
        observaciones,
        cliente,
        fecha
    };

    // Enviar la solicitud POST
    fetch("http://localhost:3005/pedido", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pedido)
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Pedido creado:", data);
        alert("✅ Pedido creado con éxito");

        // Limpiar el formulario
        formulario.reset();
    })
    .catch(error => {
        console.error("❌ Error al crear el pedido:", error);
        alert("❌ Error al crear el pedido");
    });
}
