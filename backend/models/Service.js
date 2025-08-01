const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    comment: 'ID del cliente que solicita el servicio'
  },
  transportistId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
    comment: 'ID del transportista asignado'
  },
  serviceType: {
    type: DataTypes.ENUM('Por Peso', 'Por Trayecto', 'Por Material'),
    allowNull: false,
    comment: 'Tipo de servicio'
  },
  originAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Dirección de origen'
  },
  destinationAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Dirección de destino'
  },
  originCoordinates: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Coordenadas de origen (lat,lng)'
  },
  destinationCoordinates: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Coordenadas de destino (lat,lng)'
  },
  materialType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tipo de material (escombros, tierra, etc.)'
  },
  materialDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del material'
  },
  estimatedWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Peso estimado en toneladas'
  },
  estimatedVolume: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Volumen estimado en metros cúbicos'
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Distancia en kilómetros'
  },
  estimatedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio estimado del servicio'
  },
  finalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio final acordado'
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'Aceptado', 'En Progreso', 'Completado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente',
    comment: 'Estado del servicio'
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha programada para el servicio'
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de completado'
  },
  clientNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del cliente'
  },
  transportistNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas del transportista'
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pendiente', 'Pagado', 'Reembolsado'),
    allowNull: false,
    defaultValue: 'Pendiente',
    comment: 'Estado del pago'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Método de pago (Nequi, PSE, etc.)'
  },
  paymentReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Referencia del pago'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Calificación del servicio (1-5)'
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reseña del cliente'
  }
}, {
  tableName: 'services',
  timestamps: true,
});

// Relaciones
Service.belongsTo(User, { as: 'Client', foreignKey: 'clientId' });
Service.belongsTo(User, { as: 'Transportist', foreignKey: 'transportistId' });

module.exports = Service; 