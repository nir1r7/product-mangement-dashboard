const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getAllUsers, updateUserNotes, getUserOrders } = require('../controllers/userController');

router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/notes', protect, isAdmin, updateUserNotes);
router.get('/:id/orders', protect, isAdmin, getUserOrders);

module.exports = router;

