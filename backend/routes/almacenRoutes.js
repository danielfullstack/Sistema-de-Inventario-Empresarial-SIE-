const express = require('express');
const almacenController = require('../controllers/almacenController');

const router = express.Router();

router.get('/', almacenController.getAlmacenes);
router.get('/:id', almacenController.getAlmacenById);
router.post('/', almacenController.createAlmacen);
router.put('/:id', almacenController.updateAlmacen);
router.patch('/:id/reactivar', almacenController.reactivateAlmacen);
router.delete('/:id', almacenController.deleteAlmacen);

module.exports = router;
