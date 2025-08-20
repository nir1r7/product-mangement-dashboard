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
        const { items: cartItems, shippingAddress, paymentMethod = 'COD' } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const requiredFields = ['fullName','street','city','province','postalCode','country'];
        const missing = requiredFields.filter(f => !shippingAddress || !shippingAddress[f]);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing shipping fields: ${missing.join(', ')}` });
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
            totalPrice,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'Paid',
            status: 'Paid'
        }], { session });

        await User.findByIdAndUpdate(
            userId,
            {
                $set: { cart: [] },
                $push: { orders: order[0]._id }
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        const populatedOrder = await Order.findById(order[0]._id)
        .populate('items.product', 'name price')
        .populate('user', 'name email');

        res.status(201).json(populatedOrder);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('items.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
    }
};

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
        return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};

const getUserOrdersById = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ user: userId }).populate('items.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
    }
};

module.exports = { placeOrder, getUserOrders, getAllOrders, updateStatus, getUserOrdersById };
