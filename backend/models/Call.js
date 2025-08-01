const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Phone = require('./Phone');
const Week = require('./Week');

const Call = sequelize.define('Call', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  telefono_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Phone,
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
  calls1stCut: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  firstCut: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  calls2ndCut: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  secondCut: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  callsFinalCut: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  finalCut: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalCalls: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  }
}, {
  tableName: 'calls',
  timestamps: true,
});

Call.belongsTo(Phone, { foreignKey: 'telefono_id' });
Call.belongsTo(Week, { foreignKey: 'semana_id', onDelete: 'CASCADE' });
// Establecer la relación "uno a muchos" entre el modelo Phone y Week con el modelo Call
Phone.hasMany(Call, { foreignKey: 'telefono_id' });
Week.hasMany(Call, { foreignKey: 'semana_id', onDelete: 'CASCADE' });

module.exports = Call;
