const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/', stockController.getStock);
router.get('/stock-bajo', stockController.getLowStock);
router.get('/producto/:id', stockController.getStockByProducto);
router.get('/almacen/:id', stockController.getStockByAlmacen);
router.get('/:id', stockController.getStockById);

module.exports = router;
