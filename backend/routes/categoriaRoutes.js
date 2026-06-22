const express = require('express');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

router.get('/', categoriaController.getCategorias);
router.get('/:id', categoriaController.getCategoriaById);
router.post('/', categoriaController.createCategoria);
router.put('/:id', categoriaController.updateCategoria);
router.patch('/:id/reactivar', categoriaController.reactivateCategoria);
router.delete('/:id', categoriaController.deleteCategoria);

module.exports = router;
