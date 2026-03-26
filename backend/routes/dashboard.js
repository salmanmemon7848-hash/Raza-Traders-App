const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/daily-sales', dashboardController.getDailySales);
router.get('/monthly-profit', dashboardController.getMonthlyProfit);

module.exports = router;
