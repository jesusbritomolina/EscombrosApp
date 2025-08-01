const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
};

const sequelize = new Sequelize(dbConfig.dbName, dbConfig.dbUser, dbConfig.dbPassword, {
  host: dbConfig.dbHost,
  port: process.env.DB_PORT || 3306,  // Incluye esta línea
  dialect: 'mysql',
  timezone: '-04:00',
  logging: false,
});


module.exports = { sequelize, dbConfig }; // Exporta la instancia de Sequelize y el objeto de configuración
