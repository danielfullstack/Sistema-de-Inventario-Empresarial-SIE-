const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

router.get('/', usuarioController.getUsuarios);
router.get('/:id', usuarioController.getUsuarioById);
router.post('/', usuarioController.createUsuario);
router.put('/:id', usuarioController.updateUsuario);
router.patch('/:id/estado', usuarioController.updateEstado);
router.patch('/:id/reactivar', usuarioController.reactivateUsuario);
router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;
