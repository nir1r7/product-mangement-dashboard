import React from 'react';
import './CategoryChart.css';

const CategoryChart = ({ data, loading = false }) => {
    const categories = data?.categories || [];
    
    if (loading) {
        return (
            <div className="category-chart">
                <h2>Category Performance</h2>
                <div className="chart-loading">Loading category data...</div>
            </div>
        );
    }

    if (!categories.length) {
        return (
            <div className="category-chart">
                <h2>Category Performance</h2>
                <div className="chart-empty">No category data available</div>
            </div>
        );
    }

    const maxRevenue = Math.max(...categories.map(c => c.revenue));
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };
    
    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const getBarWidth = (revenue) => {
        return (revenue / maxRevenue) * 100;
    };

    const getCategoryColor = (index) => {
        const colors = [
            '#0066cc', '#20c997', '#dc3545', '#ffc107', 
            '#6f42c1', '#fd7e14', '#e83e8c', '#6c757d'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="category-chart">
            <h2>Category Performance</h2>
            
            <div className="category-bars">
                {categories.map((category, index) => (
                    <div key={category.category} className="category-bar-item">
                        <div className="category-info">
                            <div className="category-header">
                                <span className="category-name">{category.category}</span>
                                <span className="category-revenue">{formatCurrency(category.revenue)}</span>
                            </div>
                            <div className="category-bar-container">
                                <div 
                                    className="category-bar"
                                    style={{
                                        width: `${getBarWidth(category.revenue)}%`,
                                        backgroundColor: getCategoryColor(index)
                                    }}
                                />
                            </div>
                            <div className="category-stats">
                                <span className="stats-line">
                                    <strong>{formatNumber(category.units)}</strong> units • <strong>{formatNumber(category.orders)}</strong> orders • <strong>{category.productCount}</strong> products • AOV <strong>{formatCurrency(category.avgOrderValue)}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="category-summary">
                <div className="summary-grid">
                    <div className="summary-item">
                        <span className="summary-label">Total Categories:</span>
                        <span className="summary-value">{categories.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Total Revenue:</span>
                        <span className="summary-value">
                            {formatCurrency(categories.reduce((sum, cat) => sum + cat.revenue, 0))}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Total Units:</span>
                        <span className="summary-value">
                            {formatNumber(categories.reduce((sum, cat) => sum + cat.units, 0))}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Top Category:</span>
                        <span className="summary-value">
                            {categories[0]?.category || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryChart;
