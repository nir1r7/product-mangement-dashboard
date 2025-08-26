const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getOverview, getTrends, getTopProducts, getCategoryPerformance, getInventoryRisk, getCohortAnalysis, getCustomerSegments } = require('../controllers/analyticsController');

// All analytics routes require admin access
router.use(protect, isAdmin);

// GET /api/analytics/overview
router.get('/overview', getOverview);

// GET /api/analytics/trends
router.get('/trends', getTrends);

// GET /api/analytics/products
router.get('/products', getTopProducts);

// GET /api/analytics/categories
router.get('/categories', getCategoryPerformance);

// GET /api/analytics/inventory-risk
router.get('/inventory-risk', getInventoryRisk);

// GET /api/analytics/cohorts
router.get('/cohorts', getCohortAnalysis);

// GET /api/analytics/customer-segments
router.get('/customer-segments', getCustomerSegments);

module.exports = router;
