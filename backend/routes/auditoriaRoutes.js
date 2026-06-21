const express = require('express');
const auditoriaController = require('../controllers/auditoriaController');

const router = express.Router();

router.get('/', auditoriaController.getAuditorias);
router.get('/usuario/:id', auditoriaController.getAuditoriasByUsuario);
router.get('/:id', auditoriaController.getAuditoriaById);

module.exports = router;
