// Este trae la información de una URL 
function init(){
    fetch('http://localhost:3005/chef')
      .then(response => response.text())
      .then( json => {
        const objeto = JSON.parse(json);
        let Preparando = '';
        let Preparar = '';
        for (i in objeto.data) {
          let subData = objeto.data[i];
          let subRsult = '';
          let evento = '';
    
          if(i === "preparando"){
            evento = 'listo';
          }
          if(i === "preparar"){
            evento = 'preparando';
          }
    
          for(j in subData){
            subRsult += `          
              <tr>
                <td>${subData[j].id}</td>
                <td>${subData[j].platillo}</td>
                <td>${subData[j].cantidad}</td>
                <td>${subData[j].cliente}</td>
                <td>${subData[j].observaciones}</td>
                <td>
                    <form onclick="enviarDatos(${subData[j].id}, '${evento}')" method="post">
                        <button type="submit" class="btn btn-success">Preparar</button>
                    </form>
                </td>
            </tr>`;
          }
          if(i === "preparando"){
            Preparando += subRsult;
          }
          
          if(i === "preparar"){
            Preparar += subRsult;
          }
        }
        document.getElementById('Preparar').innerHTML = Preparar;
        document.getElementById('Preparando').innerHTML = Preparando;
      })
      .catch(error => console.error('Error al cargar la plantilla:', error));
  }
  
  function enviarDatos(id, evento) {
    const datos = {
        id: id,
    };
  
    fetch(`http://localhost:3005/${evento}`, {
        method: 'PUT',         // Método de la solicitud
        headers: {              // Encabezados para indicar que es JSON
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)  // Convertir el objeto a JSON
    })
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(data => {
        console.log('Respuesta del servidor:', data);
        location.reload(); // 🔄 Recargar la página después de la respuesta
    })
    .catch(error => console.error('Error:', error));
  }
  