import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                if (!res.ok) throw new Error('Failed to fetch product');
                const data = await res.json();
                setProduct(data);
            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const galleryImages = useMemo(() => {
        if (!product) return [];

        const imgs = (product.images && product.images.length > 0)
        ? product.images
        : (product.imageUrl ? [product.imageUrl] : []);
        return imgs.map(src => src.startsWith('http') ? src : `http://localhost:5000${src}`);
    }, [product]);

    if (loading) return <div>Loading product...</div>;
    if (err) return <div style={{ color: 'red' }}>{err}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
                {galleryImages[activeIndex] && (
                <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                    <img
                    src={galleryImages[activeIndex]}
                    alt={product.name}
                    style={{ width: '100%', height: 420, objectFit: 'cover' }}
                    />
                </div>
                )}

                {galleryImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {galleryImages.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        style={{
                            border: i === activeIndex ? '2px solid #333' : '1px solid #ddd',
                            borderRadius: 6,
                            padding: 0,
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <img
                            src={src}
                            alt={`${product.name} ${i + 1}`}
                            style={{ width: 72, height: 72, objectFit: 'cover', display: 'block' }}
                        />
                    </button>
                    ))}
                </div>
                )}
            </div>

            <div>
                <h1 style={{ marginTop: 0 }}>{product.name}</h1>
                <div style={{ fontSize: 20, fontWeight: 600, margin: '8px 0' }}>
                    ${Number(product.price).toFixed(2)}
                </div>
                <div style={{ color: '#666', marginBottom: 16 }}>
                    Category: {product.category} • In stock: {product.stock}
                </div>
                <p style={{ lineHeight: 1.6 }}>{product.description}</p>

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
        </div>
    );
}
