import React, { useState, useEffect } from 'react';
import StarRating from '../../ui/StarRating';
import './ReviewList.css';

const ReviewList = ({ productId, currentUserId, onReviewUpdate, onReviewDelete }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5000/api/reviews/product/${productId}?page=${currentPage}&sort=${sortBy}`
            );
            if (!response.ok) throw new Error('Failed to fetch reviews');
            
            const data = await response.json();
            setReviews(data.reviews);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId, currentPage, sortBy]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete review');

            setReviews(prev => prev.filter(review => review._id !== reviewId));
            if (onReviewDelete) onReviewDelete();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="review-list__loading">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return <div className="review-list__empty">No reviews yet. Be the first to review this product!</div>;
    }

    return (
        <div className="review-list">
            <div className="review-list__header">
                <h3 className="review-list__title">Customer Reviews ({reviews.length})</h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="review-list__sort"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                </select>
            </div>

            <div className="review-list__items">
                {reviews.map(review => (
                    <div key={review._id} className="review-item">
                        <div className="review-item__header">
                            <div className="review-item__info">
                                <div className="review-item__title">{review.title}</div>
                                <StarRating rating={review.rating} readonly size="small" />
                                <div className="review-item__meta">
                                    by {review.user?.name || 'Anonymous'} on {formatDate(review.createdAt)}
                                </div>
                            </div>
                            
                            {currentUserId && review.user?._id === currentUserId && (
                                <div className="review-item__actions">
                                    <button
                                        onClick={() => handleDeleteReview(review._id)}
                                        className="btn btn-danger review-item__delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="review-item__content">
                            {review.comment}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="review-list__pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>
                    
                    <span className="review-list__page-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
