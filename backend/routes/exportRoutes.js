const express = require('express');
const exportController = require('../controllers/exportController');

const router = express.Router();

router.get('/:module/:format', exportController.exportModule);

module.exports = router;
