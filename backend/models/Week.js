const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Week = sequelize.define('Week', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mes: {
    type: DataTypes.ENUM('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
    allowNull: false,
  },
  semana: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  tableName: 'weeks',
  timestamps: true,
});

module.exports = Week;
