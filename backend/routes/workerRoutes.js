const express = require('express');
const router = express.Router();
const { getWeeks, getWorkerData, getBankEmail, updateBankEmail } = require('../controllers/workerController');
const auth = require('../middleware/auth');

router.route('/weeks').get(auth, getWeeks);
router.route('/').get(auth, getWorkerData);
router.route('/bankEmail').get(auth, getBankEmail);
router.route('/bankEmail').put(auth, updateBankEmail);

module.exports = router;
