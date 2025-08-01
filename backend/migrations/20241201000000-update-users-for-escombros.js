'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Actualizar el enum de roles
    await queryInterface.changeColumn('users', 'rol', {
      type: Sequelize.ENUM('Cliente', 'Transportista', 'Administrador'),
      allowNull: false,
      defaultValue: 'Cliente',
    });

    // Agregar nuevos campos para transportistas
    await queryInterface.addColumn('users', 'vehicleType', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Tipo de vehículo (camión, volqueta, etc.)'
    });

    await queryInterface.addColumn('users', 'vehicleCapacity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Capacidad en toneladas'
    });

    await queryInterface.addColumn('users', 'coverageZone', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Zona de cobertura (JSON con coordenadas)'
    });

    await queryInterface.addColumn('users', 'materialsAccepted', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Tipos de materiales que transporta (JSON)'
    });

    await queryInterface.addColumn('users', 'availabilitySchedule', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Horarios de disponibilidad (JSON)'
    });

    await queryInterface.addColumn('users', 'licenseNumber', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Número de licencia de conducir'
    });

    await queryInterface.addColumn('users', 'vehiclePlate', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Placa del vehículo'
    });

    await queryInterface.addColumn('users', 'documentsVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Si los documentos han sido verificados por admin'
    });

    // Agregar campos para clientes
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Dirección del cliente'
    });

    await queryInterface.addColumn('users', 'phoneNumber', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Número de teléfono del cliente'
    });

    // Campos comunes
    await queryInterface.addColumn('users', 'profileImage', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'URL de la imagen de perfil'
    });

    await queryInterface.addColumn('users', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir el enum de roles
    await queryInterface.changeColumn('users', 'rol', {
      type: Sequelize.ENUM('Propietario', 'Administrador', 'Trabajador'),
      allowNull: false,
      defaultValue: 'Trabajador',
    });

    // Remover campos agregados
    await queryInterface.removeColumn('users', 'vehicleType');
    await queryInterface.removeColumn('users', 'vehicleCapacity');
    await queryInterface.removeColumn('users', 'coverageZone');
    await queryInterface.removeColumn('users', 'materialsAccepted');
    await queryInterface.removeColumn('users', 'availabilitySchedule');
    await queryInterface.removeColumn('users', 'licenseNumber');
    await queryInterface.removeColumn('users', 'vehiclePlate');
    await queryInterface.removeColumn('users', 'documentsVerified');
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'phoneNumber');
    await queryInterface.removeColumn('users', 'profileImage');
    await queryInterface.removeColumn('users', 'isActive');
  }
}; 