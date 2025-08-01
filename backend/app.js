const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const { backupData } = require('./controllers/adminController');
const { sequelize } = require('./config/database');
const executeSQLScript = require('./config/sql_scripts');

dotenv.config();

const app = express();

// Configuración y middlewares
var allowedOrigins = process.env.CORS_ORIGINS.split(',');

app.use(cors({
  origin: function(origin, callback){
    // permitir solicitudes sin 'origin' (por ejemplo, mobile apps o curl requests)
    if(!origin) return callback(null, true);
    
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'La política CORS para este sitio no permite el acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas para API
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/owners', userManagementRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/services', serviceRoutes);

// Solo servir archivos del frontend en desarrollo
if (process.env.NODE_ENV !== 'production') {
  // Sirviendo archivos estáticos de frontend
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Manejando todas las demás rutas para soportar el enrutamiento del lado del cliente
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // En producción, solo servir la API
  app.get('/', (req, res) => {
    res.json({ message: 'JS Home Services API está funcionando correctamente' });
  });
  
  // Manejar rutas no encontradas en producción
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });
}

// Exportar semanas a Google Sheets los lunes a las 2AM
cron.schedule('0 2 * * 1', async function() {
  try {
    await backupData();
  } catch (error) {
    console.error('Error al respaldar los datos:', error);
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;

sequelize.sync()
// Comenta arriba y descomenta abajo para forzar la actualizacion de la BD (OJO borrara todos los datos de la BD)
//sequelize.sync({ force: true })
  .then(async () => {
    // Ejecuta los scripts SQL
    await executeSQLScript();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
