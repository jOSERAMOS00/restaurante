// Función para cargar los datos de los pedidos
async function cargarPedidos() {
  try {
      // Obtener los datos del endpoint
      const response = await fetch('http://localhost:3005/mesero');
      if (!response.ok) {
          throw new Error('Error al cargar los pedidos');
      }
      
      const resultado = await response.json();
      
      // Verificar si la petición fue exitosa
      if (!resultado.success) {
          throw new Error(resultado.message || 'Error al obtener los pedidos');
      }
      
      // Obtener los pedidos separados
      const { porEntregar, entregado } = resultado.data;
      console.log(porEntregar, entregado)
      
      // Renderizar los pedidos en las tablas correspondientes
      renderizarPedidosPorEntregar(porEntregar);
      renderizarPedidosEntregados(entregado);
      
      // Activar la primera pestaña al cargar
      document.getElementById("myLink").click();
      
  } catch (error) {
      console.error('Error:', error);
      mostrarMensajeError('No se pudieron cargar los pedidos. Por favor, intente nuevamente.');
  }
}

// Función para renderizar los pedidos por entregar
function renderizarPedidosPorEntregar(pedidos) {
  const tabla = document.querySelector('#Pizza tbody');
  tabla.innerHTML = ''; // Limpiar tabla antes de renderizar
  
  if (pedidos.length === 0) {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td colspan="3" class="text-center">No hay pedidos por entregar</td>`;
      tabla.appendChild(fila);
      return;
  }
  
  pedidos.forEach(pedido => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
          <td>${pedido.platillo} (${pedido.cantidad})</td>
          <td>${pedido.mesa}</td>
          <td>
              <button class="badge btn btn-success" onclick="entregarPedido(${pedido.id})">
                  Entregar
              </button>
          </td>
      `;
      tabla.appendChild(fila);
  });
}

// Función para renderizar los pedidos entregados
function renderizarPedidosEntregados(pedidos) {
  const tabla = document.querySelector('#Pasta tbody');
  tabla.innerHTML = ''; // Limpiar tabla antes de renderizar
  
  if (pedidos.length === 0) {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td colspan="3" class="text-center">No hay pedidos entregados</td>`;
      tabla.appendChild(fila);
      return;
  }
  
  pedidos.forEach(pedido => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
          <td>${pedido.platillo} (${pedido.cantidad})</td>
          <td>${pedido.mesa}</td>
          <td><span class="badge bg-success">Entregado</span></td>
      `;
      tabla.appendChild(fila);
  });
}

// Función para cambiar el estado de un pedido a "Entregado"
async function entregarPedido(id) {
  try {
      const response = await fetch(`http://localhost:3005/entregado/`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: id
          })
      });
      
      const resultado = await response.json();
      
      if (!response.ok || !resultado.success) {
          throw new Error(resultado.message || 'Error al entregar el pedido');
      }
      
      // Recargar los pedidos después de la actualización
      cargarPedidos();
      
      // Mostrar mensaje de éxito
      mostrarMensajeExito(`Pedido #${id} entregado con éxito`);
      
  } catch (error) {
      console.error('Error:', error);
      mostrarMensajeError('No se pudo entregar el pedido. Por favor, intente nuevamente.');
  }
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
  // Crear elemento para el mensaje
  const alerta = document.createElement('div');
  alerta.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
  alerta.setAttribute('role', 'alert');
  alerta.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Agregar al documento
  document.body.appendChild(alerta);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
      alerta.remove();
  }, 3000);
}

// Función para mostrar mensaje de error
function mostrarMensajeError(mensaje) {
  // Crear elemento para el mensaje
  const alerta = document.createElement('div');
  alerta.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
  alerta.setAttribute('role', 'alert');
  alerta.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Agregar al documento
  document.body.appendChild(alerta);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
      alerta.remove();
  }, 3000);
}

// Cargar pedidos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarPedidos();
  
  // Actualizar los pedidos cada 30 segundos
  setInterval(cargarPedidos, 30000);
});