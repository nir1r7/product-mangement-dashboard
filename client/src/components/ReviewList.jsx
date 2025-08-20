import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

const ReviewList = ({ productId, currentUserId, onReviewUpdate, onReviewDelete }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingReview, setEditingReview] = useState(null);

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

    const handleEditReview = async (reviewId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Failed to update review');

            const updatedReview = await response.json();
            setReviews(prev => prev.map(review => 
                review._id === reviewId ? updatedReview : review
            ));
            setEditingReview(null);
            if (onReviewUpdate) onReviewUpdate();
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Failed to update review');
        }
    };

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
        return <div>Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return <div>No reviews yet. Be the first to review this product!</div>;
    }

    return (
        <div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: 0 }}>Customer Reviews ({reviews.length})</h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                </select>
            </div>

            <div>
                {reviews.map(review => (
                    <div key={review._id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '15px',
                        background: 'white'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                    {review.title}
                                </div>
                                <StarRating rating={review.rating} readonly size="small" />
                                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                                    by {review.user?.name || 'Anonymous'} on {formatDate(review.createdAt)}
                                </div>
                            </div>
                            
                            {currentUserId && review.user?._id === currentUserId && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                        onClick={() => setEditingReview(review)}
                                        style={{
                                            padding: '4px 8px',
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReview(review._id)}
                                        style={{
                                            padding: '4px 8px',
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ marginTop: '10px', lineHeight: '1.5' }}>
                            {review.comment}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '10px',
                    marginTop: '20px'
                }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 12px',
                            background: currentPage === 1 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>
                    
                    <span style={{ padding: '8px 12px' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 12px',
                            background: currentPage === totalPages ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
