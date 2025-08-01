'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregando la columna 'emailVerified' a la tabla 'users'
    await queryInterface.addColumn('users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    // Agregando la columna 'resetPasswordToken' a la tabla 'users'
    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminando la columna 'emailVerified' de la tabla 'users'
    await queryInterface.removeColumn('users', 'emailVerified');
    // Eliminando la columna 'resetPasswordToken' de la tabla 'users'
    await queryInterface.removeColumn('users', 'resetPasswordToken');
  }
};
