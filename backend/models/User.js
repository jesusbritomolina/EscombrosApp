const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rol: {
    type: DataTypes.ENUM('Propietario', 'Administrador', 'Trabajador'),
    allowNull: false,
    defaultValue: 'Trabajador',
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bankEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
