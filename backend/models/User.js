const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rol: {
    type: DataTypes.ENUM('Cliente', 'Transportista', 'Administrador'),
    allowNull: false,
    defaultValue: 'Cliente',
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
  // Campos específicos para transportistas
  vehicleType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Tipo de vehículo (camión, volqueta, etc.)'
  },
  vehicleCapacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Capacidad en toneladas'
  },
  coverageZone: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Zona de cobertura (JSON con coordenadas)'
  },
  materialsAccepted: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Tipos de materiales que transporta (JSON)'
  },
  availabilitySchedule: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Horarios de disponibilidad (JSON)'
  },
  licenseNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de licencia de conducir'
  },
  vehiclePlate: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Placa del vehículo'
  },
  documentsVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si los documentos han sido verificados por admin'
  },
  // Campos específicos para clientes
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección del cliente'
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número de teléfono del cliente'
  },
  // Campos comunes
  profileImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL de la imagen de perfil'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
