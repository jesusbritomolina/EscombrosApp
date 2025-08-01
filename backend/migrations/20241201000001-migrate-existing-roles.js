'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Mapear roles existentes a nuevos roles
    // Propietario -> Cliente (usuarios que manejan pagos)
    // Trabajador -> Transportista (usuarios que prestan servicios)
    // Administrador -> Administrador (se mantiene igual)
    
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET rol = CASE 
        WHEN rol = 'Propietario' THEN 'Cliente'
        WHEN rol = 'Trabajador' THEN 'Transportista'
        WHEN rol = 'Administrador' THEN 'Administrador'
        ELSE 'Cliente'
      END
      WHERE rol IN ('Propietario', 'Trabajador', 'Administrador')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir el mapeo de roles
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET rol = CASE 
        WHEN rol = 'Cliente' THEN 'Propietario'
        WHEN rol = 'Transportista' THEN 'Trabajador'
        WHEN rol = 'Administrador' THEN 'Administrador'
        ELSE 'Trabajador'
      END
      WHERE rol IN ('Cliente', 'Transportista', 'Administrador')
    `);
  }
}; 