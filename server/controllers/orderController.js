const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// POST /api/orders
const placeOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const cartItems = req.body.items;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalPrice = 0;

        const productIds = cartItems.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } }).session(session);

        for (let item of cartItems) {
            const product = products.find(p => p._id.toString() === item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
            }
            totalPrice += product.price * item.quantity;
        }

        for (let item of cartItems) {
            const product = products.find(p => p._id.toString() === item.product);
            product.stock -= item.quantity;
            await product.save({ session });
        }

        const order = await Order.create([{
            user: userId,
            items: cartItems,
            totalPrice
        }], { session });

        await User.findByIdAndUpdate(userId, { $set: { cart: [] } }, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(order[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

// GET /api/orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('items.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

module.exports = { placeOrder, getUserOrders };
