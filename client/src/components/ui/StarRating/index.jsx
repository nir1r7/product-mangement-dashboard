import React from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
    const handleClick = (starValue) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starValue);
        }
    };

    const handleKeyDown = (e, starValue) => {
        if (!readonly && onRatingChange) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRatingChange(starValue);
            }
        }
    };

    return (
        <div className={`star-rating star-rating--${size}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    onKeyDown={(e) => handleKeyDown(e, star)}
                    disabled={readonly}
                    className={`star-rating__star ${readonly ? 'star-rating__star--readonly' : ''}`}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    tabIndex={readonly ? -1 : 0}
                >
                    <span className={`star-rating__icon ${star <= rating ? 'star-rating__icon--filled' : ''}`}>
                        ★
                    </span>
                </button>
            ))}
            {!readonly && (
                <span className="star-rating__label">
                    {rating > 0 ? `${rating}/5` : 'Click to rate'}
                </span>
            )}
        </div>
    );
};

export default StarRating;
