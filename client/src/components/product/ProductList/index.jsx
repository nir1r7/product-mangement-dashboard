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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 12;

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchQuery, selectedCategory, sortBy]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage,
                limit: productsPerPage,
                sortBy: sortBy === 'newest' ? 'createdAt' :
                       sortBy === 'oldest' ? 'createdAt' :
                       sortBy === 'price-low' ? 'price' :
                       sortBy === 'price-high' ? 'price' : 'createdAt',
                sortOrder: sortBy === 'oldest' ? 'asc' :
                          sortBy === 'price-low' ? 'asc' : 'desc'
            });

            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            if (priceRange[0] > 0) params.append('minPrice', priceRange[0]);
            if (priceRange[1] < 100000) params.append('maxPrice', priceRange[1]);

            const response = await fetch(`http://localhost:5000/api/products?${params}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();

            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setTotalProducts(data.total || 0);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleSortChange = (sortType) => {
        setSortBy(sortType);
        setCurrentPage(1); // Reset to first page when sorting
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Static categories list (server-side filtering handles the actual filtering)
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'];

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
                            {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
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

            {products.length === 0 ? (
                <div className="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            ) : (
                <>
                    <div className="product-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <div className="pagination-info">
                                Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                            </div>
                            <div className="pagination-controls">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductList;
