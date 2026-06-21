const express = require('express');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

router.get('/', reporteController.getReportes);

module.exports = router;
