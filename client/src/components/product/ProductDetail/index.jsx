import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import StarRating from '../../ui/StarRating';
import ReviewForm from '../../forms/ReviewForm';
import ReviewList from '../../review/ReviewList';
import './ProductDetail.css';

const ProductDetail = () => {
    const { addToCart } = useCart();
    const { token, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const { id } = useParams();

    const nextImage = useCallback(() => {
        if (product?.images?.length) {
            setCurrentImageIndex((prev) => 
                prev === product.images.length - 1 ? 0 : prev + 1
            );
        }
    }, [product]);

    const prevImage = useCallback(() => {
        if (product?.images?.length) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? product.images.length - 1 : prev - 1
            );
        }
    }, [product]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nextImage, prevImage]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/products/${id}`);
                if (!response.ok) throw new Error('Product not found');
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const checkUserReview = async () => {
            if (!token || !user) return;
            
            try {
                const response = await fetch(`http://localhost:5000/api/reviews/product/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    const userReview = data.reviews.find(review => review.user?._id === user.id);
                    setUserReview(userReview || null);
                }
            } catch (error) {
                console.error('Error checking user review:', error);
            }
        };
        
        checkUserReview();
    }, [id, token, user]);

    const handleSubmitReview = async (reviewData) => {
        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: id,
                    ...reviewData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit review');
            }

            const newReview = await response.json();
            setUserReview(newReview);
            setShowReviewForm(false);
            
            const productResponse = await fetch(`http://localhost:5000/api/products/${id}`);
            if (productResponse.ok) {
                const updatedProduct = await productResponse.json();
                setProduct(updatedProduct);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.message);
            throw error;
        }
    };

    const handleReviewUpdate = () => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(response => response.json())
            .then(data => setProduct(data))
            .catch(error => console.error('Error refreshing product:', error));
    };

    if (loading) return (
        <div className="product-detail-container">
            <div className="loading-container">
                <div className="loading"></div>
                <p>Loading product...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="product-detail-container">
            <div className="error-container">
                <h3>Error</h3>
                <p>{error}</p>
            </div>
        </div>
    );
    
    if (!product) return (
        <div className="product-detail-container">
            <div className="error-container">
                <h3>Product not found</h3>
            </div>
        </div>
    );

    return (
        <div className="product-detail-container">
            <div className="product-detail__main">
                <div className="product-detail__gallery">
                    {product.images && product.images.length > 0 ? (
                        <>
                            <div className="product-detail__main-image">
                                <button className="product-detail__nav-button" onClick={prevImage}>
                                    ‹
                                </button>
                                <img 
                                    src={`http://localhost:5000${product.images[currentImageIndex]}`}
                                    alt={product.name}
                                    className="product-detail__image"
                                />
                                <button className="product-detail__nav-button" onClick={nextImage}>
                                    ›
                                </button>
                            </div>
                            <div className="product-detail__thumbnails">
                                {product.images.map((url, index) => (
                                    <img
                                        key={url}
                                        src={`http://localhost:5000${url}`}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        className={`product-detail__thumbnail ${index === currentImageIndex ? 'product-detail__thumbnail--active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="product-detail__no-image">No images available</div>
                    )}
                </div>
                
                <div className="product-detail__info">
                    <h1 className="product-detail__title">{product.name}</h1>
                    <div className="product-detail__price">${product.price.toFixed(2)}</div>
                    
                    {product.reviewStats && product.reviewStats.totalReviews > 0 && (
                        <div className="product-detail__rating">
                            <StarRating rating={product.reviewStats.averageRating} readonly size="medium" />
                            <span className="product-detail__review-count">
                                ({product.reviewStats.totalReviews} reviews)
                            </span>
                        </div>
                    )}
                    
                    <p className="product-detail__description">{product.description}</p>
                    <div className="product-detail__meta">
                        <p><strong>Stock:</strong> {product.stock}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                    </div>
                    
                    <div className="product-detail__actions">
                        <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="btn btn-primary product-detail__add-to-cart"
                        >
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <Link to="/products" className="btn btn-secondary">
                            ← Back to Products
                        </Link>
                    </div>
                </div>
            </div>

            <div className="product-detail__reviews">
                <h2 className="product-detail__reviews-title">Customer Reviews</h2>
                
                {token && !userReview && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="btn btn-success product-detail__write-review"
                    >
                        Write a Review
                    </button>
                )}

                {showReviewForm && (
                    <ReviewForm
                        productId={id}
                        onSubmit={handleSubmitReview}
                        onCancel={() => setShowReviewForm(false)}
                    />
                )}

                <ReviewList
                    productId={id}
                    currentUserId={user?.id}
                    onReviewUpdate={handleReviewUpdate}
                    onReviewDelete={handleReviewUpdate}
                />
            </div>
        </div>
    );
};

export default ProductDetail;
