import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

function ProductDetail() {
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

    const styles = {
        container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' },
        mainImage: { width: '100%', maxHeight: '400px', objectFit: 'cover' },
        navButton: { padding: '10px', margin: '5px', cursor: 'pointer' },
        thumbnail: { width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer', margin: '5px' },
        thumbnails: { display: 'flex', flexWrap: 'wrap', marginTop: '10px' }
    };

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div>
            <div style={styles.container}>
                <div>
                    {product.images && product.images.length > 0 ? (
                        <>
                            <div>
                                <button style={styles.navButton} onClick={prevImage}>‹</button>
                                <img 
                                    src={`http://localhost:5000${product.images[currentImageIndex]}`}
                                    alt={product.name}
                                    style={styles.mainImage}
                                />
                                <button style={styles.navButton} onClick={nextImage}>›</button>
                            </div>
                            <div style={styles.thumbnails}>
                                {product.images.map((url, index) => (
                                    <img
                                        key={url}
                                        src={`http://localhost:5000${url}`}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        style={styles.thumbnail}
                                        onClick={() => setCurrentImageIndex(index)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div>No images available</div>
                    )}
                </div>
                <div>
                    <h1>{product.name}</h1>
                    <p>${product.price.toFixed(2)}</p>
                    
                    {/* Rating Display */}
                    {product.reviewStats && product.reviewStats.totalReviews > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <StarRating rating={product.reviewStats.averageRating} readonly size="medium" />
                            <span style={{ marginLeft: '10px', color: '#666' }}>
                                ({product.reviewStats.totalReviews} reviews)
                            </span>
                        </div>
                    )}
                    
                    <p>{product.description}</p>
                    <p>Stock: {product.stock}</p>
                    <p>Category: {product.category}</p>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        style={{ padding: '10px 16px' }}
                    >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <Link to="/products" style={{ alignSelf: 'center' }}>
                        ← Back to Products
                    </Link>
                </div>
            </div>

            <div style={{ marginTop: '40px', padding: '20px' }}>
                <h2>Customer Reviews</h2>
                
                {token && !userReview && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
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
}

export default ProductDetail;