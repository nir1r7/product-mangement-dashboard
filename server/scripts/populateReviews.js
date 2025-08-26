const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const sampleReviews = [
    {
        rating: 5,
        title: "Excellent product!",
        comment: "This product exceeded my expectations. Great quality and fast shipping. Highly recommend!"
    },
    {
        rating: 4,
        title: "Very good quality",
        comment: "Good product overall. The quality is solid and it works as expected. Would buy again."
    },
    {
        rating: 5,
        title: "Love it!",
        comment: "Amazing product! Perfect for my needs and the price is very reasonable."
    },
    {
        rating: 3,
        title: "Decent product",
        comment: "It's okay. Does what it's supposed to do but nothing special. Average quality."
    },
    {
        rating: 4,
        title: "Good value for money",
        comment: "For the price, this is a great deal. Good quality and arrived quickly."
    },
    {
        rating: 5,
        title: "Outstanding!",
        comment: "Fantastic product! Exactly what I was looking for. The quality is top-notch."
    },
    {
        rating: 2,
        title: "Not what I expected",
        comment: "The product didn't meet my expectations. Quality could be better for the price."
    },
    {
        rating: 4,
        title: "Satisfied with purchase",
        comment: "Good product, works well. Delivery was fast and packaging was secure."
    },
    {
        rating: 5,
        title: "Perfect!",
        comment: "Exactly what I needed. Great quality, great price, great service!"
    },
    {
        rating: 3,
        title: "Average product",
        comment: "It's an okay product. Does the job but there are probably better options out there."
    }
];

const populateReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Get all products and users
        const products = await Product.find();
        const users = await User.find();

        if (products.length === 0) {
            console.log('No products found. Please add products first.');
            return;
        }

        if (users.length === 0) {
            console.log('No users found. Please add users first.');
            return;
        }

        // Clear existing reviews
        await Review.deleteMany({});
        console.log('Cleared existing reviews');

        // Add reviews for each product
        for (const product of products) {
            const numReviews = Math.floor(Math.random() * 8) + 3; // 3-10 reviews per product
            
            for (let i = 0; i < numReviews; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
                
                // Check if this user already reviewed this product
                const existingReview = await Review.findOne({
                    product: product._id,
                    user: randomUser._id
                });

                if (!existingReview) {
                    const review = new Review({
                        product: product._id,
                        user: randomUser._id,
                        rating: randomReview.rating,
                        title: randomReview.title,
                        comment: randomReview.comment,
                        verified: Math.random() > 0.3 // 70% chance of being verified
                    });

                    await review.save();
                }
            }

            // Update product review stats
            await updateProductReviewStats(product._id);
            console.log(`Added reviews for product: ${product.name}`);
        }

        console.log('Successfully populated reviews!');
        process.exit(0);
    } catch (error) {
        console.error('Error populating reviews:', error);
        process.exit(1);
    }
};

// Helper function to update product review statistics
const updateProductReviewStats = async (productId) => {
    try {
        const reviews = await Review.find({ product: productId });
        
        if (reviews.length === 0) {
            await Product.findByIdAndUpdate(productId, {
                'reviewStats.averageRating': 0,
                'reviewStats.totalReviews': 0,
                'reviewStats.ratingDistribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            });
            return;
        }

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        await Product.findByIdAndUpdate(productId, {
            'reviewStats.averageRating': Math.round(averageRating * 10) / 10,
            'reviewStats.totalReviews': totalReviews,
            'reviewStats.ratingDistribution': ratingDistribution
        });
    } catch (err) {
        console.error('Error updating product review stats:', err);
    }
};

populateReviews();
