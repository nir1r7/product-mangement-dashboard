const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /api/reviews/product/:productId
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        let sortOption = { createdAt: -1 };

        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'highest') {
            sortOption = { rating: -1 };
        } else if (sort === 'lowest') {
            sortOption = { rating: 1 };
        }

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Review.countDocuments({ product: productId });

        res.json({
            reviews,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};

// POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const userId = req.user.id;

        const existingReview = await Review.findOne({ 
            product: productId, 
            user: userId 
        });

        if (existingReview) {
            return res.status(400).json({ 
                message: 'You have already reviewed this product' 
            });
        }

        const review = new Review({
            product: productId,
            user: userId,
            rating,
            title,
            comment
        });

        const savedReview = await review.save();
        await updateProductReviewStats(productId);

        const populatedReview = await Review.findById(savedReview._id)
            .populate('user', 'name');

        res.status(201).json(populatedReview);
    } catch (err) {
        console.error('Error creating review:', err);
        if (err.code === 11000) {
            res.status(400).json({ message: 'You have already reviewed this product' });
        } else {
            res.status(400).json({ message: 'Error creating review', error: err.message });
        }
    }
};

// PUT /api/reviews/:reviewId
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating;
        review.title = title;
        review.comment = comment;

        const updatedReview = await review.save();
        await updateProductReviewStats(review.product);

        const populatedReview = await Review.findById(updatedReview._id)
            .populate('user', 'name');

        res.json(populatedReview);
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(400).json({ message: 'Error updating review', error: err.message });
    }
};

// DELETE /api/reviews/:reviewId
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const productId = review.product;
        await review.deleteOne();
        await updateProductReviewStats(productId);

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(400).json({ message: 'Error deleting review', error: err.message });
    }
};

// helper function to update product review statistics
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

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview
};
