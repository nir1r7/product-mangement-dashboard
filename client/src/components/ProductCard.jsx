import React from 'react';
import { Link } from 'react-router-dom';

const cardStyles = {
    container: {
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    imgWrap: { width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 6, background: '#f6f6f6' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    name: { fontSize: 16, fontWeight: 600, margin: 0 },
    price: { margin: '4px 0 0 0', fontWeight: 500 }
};

export default function ProductCard({ product }) {
    const mainImage = (product.images && product.images.length > 0)
        ? product.images[0]
        : product.imageUrl;

    return (
            <Link to={`/products/${product._id}`} style={cardStyles.container}>
                <div style={cardStyles.imgWrap}>
                    {mainImage ? (
                    <img
                        src={mainImage.startsWith('http') ? mainImage : `http://localhost:5000${mainImage}`}
                        alt={product.name}
                        style={cardStyles.img}
                    />
                    ) : null}
                </div>
                <h3 style={cardStyles.name}>{product.name}</h3>
                <div style={cardStyles.price}>${Number(product.price).toFixed(2)}</div>
            </Link>
        );
}
