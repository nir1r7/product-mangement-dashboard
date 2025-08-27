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
        country:   { type: String, default: 'Canada' }
    },
    paymentMethod: { type: String, enum: ['COD', 'Card', 'PayPal'], default: 'COD' },
    paymentDetails: {
        cardHolderName: { type: String },
        cardLastFour: { type: String },
        cardType: { type: String }
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Paid' }, // assuming instant “Pay”
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Cancelled', 'Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

orderSchema.index({ createdAt: -1 });                 // newest/oldest
orderSchema.index({ totalPrice: -1, createdAt: -1 }); // expensive/cheap with tiebreaker
orderSchema.index({ status: 1, createdAt: -1 });      // status-based filters & sorts
orderSchema.index({ user: 1, createdAt: -1 });        // user history & search joins
orderSchema.index({
  'shippingAddress.fullName': 1,
  'shippingAddress.city': 1,
  'shippingAddress.province': 1,
  'shippingAddress.postalCode': 1
});

module.exports = mongoose.model('Order', orderSchema);
