const express = require('express');
const { placeOrder, getUserOrders, getAllOrders, updateStatus, getUserOrdersById } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getUserOrders);
router.get('/admin/orders', protect, isAdmin, getAllOrders);
router.get('/admin/user/:userId', protect, isAdmin, getUserOrdersById);
router.put('/admin/orders/:id/status', protect, isAdmin, updateStatus);

module.exports = router;
