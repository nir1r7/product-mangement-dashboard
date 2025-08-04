const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart, bulkUpdateCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.delete('/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);
router.post('/bulk', protect, bulkUpdateCart);


module.exports = router;