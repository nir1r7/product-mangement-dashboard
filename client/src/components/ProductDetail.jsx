import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function ProductDetail() {
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const styles = {
        container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' },
        mainImage: { width: '100%', maxHeight: '400px', objectFit: 'cover' },
        navButton: { padding: '10px', margin: '5px', cursor: 'pointer' },
        thumbnail: { width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer', margin: '5px' },
        thumbnails: { display: 'flex', flexWrap: 'wrap', marginTop: '10px' }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
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
    );
}

export default ProductDetail;