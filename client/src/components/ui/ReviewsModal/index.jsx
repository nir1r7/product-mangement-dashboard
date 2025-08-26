import React, { useState, useEffect } from 'react';
import './ReviewsModal.css';

const ReviewsModal = ({ isOpen, onClose, productId, productName }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        if (isOpen && productId) {
            fetchReviews();
        }
    }, [isOpen, productId, sortBy, currentPage]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5000/api/reviews/product/${productId}?page=${currentPage}&sort=${sortBy}&limit=10`
            );
            if (!response.ok) throw new Error('Failed to fetch reviews');
            
            const data = await response.json();
            setReviews(data.reviews);
            setTotalPages(data.pages);
            setTotalReviews(data.total);
        } catch (error) {
            // Error fetching reviews - silently handle
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <span 
                        key={star} 
                        className={`star ${star <= rating ? 'filled' : ''}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="reviews-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Reviews for {productName}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    <div className="reviews-controls">
                        <div className="reviews-summary">
                            <span className="total-reviews">{totalReviews} reviews</span>
                        </div>
                        <div className="sort-controls">
                            <label htmlFor="sort-select">Sort by:</label>
                            <select 
                                id="sort-select"
                                value={sortBy} 
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="no-reviews">
                            <p>No reviews yet for this product.</p>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review._id} className="review-item">
                                    <div className="review-header">
                                        <div className="review-info">
                                            <h4 className="review-title">{review.title}</h4>
                                            {renderStars(review.rating)}
                                            <div className="review-meta">
                                                by {review.user?.name || 'Anonymous'} on {formatDate(review.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-content">
                                        <p>{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsModal;
