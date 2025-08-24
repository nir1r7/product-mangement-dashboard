const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getAllUsers, updateUserNotes, getUserOrders, updateUserRole, deleteUser } = require('../controllers/userController');

router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/notes', protect, isAdmin, updateUserNotes);
router.put('/:id/role', protect, isAdmin, updateUserRole);
router.get('/:id/orders', protect, isAdmin, getUserOrders);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;

