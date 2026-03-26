const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports');

router.get('/daily-sales', reportController.getDailySalesReport);
router.get('/monthly-sales', reportController.getMonthlySalesReport);
router.get('/profit', reportController.getProfitReport);
router.get('/stock', reportController.getStockReport);
router.get('/product-performance', reportController.getProductPerformanceReport);

module.exports = router;
