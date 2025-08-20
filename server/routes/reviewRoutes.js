const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProductReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
