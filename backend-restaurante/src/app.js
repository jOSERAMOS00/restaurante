const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql2/promise'); // Usar promise para async/await
const cors = require('cors');
const app = express();

// Habilitar las políticas de CORS para peticiones externas
app.use(cors());

// Configurar Express para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del servidor
app.set('port', process.env.PORT || 3005);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de la base de datos
const dbConfig = {
  host: 'caboose.proxy.rlwy.net',
  user: 'root',
  password: 'guhzSUlPMrVUxFgHXIAyfDdDgJLWuLAM',
  database: 'railway',
  port:27925,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 30,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

module.exports = pool;
// Middleware para agregar `req.getConnection` y que funcione en el controlador
app.use((req, res, next) => {
  req.getConnection = async () => {
    return pool.getConnection(); // ✅ Retorna la conexión sin callback
  };
  next();
});


// Middlewares generales
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importando rutas (después de configurar `req.getConnection`)
const routes = require('./routes/routes');
app.use('/', routes);

// Archivos estáticos (ya está arriba, pero lo dejo aquí para asegurarnos)
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log(`✅ Servidor en el puerto ${app.get('port')}`);
});
