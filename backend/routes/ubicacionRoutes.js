const express = require('express');
const ubicacionController = require('../controllers/ubicacionController');

const router = express.Router();

router.get('/', ubicacionController.getUbicaciones);
router.get('/almacen/:id', ubicacionController.getUbicacionesByAlmacen);
router.get('/:id', ubicacionController.getUbicacionById);
router.post('/', ubicacionController.createUbicacion);
router.put('/:id', ubicacionController.updateUbicacion);
router.patch('/:id/reactivar', ubicacionController.reactivateUbicacion);
router.delete('/:id', ubicacionController.deleteUbicacion);

module.exports = router;
