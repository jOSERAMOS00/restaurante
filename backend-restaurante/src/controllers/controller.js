//Metodos para CRUD
const controller = {}

//BIENVENIDO
controller.login = async (req, res) => {
    try {
        const conn = await req.getConnection(); // ✅ Obtiene la conexión con await
        console.log("BIENVENIDO RESTAURANTE");
        res.json({ "Message": "Bienvenido API Restaurante Ratatouille" });
        conn.release(); // ✅ Libera la conexión después de usarla
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//LOGIN
controller.login_in = async (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "El nombre de usuario y la contraseña son obligatorios" 
        });
    }

    console.log("Intento de inicio de sesión:", { user });

    try {
        const conn = await req.getConnection();
        const [results] = await conn.query('SELECT * FROM users WHERE user = ?', [user]);
        conn.release(); // Liberar la conexión

        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Usuario o contraseña incorrecta" 
            });
        }

        const userRecord = results[0];
        const { password: _, ...userData } = userRecord; 

        return res.status(200).json({ 
            success: true, 
            message: "Inicio de sesión exitoso", 
            user: userData.user ,
            rol: userData.rol
        });

    } catch (err) {
        console.error("Error en la consulta SQL:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor" 
        });
    }
};


//CREAR USUARIO
controller.save_register = async (req, res) => {
    const { user, name, rol, password } = req.body;
    console.log("Servidor recibió los datos:", req.body);

    // Validar campos obligatorios
    if (!user || !name || !rol || !password) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    try {
        // Obtener conexión a la base de datos
        const conn = await req.getConnection();

        // Verificar si el usuario ya existe en la base de datos
        const [rows] = await conn.query('SELECT * FROM users WHERE user = ?', [user]);

        if (rows.length > 0) {
            conn.release(); // Liberar la conexión antes de salir
            return res.status(400).json({
                success: false,
                message: "El nombre de usuario ya está registrado"
            });
        }

        // Insertar el nuevo usuario en la base de datos
        const newUser = { user, name, rol, password };
        const [result] = await conn.query('INSERT INTO users SET ?', newUser);
        
        conn.release(); // Liberar la conexión después de la consulta

        return res.status(200).json({
            success: true,
            message: "Usuario registrado con éxito",
            userId: result.insertId // Devuelve el ID del usuario creado
        });

    } catch (err) {
        console.error("Error en la base de datos:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


controller.pedidos = async (req, res) => {
    let conn; // Variable para la conexión
  
    try {
      conn = await req.getConnection(); // ✅ Obtiene la conexión correctamente
      const [results] = await conn.query('SELECT * FROM pedido');
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) conn.release(); // ✅ Asegurar que la conexión se libere
    }
  };
  


//CREAR PEDIDO
controller.pedido = async (req, res) => {
    const { platillo, precio, mesa, cantidad, observaciones, cliente, fecha } = req.body;
    console.log("Datos recibidos:", req.body);

    // Validar campos obligatorios
    if (!platillo || !precio || !mesa || !cantidad || !cliente || !fecha) {
        return res.status(400).json({
            success: false,
            message: "Faltan campos obligatorios: platillo, precio, mesa, cantidad, cliente o fecha"
        });
    }

    // Validar tipos de datos
    if (typeof precio !== 'number' || typeof cantidad !== 'number') {
        return res.status(400).json({
            success: false,
            message: "Los campos 'precio' y 'cantidad' deben ser números"
        });
    }

    try {
        // Obtener la conexión a la base de datos
        const conn = await req.getConnection();

        // Insertar el pedido en la base de datos
        const [result] = await conn.query(`
            INSERT INTO pedido 
            (platillo, precio, mesa, cantidad, observaciones, cliente, fecha, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'preparar')
        `, [platillo, precio, mesa, cantidad, observaciones, cliente, fecha]);

        conn.release(); // Liberar la conexión

        return res.status(200).json({
            success: true,
            message: "Pedido registrado con éxito",
            id: result.insertId
        });

    } catch (err) {
        console.error("Error en la base de datos:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


//ACTUALIZAR PEDIDO
controller.update_pedido = async (req, res) => {
    const { id, platillo, cantidad, observaciones, precio, cliente, fecha, estado } = req.body;
    console.log("ID del pedido para actualizar:", id);

    // Validar que el ID esté presente
    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: "El ID del pedido es obligatorio" 
        });
    }

    // Validar que todos los campos requeridos estén presentes
    if (!platillo || !precio || !cantidad || !cliente || !fecha || !estado) {
        return res.status(400).json({ 
            success: false, 
            message: "Faltan campos obligatorios" 
        });
    }

    // Validar tipos de datos
    if (typeof precio !== 'number' || typeof cantidad !== 'number') {
        return res.status(400).json({ 
            success: false, 
            message: "Los campos 'precio' y 'cantidad' deben ser números" 
        });
    }

    try {
        // Obtener la conexión a la base de datos
        const conn = await req.getConnection();

        // Verificar si el pedido existe antes de actualizar
        const [existingOrder] = await conn.query('SELECT * FROM pedido WHERE id = ?', [id]);
        if (existingOrder.length === 0) {
            conn.release();
            return res.status(404).json({ 
                success: false, 
                message: "El pedido no existe" 
            });
        }

        // Actualizar el pedido
        const query = `
            UPDATE pedido 
            SET platillo = ?, precio = ?, cantidad = ?, observaciones = ?, cliente = ?, fecha = ?, estado = ? 
            WHERE id = ?`;
        const params = [platillo, precio, cantidad, observaciones, cliente, fecha, estado, id];

        const [result] = await conn.query(query, params);
        conn.release(); // Liberar conexión

        // Verificar si realmente se actualizó algún registro
        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "No se realizó ninguna actualización, revisa los datos enviados"
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Pedido actualizado con éxito" 
        });

    } catch (err) {
        console.error("Error al actualizar el pedido:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


//ELIMINAR PEDIDO
controller.delete_Pedido = async (req, res) => {
    // Obtener el ID del pedido desde el cuerpo de la solicitud
    const { id } = req.body;
    console.log("ID del pedido a eliminar:", id);

    // Validar que el ID esté presente
    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: "El ID del pedido es obligatorio" 
        });
    }

    try {
        // Obtener la conexión a la base de datos
        const conn = await req.getConnection();

        // Verificar si el pedido existe antes de eliminarlo
        const [existingOrder] = await conn.query('SELECT * FROM pedido WHERE id = ?', [id]);
        if (existingOrder.length === 0) {
            conn.release();
            return res.status(404).json({ 
                success: false, 
                message: "El pedido con el ID proporcionado no existe" 
            });
        }

        // Eliminar el pedido
        const [result] = await conn.query('DELETE FROM pedido WHERE id = ?', [id]);
        conn.release(); // Liberar la conexión

        // Verificar si realmente se eliminó un registro
        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar el pedido"
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Pedido eliminado con éxito" 
        });

    } catch (err) {
        console.error("Error al eliminar el pedido:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};


//OBTENER PEDIDOS POR PREPARAR PARA EL CHEF
controller.chef = async (req, res) => {
    console.log("📌 Ruta /chef llamada");

    try {
        // Obtener la conexión
        const conn = await req.getConnection();
        console.log("✅ Conexión obtenida correctamente");

        // Consulta SQL con TRIM para evitar espacios en blanco en los estados
        const query = `
            SELECT * 
            FROM pedido 
            WHERE TRIM(estado) IN ('preparar', 'preparando')
            ORDER BY estado, fecha;
        `;

        console.log("📡 Ejecutando consulta SQL...");

        // Ejecutar consulta con `execute`
        const [pedidos] = await conn.execute(query);

        // Liberar la conexión
        conn.release();
        console.log("📦 Datos obtenidos:", pedidos);

        // Separar los pedidos por estado
        const pedidosPorEstado = pedidos.reduce((acc, pedido) => {
            acc[pedido.estado] = acc[pedido.estado] || [];
            acc[pedido.estado].push(pedido);
            return acc;
        }, {});

        // Enviar la respuesta estructurada
        res.status(200).json({
            success: true,
            message: "Datos obtenidos correctamente",
            data: pedidosPorEstado
        });

    } catch (err) {
        console.error("❌ Error en la consulta:", err);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

//ROL CHEF - CAMBIAR ESTADO DEL PEDIDO "A PREPARANDO"
controller.preparando = async (req, res) => {
    const { id } = req.body;

    // Validar que el ID sea un número válido
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "El ID del pedido es inválido"
        });
    }

    console.log("📝 ID del pedido a actualizar:", id);

    let conn;
    try {
        // Obtener la conexión
        conn = await req.getConnection();
        console.log("✅ Conexión obtenida correctamente");

        // Verificar si el pedido existe
        const [pedidoExistente] = await conn.execute(
            'SELECT id FROM pedido WHERE id = ? LIMIT 1',
            [id]
        );

        if (pedidoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontró el pedido con el ID proporcionado"
            });
        }

        console.log("🔄 Pedido encontrado, actualizando estado...");

        // Actualizar el estado del pedido a "preparando"
        await conn.execute(
            'UPDATE pedido SET estado = ? WHERE id = ?',
            ['preparando', id]
        );

        console.log("✅ Pedido actualizado correctamente");

        res.status(200).json({
            success: true,
            message: "Estado del pedido actualizado a 'preparando'",
            pedidoId: id
        });

    } catch (err) {
        console.error("❌ Error al actualizar el estado del pedido:", err);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el estado del pedido"
        });
    } finally {
        if (conn) conn.release(); // Liberar conexión en todos los casos
    }
};


//ROL CHEF - CAMBIAR ESTADO DEL PEDIDO A "POR ENTREGAR"
controller.listo = async (req, res) => {
    const { id } = req.body;

    // Validar que el ID sea un número válido
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "El ID del pedido es inválido"
        });
    }

    console.log("📝 ID del pedido a actualizar:", id);

    let conn;
    try {
        // Obtener la conexión
        conn = await req.getConnection();
        console.log("✅ Conexión obtenida correctamente");

        // Verificar si el pedido existe
        const [pedidoExistente] = await conn.execute(
            'SELECT id FROM pedido WHERE id = ? LIMIT 1',
            [id]
        );

        if (pedidoExistente.length === 0) {
            console.log("⚠️ Pedido no encontrado en la base de datos");
            return res.status(404).json({
                success: false,
                message: "No se encontró el pedido con el ID proporcionado"
            });
        }

        console.log("🔄 Pedido encontrado, actualizando estado...");

        // Actualizar el estado del pedido a "entregar"
        await conn.execute(
            'UPDATE pedido SET estado = ? WHERE id = ?',
            ['entregar', id]
        );

        console.log("✅ Pedido actualizado correctamente a 'entregar'");

        res.status(200).json({
            success: true,
            message: "Estado del pedido actualizado a 'entregar'",
            pedidoId: id
        });

    } catch (err) {
        console.error("❌ Error al actualizar el estado del pedido:", err);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el estado del pedido"
        });
    } finally {
        if (conn) conn.release(); // Liberar conexión siempre
    }
};


//OBTENER PEDIDOS POR PREPARAR PARA EL MESERO
controller.mesero = async (req, res) => {
    console.log("📌 Ruta /mesero llamada");

    try {
        // Obtener la conexión a la base de datos
        const conn = await req.getConnection();
        console.log("✅ Conexión obtenida correctamente");

        // Consulta SQL
        const query = `
            SELECT id, platillo, cantidad, cliente, fecha, estado
            FROM pedido 
            WHERE estado IN ('entregar', 'entregado')
            ORDER BY estado, fecha;
        `;

        console.log("📡 Ejecutando consulta SQL...");
        const [pedidos] = await conn.execute(query);

        // Liberar conexión
        conn.release();
        console.log("📦 Datos obtenidos:", pedidos);

        // Separar los pedidos por estado
        const dataPorEntregar = pedidos.filter(pedido => pedido.estado === 'entregar');
        const dataEntregado = pedidos.filter(pedido => pedido.estado === 'entregado');

        // Enviar la respuesta estructurada
        res.status(200).json({
            success: true,
            message: "Datos obtenidos correctamente",
            data: {
                porEntregar: dataPorEntregar,
                entregado: dataEntregado
            }
        });

    } catch (err) {
        console.error("❌ Error en la petición del mesero:", err);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los pedidos"
        });
    }
};



// ROL MESERO - CAMBIAR ESTADO DEL PEDIDO A "ENTREGADO"
controller.finalizado = async (req, res) => {
    const { id } = req.body;

    // Validar que el ID sea un número y no esté vacío
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
            success: false,
            message: "El ID del pedido es inválido"
        });
    }

    console.log("📌 ID del pedido a actualizar:", id);

    try {
        // Obtener la conexión a la base de datos
        const conn = await req.getConnection();
        console.log("✅ Conexión obtenida correctamente");

        // Ejecutar la consulta de actualización
        const [result] = await conn.execute(
            'UPDATE pedido SET estado = ? WHERE id = ?',
            ['entregado', id]
        );

        // Liberar la conexión
        conn.release();
        console.log("📦 Resultado de la actualización:", result);

        // Verificar si se actualizó algún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontró el pedido con el ID proporcionado"
            });
        }

        // Enviar respuesta de éxito
        res.status(200).json({
            success: true,
            message: "Estado del pedido actualizado a 'entregado'",
            pedidoId: id
        });

    } catch (err) {
        console.error("❌ Error al actualizar el estado del pedido:", err);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el estado del pedido"
        });
    }
};


module.exports = controller;

