// server/controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');

// POST /api/orders
const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const {
      items: cartItems,
      shippingAddress,
      paymentMethod = 'COD',
      paymentDetails = {},
      subtotal,
      shippingCost = 0,
      taxAmount = 0,
      totalPrice
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const requiredFields = ['fullName','street','city','province','postalCode','country'];
    const missing = requiredFields.filter(f => !shippingAddress || !shippingAddress[f]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing shipping fields: ${missing.join(', ')}` });
    }

    let calculatedTotal = 0;
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
      calculatedTotal += product.price * item.quantity;
    }

    for (let item of cartItems) {
      const product = products.find(p => p._id.toString() === item.product);
      product.stock -= item.quantity;
      await product.save({ session });
    }

    const order = await Order.create([{
      user: userId,
      items: cartItems,
      subtotal: subtotal || calculatedTotal,
      shippingCost: shippingCost || 0,
      taxAmount: taxAmount || 0,
      totalPrice: totalPrice || calculatedTotal,
      shippingAddress,
      paymentMethod,
      paymentDetails,
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

    sendOrderConfirmationEmail(populatedOrder.user.email, populatedOrder, populatedOrder.user).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });

    res.status(201).json(populatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// GET /api/orders (for current user)
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/**
 * GET /api/orders/admin/orders
 * Query params:
 *  - page (default 1), limit (default 10)
 *  - sort: 'newest'|'oldest'|'least-complete'|'most-complete'|'most-expensive'|'least-expensive'
 *  - ignoreCancellations: 'true'|'false'  (push cancelled orders to bottom when true)
 *  - search: free text (order id, user name/email, status, shipping fields)
 *  - dateFrom (YYYY-MM-DD), dateTo (YYYY-MM-DD)
 */
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      ignoreCancellations = 'false',
      search,
      dateFrom,
      dateTo
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 200);
    const skip = (pageNum - 1) * lim;

    // ---------- 1) Build base match using date range ----------
    const match = {};
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1); // include entire end date
        match.createdAt.$lt = endDate;
      }
    }

    // ---------- 2) Expand search into match (user lookup + shipping/status/ID) ----------
    if (search) {
      const or = [];

      // Try to match user name/email -> convert to user ids
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      if (users && users.length) {
        const userIds = users.map(u => u._id);
        or.push({ user: { $in: userIds } });
      }

      // If search looks like an ObjectId, check order id exact match
      if (mongoose.Types.ObjectId.isValid(search)) {
        or.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      // Shipping fields
      or.push({ 'shippingAddress.fullName': { $regex: search, $options: 'i' } });
      or.push({ 'shippingAddress.street': { $regex: search, $options: 'i' } });
      or.push({ 'shippingAddress.city': { $regex: search, $options: 'i' } });
      or.push({ 'shippingAddress.province': { $regex: search, $options: 'i' } });
      or.push({ 'shippingAddress.postalCode': { $regex: search, $options: 'i' } });

      // Status match
      or.push({ status: { $regex: search, $options: 'i' } });

      match.$or = or;
    }

    // ---------- total count for pagination (same match) ----------
    const total = await Order.countDocuments(match);

    // ---------- 3) Build sorting pipeline (apply cancelled weighting optionally) ----------
    // Compute helper fields used for sorting (statusRank and isCancelled)
    const addFieldsStage = {
      $addFields: {
        isCancelled: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] },
        statusRank: {
          $switch: {
            branches: [
              { case: { $eq: ['$status', 'Cancelled'] }, then: 0 },
              { case: { $eq: ['$status', 'Pending'] }, then: 1 },
              { case: { $eq: ['$status', 'Paid'] }, then: 2 },
              { case: { $eq: ['$status', 'Shipped'] }, then: 3 },
              { case: { $eq: ['$status', 'Delivered'] }, then: 4 }
            ],
            default: 5
          }
        }
      }
    };

    // Build the sort object: if ignoreCancellations is true, primary key = isCancelled (non-cancelled first)
    const sortObj = {};
    const ignoreCancelledFlag = String(ignoreCancellations) === 'true';
    if (ignoreCancelledFlag) {
      sortObj.isCancelled = 1; // non-cancelled (0) first, cancelled (1) last
    }

    switch (sort) {
      case 'oldest':
        sortObj.createdAt = 1;
        break;
      case 'least-complete':
        sortObj.statusRank = 1;
        sortObj.createdAt = -1;
        break;
      case 'most-complete':
        sortObj.statusRank = -1;
        sortObj.createdAt = -1;
        break;
      case 'most-expensive':
        sortObj.totalPrice = -1;
        sortObj.createdAt = -1;
        break;
      case 'least-expensive':
        sortObj.totalPrice = 1;
        sortObj.createdAt = -1;
        break;
      case 'newest':
      default:
        sortObj.createdAt = -1;
        break;
    }

    // ---------- 4) Aggregation to produce ordered list of _ids (after match & sorting) ----------
    const pipeline = [
      { $match: match },
      addFieldsStage,
      { $sort: sortObj },
      { $skip: skip },
      { $limit: lim },
      { $project: { _id: 1 } } // only need ids here
    ];

    const idResults = await Order.aggregate(pipeline);
    const ids = idResults.map(r => r._id);

    // ---------- 5) Populate the ids (preserve order) ----------
    let orders = [];
    if (ids.length > 0) {
      const populated = await Order.find({ _id: { $in: ids } })
        .populate('user', 'name email')
        .populate('items.product', 'name price');

      // preserve aggregation order
      const mapById = new Map(populated.map(o => [String(o._id), o]));
      orders = ids.map(id => mapById.get(String(id))).filter(Boolean);
    }

    res.json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / lim)
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
};

// PUT /api/orders/admin/orders/:id/status
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('items.product', 'name price')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    sendOrderStatusUpdateEmail(order.user.email, order, order.user, status).catch(err => {
      console.error('Failed to send order status update email:', err);
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// GET /api/orders/admin/user/:userId
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
