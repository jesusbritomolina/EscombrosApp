'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'bankEmail', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'bankEmail');
  }
};
