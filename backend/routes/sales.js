const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales');

router.post('/', salesController.recordSale);
router.get('/', salesController.getSales);
router.get('/:startDate/:endDate', salesController.getSalesByDateRange);

module.exports = router;
