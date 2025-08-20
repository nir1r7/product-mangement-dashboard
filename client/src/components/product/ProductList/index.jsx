import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import SearchBar from '../../ui/SearchBar';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="product-list-container">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-list-container">
                <div className="error-container">
                    <h3>Error loading products</h3>
                    <p>{error}</p>
                    <button onClick={fetchProducts} className="btn btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <div className="product-list-header">
                <h1 className="product-list-title">Our Products</h1>
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search products by name, description, or category..."
                    value={searchQuery}
                />
            </div>
            
            {searchQuery && (
                <div className="search-results">
                    <p>Showing {filteredProducts.length} results for "{searchQuery}"</p>
                </div>
            )}
            
            {filteredProducts.length === 0 ? (
                <div className="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms or browse all products.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
