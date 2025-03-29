const d = document;
const userInput = d.querySelector("#user");
const passInput = d.querySelector("#password");
const btonLogin = d.querySelector(".btnLogin");

btonLogin.addEventListener("click", () => {
    let dataForm = getData();
    if (dataForm) sendData(dataForm); // Solo envía si hay datos válidos
});

let getData = () => {
    if (!userInput.value || !passInput.value) {
        alert("El usuario y la contraseña son obligatorios");
        return null; // Retorna null para evitar que el código siga
    }

    let user = {
        user: userInput.value.trim(),
      password: passInput.value.trim()
    };

    userInput.value = "";
    passInput.value = "";
    
    console.log("📌 Datos del usuario:", user);
    return user;
};

let sendData = async (data) => {
    let url = "http://localhost:3005/login";
    try {
        let respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (respuesta.status === 401) {
            alert("Usuario y/o contraseña incorrecto");
        } else {
            let userLogin = await respuesta.json();
            console.log("Respuesta del servidor:", userLogin);       
            alert(`Bienvenido: ${userLogin.user}`);



            // Guardar datos en localStorage
            localStorage.setItem("userLogin", JSON.stringify(userLogin));

      

            switch (userLogin.rol) {  // Usar la variable 'rol' en el switch
                case "chef":
                    location.href = "./chef.html";
                    break;
                case "cajero":
                    location.href = "./cajero.html";
                    break;
                case "mesero":
                    location.href = "./mesero.html";
                    break;
                default:
                    alert("Rol no reconocido. Redirigiendo a la página principal.");
                    location.href = "./index.html";
                    break;
            }
        }
    } catch (error) {
        console.log(error);
    }
};

