const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getWeekID,
  getWeeks,
  getAdminData,
  addCall,
  updateCall,
  deleteCall,
  updatePayment,
  addWeek,
  deleteWeek,
  updateWeek,
  addPhone,
  updatePhone,
  activatePhone,
  deactivatePhone,
  deletePhone,
  backupDataHttp,
  backupDataWeek,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

const adminAuth = (req, res, next) => {
  if (req.user.rol !== 'Administrador' && req.user.rol !== 'Propietario') {
    return res.status(403).json({ message: 'Acceso denegado. No tienes permisos suficientes.' });
  }
  next();
};

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Cambiado para usar solo el nombre original y la extensión
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limita el tamaño del archivo a 5 MB
  },
  fileFilter: fileFilter,
});

// Obtener ID de Fecha
router.route('/weekId').get(auth, adminAuth, getWeekID);

// Obtener fechas
router.route('/weeks').get(auth, adminAuth, getWeeks);

// Tablas BD y usuario logeado
router.route('/').get(auth, adminAuth, getAdminData);

// Añadir Llamada
router.route('/calls').post(auth, adminAuth, addCall);

// Editar llamada
router.route('/calls/:id').put(auth, adminAuth, updateCall);

// Eliminar Llamada
router.route('/calls/:id').delete(auth, adminAuth, deleteCall);

// Editar pago
router.route('/payments/:id').put(auth, adminAuth, upload.single('captura'), updatePayment);

// Añadir Fecha
router.route('/weeks').post(auth, adminAuth, addWeek);

// Eliminar fecha
router.route('/weeks/:id').delete(auth, adminAuth, deleteWeek);

// Editar Fecha
router.route('/weeks/:id').put(auth, adminAuth, updateWeek);

// Añadir Teléfono
router.route('/phones').post(auth, adminAuth, addPhone);

// Editar Teléfono
router.route('/phones/:id').put(auth, adminAuth, updatePhone);

// Desactivar Teléfono
router.route('/phones/deactivate/:id').patch(auth, adminAuth, deactivatePhone);

// Activar Teléfono
router.route('/phones/activate/:id').patch(auth, adminAuth, activatePhone);

// Eliminar Teléfono
router.route('/phones/:id').delete(auth, adminAuth, deletePhone);

// Exportar todas las semanas a Google Sheets
router.route('/backup').post(auth, adminAuth, backupDataHttp);

// Exportar una semana a Google Sheets
router.route('/backup/:id').post(auth, adminAuth, backupDataWeek);

module.exports = router;
