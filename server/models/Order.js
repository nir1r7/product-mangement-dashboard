const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
    items: [
        {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        }
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        street:    { type: String, required: true },
        city:      { type: String, required: true },
        province:     { type: String, required: true },
        postalCode:       { type: String, required: true },
        country:   { type: String, required: true }
    },
    paymentMethod: { type: String, enum: ['COD', 'Card', 'PayPal'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Paid' }, // assuming instant “Pay”
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Cancelled', 'Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
