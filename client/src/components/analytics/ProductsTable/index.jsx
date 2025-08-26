import React, { useState } from 'react';
import './ProductsTable.css';

const ProductsTable = ({ data, loading = false }) => {
    const [sortBy, setSortBy] = useState('revenue');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    
    const products = data?.products || [];
    
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };
    
    const filteredAndSortedProducts = products
        .filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };
    
    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };
    
    const getSortIcon = (column) => {
        if (sortBy !== column) return '↕';
        return sortOrder === 'asc' ? '↑' : '↓';
    };
    
    if (loading) {
        return (
            <div className="products-table">
                <h2>Top Products</h2>
                <div className="table-loading">Loading products data...</div>
            </div>
        );
    }
    
    return (
        <div className="products-table">
            <div className="table-header">
                <h2>Top Products</h2>
                <div className="table-controls">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            
            {filteredAndSortedProducts.length === 0 ? (
                <div className="table-empty">
                    {searchTerm ? 'No products match your search' : 'No products data available'}
                </div>
            ) : (
                <div className="table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th 
                                    onClick={() => handleSort('name')}
                                    className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                                >
                                    Product {getSortIcon('name')}
                                </th>
                                <th 
                                    onClick={() => handleSort('category')}
                                    className={`sortable ${sortBy === 'category' ? 'active' : ''}`}
                                >
                                    Category {getSortIcon('category')}
                                </th>
                                <th 
                                    onClick={() => handleSort('revenue')}
                                    className={`sortable ${sortBy === 'revenue' ? 'active' : ''}`}
                                >
                                    Revenue {getSortIcon('revenue')}
                                </th>
                                <th 
                                    onClick={() => handleSort('units')}
                                    className={`sortable ${sortBy === 'units' ? 'active' : ''}`}
                                >
                                    Units Sold {getSortIcon('units')}
                                </th>
                                <th 
                                    onClick={() => handleSort('orders')}
                                    className={`sortable ${sortBy === 'orders' ? 'active' : ''}`}
                                >
                                    Orders {getSortIcon('orders')}
                                </th>
                                <th 
                                    onClick={() => handleSort('avgOrderValue')}
                                    className={`sortable ${sortBy === 'avgOrderValue' ? 'active' : ''}`}
                                >
                                    Avg Order Value {getSortIcon('avgOrderValue')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedProducts.map((product, index) => (
                                <tr key={product.productId} className={index % 2 === 0 ? 'even' : 'odd'}>
                                    <td className="product-name">
                                        <div className="product-info">
                                            <span className="rank">#{index + 1} - </span>
                                            <span className="name">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="category">
                                        <span className="category-badge">{product.category}</span>
                                    </td>
                                    <td className="revenue">
                                        {formatCurrency(product.revenue)}
                                    </td>
                                    <td className="units">
                                        {formatNumber(product.units)}
                                    </td>
                                    <td className="orders">
                                        {formatNumber(product.orders)}
                                    </td>
                                    <td className="aov">
                                        {formatCurrency(product.avgOrderValue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="table-footer">
                <div className="table-summary">
                    Showing {filteredAndSortedProducts.length} of {products.length} products
                </div>
            </div>
        </div>
    );
};

export default ProductsTable;
