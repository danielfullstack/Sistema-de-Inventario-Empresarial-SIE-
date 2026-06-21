const express = require('express');
const proveedorController = require('../controllers/proveedorController');

const router = express.Router();

router.get('/', proveedorController.getProveedores);
router.get('/:id', proveedorController.getProveedorById);
router.post('/', proveedorController.createProveedor);
router.put('/:id', proveedorController.updateProveedor);
router.delete('/:id', proveedorController.deleteProveedor);

module.exports = router;
