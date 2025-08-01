const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Rutas públicas
router.post('/calculate-price', serviceController.calculateEstimatedPrice);

// Rutas protegidas
router.use(auth);

// Rutas para clientes
router.post('/create', serviceController.createService);
router.get('/my-services', serviceController.getUserServices);

// Rutas para transportistas
router.get('/available', serviceController.getAvailableServices);
router.put('/:serviceId/accept', serviceController.acceptService);
router.put('/:serviceId/status', serviceController.updateServiceStatus);

module.exports = router; 