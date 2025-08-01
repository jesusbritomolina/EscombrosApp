require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT || 3306,
    "dialect": "mysql",
    "timezone": "-04:00",
    "logging": false
  },
  "test": {
    // Asegúrate de configurar tus variables de entorno para la base de datos de prueba
    "username": process.env.TEST_DB_USER,
    "password": process.env.TEST_DB_PASSWORD,
    "database": process.env.TEST_DB_NAME,
    "host": process.env.TEST_DB_HOST,
    "port": process.env.TEST_DB_PORT || 3306,
    "dialect": "mysql",
    "timezone": "-04:00",
    "logging": false
  },
  "production": {
    // Asegúrate de configurar tus variables de entorno para la base de datos de producción
    "username": process.env.PROD_DB_USER,
    "password": process.env.PROD_DB_PASSWORD,
    "database": process.env.PROD_DB_NAME,
    "host": process.env.PROD_DB_HOST,
    "port": process.env.PROD_DB_PORT || 3306,
    "dialect": "mysql",
    "timezone": "-04:00",
    "logging": false
  }
}
