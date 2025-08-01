const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Phone = sequelize.define('Phone', {
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
  phoneNumber: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'phones',
  timestamps: true,
});

// Establecer la relación "uno a muchos" entre el modelo User y el modelo Phone
User.hasMany(Phone, {
  foreignKey: {
    allowNull: false,
  },
  onDelete: 'CASCADE',
});
Phone.belongsTo(User, { foreignKey: 'UserId' });

module.exports = Phone;
