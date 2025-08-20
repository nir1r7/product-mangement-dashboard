import React from 'react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
    const sizeClasses = {
        small: 'text-sm',
        medium: 'text-lg',
        large: 'text-2xl'
    };

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
        <div className={`flex items-center ${sizeClasses[size]}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    onKeyDown={(e) => handleKeyDown(e, star)}
                    disabled={readonly}
                    className={`${
                        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    } transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded`}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    tabIndex={readonly ? -1 : 0}
                >
                    <span
                        className={`${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                        ★
                    </span>
                </button>
            ))}
            {!readonly && (
                <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 ? `${rating}/5` : 'Click to rate'}
                </span>
            )}
        </div>
    );
};

export default StarRating;
