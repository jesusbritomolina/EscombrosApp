const Service = require('../models/Service');
const User = require('../models/User');
const { Op } = require('sequelize');

// Crear nueva solicitud de servicio
const createService = async (req, res) => {
  try {
    const {
      serviceType,
      originAddress,
      destinationAddress,
      originCoordinates,
      destinationCoordinates,
      materialType,
      materialDescription,
      estimatedWeight,
      estimatedVolume,
      distance,
      estimatedPrice,
      scheduledDate,
      clientNotes
    } = req.body;

    const clientId = req.user.id; // Del token JWT

    const service = await Service.create({
      clientId,
      serviceType,
      originAddress,
      destinationAddress,
      originCoordinates,
      destinationCoordinates,
      materialType,
      materialDescription,
      estimatedWeight,
      estimatedVolume,
      distance,
      estimatedPrice,
      scheduledDate,
      clientNotes
    });

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: service
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el servicio',
      error: error.message
    });
  }
};

// Obtener servicios disponibles para transportistas
const getAvailableServices = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query; // radio en km

    const services = await Service.findAll({
      where: {
        status: 'Pendiente',
        transportistId: null
      },
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'username', 'email', 'phoneNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filtrar por distancia si se proporcionan coordenadas
    let filteredServices = services;
    if (latitude && longitude) {
      filteredServices = services.filter(service => {
        if (service.originCoordinates) {
          const [lat, lng] = service.originCoordinates.split(',').map(Number);
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            lat,
            lng
          );
          return distance <= radius;
        }
        return true;
      });
    }

    res.json({
      success: true,
      data: filteredServices
    });
  } catch (error) {
    console.error('Error al obtener servicios disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios disponibles',
      error: error.message
    });
  }
};

// Aceptar servicio (transportista)
const acceptService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const transportistId = req.user.id;

    const service = await Service.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    if (service.status !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'El servicio ya no está disponible'
      });
    }

    // Verificar que el transportista esté verificado
    const transportist = await User.findByPk(transportistId);
    if (!transportist.documentsVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta debe estar verificada para aceptar servicios'
      });
    }

    await service.update({
      transportistId,
      status: 'Aceptado'
    });

    res.json({
      success: true,
      message: 'Servicio aceptado exitosamente',
      data: service
    });
  } catch (error) {
    console.error('Error al aceptar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aceptar el servicio',
      error: error.message
    });
  }
};

// Actualizar estado del servicio
const updateServiceStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status, transportistNotes } = req.body;
    const userId = req.user.id;

    const service = await Service.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.rol === 'Transportista' && service.transportistId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar este servicio'
      });
    }

    if (req.user.rol === 'Cliente' && service.clientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar este servicio'
      });
    }

    const updateData = { status };
    if (transportistNotes) {
      updateData.transportistNotes = transportistNotes;
    }

    if (status === 'Completado') {
      updateData.completedDate = new Date();
    }

    await service.update(updateData);

    res.json({
      success: true,
      message: 'Estado del servicio actualizado',
      data: service
    });
  } catch (error) {
    console.error('Error al actualizar estado del servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del servicio',
      error: error.message
    });
  }
};

// Obtener servicios del usuario
const getUserServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = {};
    if (req.user.rol === 'Cliente') {
      whereClause.clientId = userId;
    } else if (req.user.rol === 'Transportista') {
      whereClause.transportistId = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    const services = await Service.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'username', 'email', 'phoneNumber']
        },
        {
          model: User,
          as: 'Transportist',
          attributes: ['id', 'username', 'email', 'phoneNumber', 'vehicleType', 'vehiclePlate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error al obtener servicios del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los servicios',
      error: error.message
    });
  }
};

// Calcular distancia entre dos puntos (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calcular precio estimado
const calculateEstimatedPrice = async (req, res) => {
  try {
    const {
      serviceType,
      distance,
      estimatedWeight,
      materialType
    } = req.body;

    let estimatedPrice = 0;

    // Lógica de cálculo de precio (ajustar según tarifas reales)
    switch (serviceType) {
      case 'Por Peso':
        estimatedPrice = estimatedWeight * 50000; // 50,000 por tonelada
        break;
      case 'Por Trayecto':
        estimatedPrice = distance * 15000; // 15,000 por km
        break;
      case 'Por Material':
        const materialPrices = {
          'escombros': 80000,
          'tierra': 60000,
          'concreto': 100000,
          'otros': 70000
        };
        estimatedPrice = materialPrices[materialType] || 70000;
        break;
    }

    // Ajuste por distancia
    if (distance > 50) {
      estimatedPrice += (distance - 50) * 5000; // Cargo adicional por distancia
    }

    res.json({
      success: true,
      estimatedPrice: Math.round(estimatedPrice)
    });
  } catch (error) {
    console.error('Error al calcular precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular el precio estimado',
      error: error.message
    });
  }
};

module.exports = {
  createService,
  getAvailableServices,
  acceptService,
  updateServiceStatus,
  getUserServices,
  calculateEstimatedPrice
}; 