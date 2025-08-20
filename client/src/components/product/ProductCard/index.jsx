import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../../ui/StarRating';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

    return (
        <Link to={`/products/${product._id}`} className="product-card">
            <div className="product-card__image-container">
                {mainImage ? (
                    <img
                        src={`http://localhost:5000${mainImage}`}
                        alt={product.name}
                        className="product-card__image"
                    />
                ) : (
                    <div className="product-card__no-image">
                        No Image
                    </div>
                )}
            </div>
            
            <div className="product-card__content">
                <h3 className="product-card__name">{product.name}</h3>
                <div className="product-card__price">${Number(product.price).toFixed(2)}</div>
                
                {product.reviewStats && product.reviewStats.totalReviews > 0 && (
                    <div className="product-card__rating">
                        <StarRating rating={product.reviewStats.averageRating} readonly size="small" />
                        <span className="product-card__review-count">
                            ({product.reviewStats.totalReviews})
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
