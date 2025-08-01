const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userManagementController');
const auth = require('../middleware/auth');

const ownerAuth = (req, res, next) => {
  if (req.user.rol !== 'Propietario') {
    return res.status(403).json({ message: 'Acceso denegado. No tienes permisos suficientes.' });
  }
  next();
};

// Rutas de gestión de usuarios
router.route('/').get(auth, ownerAuth, getUsers);
router.route('/update/:id').put(auth, ownerAuth, updateUser);
router.route('/delete/:id').delete(auth, ownerAuth, deleteUser);

module.exports = router;
