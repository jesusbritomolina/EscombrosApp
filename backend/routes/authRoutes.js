const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas de autenticación
router.post('/register', authController.register);
router.post('/resend-verify-email', authController.resendVerifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.put('/reset-password', authController.changePassword);

module.exports = router;
