import React, { useState } from 'react';
import './CustomerSegments.css';

const CustomerSegments = ({ data, loading = false }) => {
    const [activeView, setActiveView] = useState('segments');
    const [selectedSegment, setSelectedSegment] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState('');
    
    const segments = data?.segments || [];
    const customers = data?.customers || [];
    const totalCustomers = data?.totalCustomers || 0;
    
    if (loading) {
        return (
            <div className="customer-segments">
                <h2>Customer Segmentation (RFM Analysis)</h2>
                <div className="chart-loading">Loading customer data...</div>
            </div>
        );
    }

    if (!segments.length) {
        return (
            <div className="customer-segments">
                <h2>Customer Segmentation (RFM Analysis)</h2>
                <div className="chart-empty">No customer data available for segmentation</div>
            </div>
        );
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const getSegmentColor = (segmentName) => {
        const colors = {
            'Champions': '#28a745',
            'Loyal Customers': '#17a2b8',
            'Potential Loyalists': '#ffc107',
            'New Customer': '#6c757d',
            'At Risk': '#fd7e14',
            'Cannot Lose Them': '#dc3545',
            'Lost Customers': '#6f42c1'
        };
        return colors[segmentName] || '#6c757d';
    };

    const getSegmentDescription = (segmentName) => {
        const descriptions = {
            'Champions': 'Best customers who buy frequently and recently',
            'Loyal Customers': 'Regular customers with good purchase history',
            'Potential Loyalists': 'Recent customers with potential to become loyal',
            'New Customer': 'Recent first-time customers',
            'At Risk': 'Previously good customers who haven\'t purchased recently',
            'Cannot Lose Them': 'High-value customers at risk of churning',
            'Lost Customers': 'Customers who haven\'t purchased in a long time'
        };
        return descriptions[segmentName] || 'Customer segment';
    };

    const filteredCustomers = customers
        .filter(c => {
            const segmentMatch = selectedSegment === 'all' || c.segment === selectedSegment;

            const searchMatch = searchTerm === '' ||
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.segment.toLowerCase().includes(searchTerm.toLowerCase());

            return segmentMatch && searchMatch;
        });

    const totalCustomersFiltered = filteredCustomers.length;
    const totalPages = Math.ceil(totalCustomersFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSegmentChange = (segment) => {
        setSelectedSegment(segment);
        setCurrentPage(1);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    return (
        <div className="customer-segments">
            <div className="segments-header">
                <h2>Customer Segmentation (RFM Analysis)</h2>
            </div>

            <div className="customers-controls">
                {activeView === 'customers' && (
                    <div className="controls-left">
                        <div className="filter-group">
                            <label htmlFor="customer-search">Search Customers:</label>
                            <input
                                id="customer-search"
                                type="text"
                                placeholder="Search by name, email, or segment..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="segment-filter">Filter by Segment:</label>
                            <select
                                id="segment-filter"
                                value={selectedSegment}
                                onChange={(e) => handleSegmentChange(e.target.value)}
                                className="segment-filter"
                            >
                                <option value="all">All Segments</option>
                                {segments.map(segment => (
                                    <option key={segment.name} value={segment.name}>
                                        {segment.name} ({segment.count})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="view-controls">
                    <button
                        className={`view-btn ${activeView === 'segments' ? 'active' : ''}`}
                        onClick={() => setActiveView('segments')}
                    >
                        Segments Overview
                    </button>
                    <button
                        className={`view-btn ${activeView === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveView('customers')}
                    >
                        Customer Details
                    </button>
                </div>
            </div>

            {activeView === 'segments' ? (
                <div className="segments-overview">
                    <div className="segments-grid">
                        {segments.map(segment => (
                            <div 
                                key={segment.name} 
                                className="segment-card"
                                style={{ borderLeftColor: getSegmentColor(segment.name) }}
                            >
                                <div className="segment-header">
                                    <h3 className="segment-name">{segment.name}</h3>
                                    <div className="segment-count">{segment.count} customers</div>
                                </div>
                                <div className="segment-description">
                                    {getSegmentDescription(segment.name)}
                                </div>
                                <div className="segment-metrics">
                                    <div className="metric">
                                        <span className="metric-label">Total Value:</span>
                                        <span className="metric-value">{formatCurrency(segment.totalValue)}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Avg. Recency:</span>
                                        <span className="metric-value">{segment.avgRecency.toFixed(0)} days</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Avg. Frequency:</span>
                                        <span className="metric-value">{segment.avgFrequency.toFixed(1)} orders</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Avg. Monetary:</span>
                                        <span className="metric-value">{formatCurrency(segment.avgMonetary)}</span>
                                    </div>
                                </div>
                                <div
                                    className="segment-percentage"
                                    style={{ backgroundColor: getSegmentColor(segment.name) }}
                                >
                                    {((segment.count / totalCustomers) * 100).toFixed(1)}% of customers
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="customers-detail">

                    <div className="customers-table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Segment</th>
                                    <th>RFM Score</th>
                                    <th>Recency (Days)</th>
                                    <th>Frequency</th>
                                    <th>Monetary</th>
                                    <th>First Order</th>
                                    <th>Last Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCustomers.map(customer => (
                                    <tr key={customer.userId}>
                                        <td className="customer-info">
                                            <div className="customer-name">{customer.name}</div>
                                            <div className="customer-email">{customer.email}</div>
                                        </td>
                                        <td>
                                            <span 
                                                className="segment-badge"
                                                style={{ backgroundColor: getSegmentColor(customer.segment) }}
                                            >
                                                {customer.segment}
                                            </span>
                                        </td>
                                        <td className="rfm-score">{customer.rfmScore}</td>
                                        <td className="recency">{customer.recencyDays.toFixed(0)}</td>
                                        <td className="frequency">{customer.frequency}</td>
                                        <td className="monetary">{formatCurrency(customer.monetary)}</td>
                                        <td className="first-order">
                                            {new Date(customer.firstOrder).toLocaleDateString()}
                                        </td>
                                        <td className="last-order">
                                            {new Date(customer.lastOrder).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Showing {startIndex + 1}-{Math.min(endIndex, totalCustomersFiltered)} of {totalCustomersFiltered} customers
                                {selectedSegment !== 'all' && ` in ${selectedSegment} segment`}
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

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

                    <div className="customers-footer">
                        <div className="showing-info">
                            Total: {totalCustomersFiltered} customers
                            {selectedSegment !== 'all' && ` in ${selectedSegment} segment`}
                        </div>
                    </div>
                </div>
            )}

            <div className="rfm-explanation">
                <h4>RFM Analysis Explanation</h4>
                <div className="explanation-grid">
                    <div className="explanation-item">
                        <strong>Recency (R):</strong> How recently a customer made a purchase
                    </div>
                    <div className="explanation-item">
                        <strong>Frequency (F):</strong> How often a customer makes purchases
                    </div>
                    <div className="explanation-item">
                        <strong>Monetary (M):</strong> How much money a customer spends
                    </div>
                    <div className="explanation-item">
                        <strong>RFM Score:</strong> Three-digit score (e.g., 555 = highest value customer)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSegments;
