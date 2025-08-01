'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Primero, eliminamos la clave externa actual
    await queryInterface.removeConstraint('payments', 'payments_ibfk_2');

    // Luego, agregamos la nueva clave externa con la opción onDelete: 'CASCADE'
    await queryInterface.addConstraint('payments', {
      fields: ['semana_id'],
      type: 'foreign key',
      name: 'payments_ibfk_2',
      references: {
        table: 'weeks',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    // Para revertir la migración, primero eliminamos la clave externa actual
    await queryInterface.removeConstraint('payments', 'payments_ibfk_2');

    // Luego, recreamos la clave externa original sin la opción onDelete
    await queryInterface.addConstraint('payments', {
      fields: ['semana_id'],
      type: 'foreign key',
      name: 'payments_ibfk_2',
      references: {
        table: 'weeks',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'cascade'
    });
  }
};
