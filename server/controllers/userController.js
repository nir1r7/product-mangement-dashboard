const User = require('../models/User');
const Order = require('../models/Order');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            role
        } = req.query;

        let query = {};

        // Filter by role if provided
        if (role && role !== 'all') {
            query.role = role;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            users,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserNotes = async (req, res) => {
    try {
        const { notes } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.notes = notes;
        await user.save();
        res.json({ message: 'Notes updated', notes: user.notes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id })
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: 'User role updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    message: 'Cannot delete the last admin user. At least one admin must remain.'
                });
            }
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            message: 'User deleted successfully',
            deletedUserId: userId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserNotes,
    getUserOrders,
    updateUserRole,
    deleteUser
};