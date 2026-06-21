const express = require('express');
const movimientoController = require('../controllers/movimientoController');

const router = express.Router();

router.get('/', movimientoController.getMovimientos);
router.get('/producto/:id', movimientoController.getMovimientosByProducto);
router.get('/almacen/:id', movimientoController.getMovimientosByAlmacen);
router.get('/:id', movimientoController.getMovimientoById);
router.post('/', movimientoController.createMovimiento);

module.exports = router;
