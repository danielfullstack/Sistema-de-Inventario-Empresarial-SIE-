const express = require('express');
const ordenCompraController = require('../controllers/ordenCompraController');

const router = express.Router();

router.get('/', ordenCompraController.getOrdenes);
router.get('/proveedor/:id', ordenCompraController.getOrdenesByProveedor);
router.get('/estado/:estado', ordenCompraController.getOrdenesByEstado);
router.get('/:id', ordenCompraController.getOrdenById);
router.post('/', ordenCompraController.createOrden);
router.patch('/:id/estado', ordenCompraController.updateEstado);

module.exports = router;
