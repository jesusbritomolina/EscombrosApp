const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Week = require('./Week');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  semana_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Week,
      key: 'id',
    },
  },
  totalCallsSum: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  totalAmountSum: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  pago: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  estatus: {
    type: DataTypes.ENUM('Pendiente', 'Pagado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  banco: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  captura_id: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  captura_url: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['UserId', 'semana_id'],
    },
  ],
});

Payment.belongsTo(User, { foreignKey: 'UserId' });
Payment.belongsTo(Week, { foreignKey: 'semana_id', onDelete: 'CASCADE' });
User.hasMany(Payment, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Week.hasMany(Payment, { foreignKey: 'semana_id', onDelete: 'CASCADE' });

module.exports = Payment;
