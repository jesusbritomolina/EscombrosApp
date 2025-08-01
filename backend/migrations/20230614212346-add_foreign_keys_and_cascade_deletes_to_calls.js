'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambia la columna 'semana_id' en la tabla 'calls' para que elimine en cascada cuando se elimina la semana asociada
    await queryInterface.removeConstraint('calls', 'calls_ibfk_2');
    await queryInterface.addConstraint('calls', {
      fields: ['semana_id'],
      type: 'foreign key',
      name: 'calls_ibfk_2',
      references: {
        table: 'weeks',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revirtiendo los cambios: quitar la opción de eliminar en cascada
    await queryInterface.removeConstraint('calls', 'calls_ibfk_2');
    await queryInterface.addConstraint('calls', {
      fields: ['semana_id'],
      type: 'foreign key',
      name: 'calls_ibfk_2',
      references: {
        table: 'weeks',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'cascade'
    });
  }
};
