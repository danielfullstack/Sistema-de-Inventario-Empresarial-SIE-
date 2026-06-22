const express = require('express');
const kardexController = require('../controllers/kardexController');

const router = express.Router();

router.get('/', kardexController.getKardex);
router.get('/producto/:id', kardexController.getKardex);

module.exports = router;
