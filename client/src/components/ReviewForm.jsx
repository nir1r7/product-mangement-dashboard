import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewForm = ({ productId, onSubmit, onCancel, existingReview = null }) => {
    const [formData, setFormData] = useState({
        rating: existingReview?.rating || 0,
        title: existingReview?.title || '',
        comment: existingReview?.comment || ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (formData.rating === 0) {
            newErrors.rating = 'Please select a rating';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Please enter a review title';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title must be 100 characters or less';
        }

        if (!formData.comment.trim()) {
            newErrors.comment = 'Please enter a review comment';
        } else if (formData.comment.length > 1000) {
            newErrors.comment = 'Comment must be 1000 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({ rating: 0, title: '', comment: '' });
            setErrors({});
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px',
            background: '#f9f9f9'
        }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Rating *
                    </label>
                    <StarRating
                        rating={formData.rating}
                        onRatingChange={(rating) => handleInputChange('rating', rating)}
                        readonly={false}
                        size="large"
                    />
                    {errors.rating && (
                        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                            {errors.rating}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Review Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.title ? '1px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        placeholder="Summarize your experience"
                        maxLength={100}
                    />
                    {errors.title && (
                        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                            {errors.title}
                        </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {formData.title.length}/100 characters
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Review Comment *
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => handleInputChange('comment', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.comment ? '1px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minHeight: '100px',
                            resize: 'vertical'
                        }}
                        placeholder="Share your detailed experience with this product..."
                        maxLength={1000}
                    />
                    {errors.comment && (
                        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                            {errors.comment}
                        </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {formData.comment.length}/1000 characters
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '10px 20px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.6 : 1
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
                    </button>
                    
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '10px 20px',
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
