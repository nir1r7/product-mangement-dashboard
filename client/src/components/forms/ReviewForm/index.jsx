import React, { useState } from 'react';
import StarRating from '../../ui/StarRating';
import './ReviewForm.css';

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
        <div className="review-form">
            <h3 className="review-form__title">
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            
            <form onSubmit={handleSubmit} className="review-form__form">
                <div className="form-group">
                    <label className="form-label">Rating *</label>
                    <StarRating
                        rating={formData.rating}
                        onRatingChange={(rating) => handleInputChange('rating', rating)}
                        readonly={false}
                        size="large"
                    />
                    {errors.rating && (
                        <div className="form-error">{errors.rating}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="title" className="form-label">Review Title *</label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                        placeholder="Summarize your experience"
                        maxLength={100}
                    />
                    {errors.title && (
                        <div className="form-error">{errors.title}</div>
                    )}
                    <div className="form-input__counter">
                        {formData.title.length}/100 characters
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="comment" className="form-label">Review Comment *</label>
                    <textarea
                        id="comment"
                        value={formData.comment}
                        onChange={(e) => handleInputChange('comment', e.target.value)}
                        className={`form-input form-textarea ${errors.comment ? 'form-input--error' : ''}`}
                        placeholder="Share your detailed experience with this product..."
                        maxLength={1000}
                    />
                    {errors.comment && (
                        <div className="form-error">{errors.comment}</div>
                    )}
                    <div className="form-input__counter">
                        {formData.comment.length}/1000 characters
                    </div>
                </div>

                <div className="review-form__actions">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? <span className="loading"></span> : (existingReview ? 'Update Review' : 'Submit Review')}
                    </button>
                    
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-secondary"
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
