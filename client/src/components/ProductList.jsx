
import React, { useState, useEffect } from 'react';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch('http://localhost:5000/api/products')
        .then(response => response.json())
        .then(data => {
            setProducts(data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            setLoading(false);
        });
    }, []);
    
    if (loading) {
        return <div>Loading products...</div>;
    }
    
    return (
        <div className="product-list">
        <h2>Product List</h2>
        <ul>
            {products.map(product => (
            <li key={product._id}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} style={{ width: '100px', height: '100px' }} />
                <p>Category: {product.category}</p>
            </li>
            ))}
        </ul>
        </div>
    );
}

export default ProductList;