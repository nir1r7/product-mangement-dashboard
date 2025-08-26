const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    images: { type: [String], default: [] },
    cost: {
        type: Number,
        default: 0,
        min: 0
    },
    reviewStats: {
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        ratingDistribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
