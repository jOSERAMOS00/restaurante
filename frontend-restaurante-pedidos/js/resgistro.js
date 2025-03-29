const d =document

d.addEventListener("DOMContentLoaded", () => {
    const btnGuardar = d.querySelector(".btn-guardar");

    btnGuardar.addEventListener("click", () => {
        registrarUsuario();
    });
});

const registrarUsuario = async () => {
    const user = d.getElementById("user").value.trim();
    const name = d.getElementById("name").value.trim();
    const rol = d.getElementById("rol").value;
    const password = d.getElementById("password").value.trim();

    // Validar que todos los campos estén llenos
    if (!user || !name || !rol || !password) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    const usuarioData = {
        user,
        name,
        rol,
        password
    };

    try {
        const response = await fetch("http://localhost:3005/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuarioData)
        });

        const result = await response.json();
        console.log("Respuesta del servidor:", result);

        if (result.success) {
            alert("Usuario registrado correctamente.");
            window.location.href = "./login.html"; // Redirigir al login después del registro
        } else {
            alert("Error al registrar usuario: " + result.message);
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Hubo un problema al registrar el usuario.");
    }
};
