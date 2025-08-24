import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import SearchBar from '../../ui/SearchBar';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [showFilters, setShowFilters] = useState(false);

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

    const handleSortChange = (sortType) => {
        setSortBy(sortType);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
    };

    const categories = [...new Set(products.map(product => product.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'rating-high':
                return (b.reviewStats?.averageRating || 0) - (a.reviewStats?.averageRating || 0);
            case 'rating-low':
                return (a.reviewStats?.averageRating || 0) - (b.reviewStats?.averageRating || 0);
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            default:
                return 0;
        }
    });

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

                <div className="controls-section">
                    <div className="controls-header">
                        <button
                            className="filters-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            🔧 Filters & Sort {showFilters ? '▲' : '▼'}
                        </button>

                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Search products..."
                            value={searchQuery}
                        />

                        <div className="results-count">
                            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
                        </div>
                    </div>

                    {showFilters && (
                        <div className="filters-panel">
                            <div className="search-sort-row">
                                <div className="filter-group">
                                    <label>Sort by:</label>
                                    <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating-high">Rating: High to Low</option>
                                        <option value="rating-low">Rating: Low to High</option>
                                        <option value="name-asc">Name: A to Z</option>
                                        <option value="name-desc">Name: Z to A</option>
                                    </select>
                                </div>
                            </div>

                            <div className="filters-row">
                                <div className="filter-group">
                                    <label>Category:</label>
                                    <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
                                    <div className="price-range-container">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100000"
                                            value={priceRange[0]}
                                            onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), priceRange[1]])}
                                            className="price-slider"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100000"
                                            value={priceRange[1]}
                                            onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                                            className="price-slider"
                                        />
                                    </div>
                                    <div className="price-inputs">
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                                            placeholder="Min"
                                            className="price-input"
                                        />
                                        <span>to</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value) || 100000])}
                                            placeholder="Max"
                                            className="price-input"
                                        />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>&nbsp;</label>
                                    <button
                                        className="clear-filters-btn"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('');
                                            setPriceRange([0, 100000]);
                                            setSortBy('newest');
                                        }}
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {sortedProducts.length === 0 ? (
                <div className="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {sortedProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
