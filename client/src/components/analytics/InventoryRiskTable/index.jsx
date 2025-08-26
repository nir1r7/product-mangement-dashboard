import React, { useState } from 'react';
import './InventoryRiskTable.css';

const InventoryRiskTable = ({ data, loading = false }) => {
    const [sortBy, setSortBy] = useState('daysOfCover');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterRisk, setFilterRisk] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    
    const riskProducts = data?.riskProducts || [];
    const summary = data?.summary || {};
    
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };
    
    const filteredAndSortedProducts = riskProducts
        .filter(product => {
            const riskMatch = filterRisk === 'all' ||
                product.riskLevel.toLowerCase() === filterRisk.toLowerCase();

            const searchMatch = searchTerm === '' ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.riskLevel.toLowerCase().includes(searchTerm.toLowerCase());

            return riskMatch && searchMatch;
        })
        .sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'currentStock' || sortBy === 'dailyVelocity') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (sortBy === 'daysOfCover') {
                aVal = parseFloat(aVal) || 999;
                bVal = parseFloat(bVal) || 999;
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    const totalItems = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedProducts.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (risk) => {
        setFilterRisk(risk);
        setCurrentPage(1);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) return '↕';
        return sortOrder === 'asc' ? '↑' : '↓';
    };
    
    const getRiskBadgeClass = (riskLevel) => {
        return riskLevel === 'Critical' ? 'risk-critical' : 'risk-low';
    };
    
    if (loading) {
        return (
            <div className="inventory-risk-table">
                <h2>Inventory Risk Analysis</h2>
                <div className="table-loading">Loading inventory data...</div>
            </div>
        );
    }
    
    return (
        <div className="inventory-risk-table">
            <div className="table-header">
                <h2>Inventory Risk Analysis</h2>
                {/* <div className="risk-summary">
                    <div className="summary-card critical">
                        <span className="summary-number">{summary.critical || 0}</span>
                        <span className="summary-label">Critical</span>
                    </div>
                    <div className="summary-card warning">
                        <span className="summary-number">{summary.lowStock || 0}</span>
                        <span className="summary-label">Low Stock</span>
                    </div>
                    <div className="summary-card total">
                        <span className="summary-number">{summary.totalAtRisk || 0}</span>
                        <span className="summary-label">Total at Risk</span>
                    </div>
                </div> */}
            </div>
            
            <div className="table-controls">
                <div className="controls-left">
                    <div className="search-controls">
                        <label htmlFor="product-search">Search Products:</label>
                        <input
                            id="product-search"
                            type="text"
                            placeholder="Search by product name, category, or risk level..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-controls">
                        <label htmlFor="risk-filter">Filter by Risk:</label>
                        <select
                            id="risk-filter"
                            value={filterRisk}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="critical">Critical Only</option>
                            <option value="low stock">Low Stock Only</option>
                        </select>
                    </div>
                </div>

                <div className="risk-summary">
                    <div className="summary-card critical">
                        <span className="summary-number">{summary.critical || 0}</span>
                        <span className="summary-label">Critical</span>
                    </div>
                    <div className="summary-card warning">
                        <span className="summary-number">{summary.lowStock || 0}</span>
                        <span className="summary-label">Low Stock</span>
                    </div>
                    <div className="summary-card total">
                        <span className="summary-number">{summary.totalAtRisk || 0}</span>
                        <span className="summary-label">Total at Risk</span>
                    </div>
                </div>
            </div>
            
            {filteredAndSortedProducts.length === 0 ? (
                <div className="table-empty">
                    {filterRisk === 'all' 
                        ? 'No products at risk - great inventory management!' 
                        : `No products with ${filterRisk} risk level`
                    }
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
                                    onClick={() => handleSort('currentStock')}
                                    className={`sortable ${sortBy === 'currentStock' ? 'active' : ''}`}
                                >
                                    Current Stock {getSortIcon('currentStock')}
                                </th>
                                <th 
                                    onClick={() => handleSort('dailyVelocity')}
                                    className={`sortable ${sortBy === 'dailyVelocity' ? 'active' : ''}`}
                                >
                                    Daily Velocity {getSortIcon('dailyVelocity')}
                                </th>
                                <th
                                    onClick={() => handleSort('daysOfCover')}
                                    className={`sortable ${sortBy === 'daysOfCover' ? 'active' : ''}`}
                                >
                                    Days of Cover {getSortIcon('daysOfCover')}
                                </th>
                                <th
                                    onClick={() => handleSort('riskLevel')}
                                    className={`sortable ${sortBy === 'riskLevel' ? 'active' : ''}`}
                                >
                                    Risk Level {getSortIcon('riskLevel')}
                                </th>
                                <th>Risk Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((product, index) => (
                                <tr key={product.productId} className={index % 2 === 0 ? 'even' : 'odd'}>
                                    <td className="product-name">
                                        <div className="product-info">
                                            <span className="name">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="category">
                                        <span className="category-badge">{product.category}</span>
                                    </td>
                                    <td className="stock">
                                        <span className={product.currentStock <= 5 ? 'stock-critical' : 'stock-normal'}>
                                            {product.currentStock}
                                        </span>
                                    </td>
                                    <td className="velocity">
                                        {product.dailyVelocity}
                                    </td>
                                    <td className="days-cover">
                                        <span className={parseFloat(product.daysOfCover) <= 7 ? 'days-critical' : 'days-normal'}>
                                            {product.daysOfCover}
                                        </span>
                                    </td>
                                    <td className="risk-level">
                                        <span className={`risk-badge ${getRiskBadgeClass(product.riskLevel)}`}>
                                            {product.riskLevel}
                                        </span>
                                    </td>
                                    <td className="risk-reason">
                                        <small>{product.riskReason}</small>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} products
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <div className="table-footer">
                <div className="table-summary">
                    Showing {filteredAndSortedProducts.length} of {riskProducts.length} at-risk products
                </div>
                <div className="risk-explanation">
                    <small>
                        <strong>Critical:</strong> Very low stock (≤5 units) or will run out within 7 days |
                        <strong>Low Stock:</strong> Will run out within 14 days based on recent sales patterns |
                        <strong>Note:</strong> Analysis based on sales velocity from last 14 days
                    </small>
                </div>
            </div>
        </div>
    );
};

export default InventoryRiskTable;
