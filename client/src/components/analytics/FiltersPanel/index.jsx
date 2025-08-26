import React from 'react';
import './FiltersPanel.css';

const FiltersPanel = ({ dateRange, filters, onDateRangeChange, onFiltersChange }) => {
    const handleDateChange = (field, value) => {
        onDateRangeChange({
            ...dateRange,
            [field]: value
        });
    };

    const handleFilterChange = (field, value) => {
        onFiltersChange({
            [field]: value
        });
    };

    const setQuickDateRange = (range) => {
        const today = new Date();
        const tmrw = new Date(today)
        tmrw.setDate(tmrw.getDate() + 1);
        let from, to;

        switch (range) {
            case 'today':
                from = today.toISOString().split('T')[0];
                to = tmrw.toISOString().split('T')[0];
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                from = yesterday.toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'last7days':
                from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                to = tmrw.toISOString().split('T')[0];
                break;
            case 'last30days':
                from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                to = tmrw.toISOString().split('T')[0];
                break;
            case 'thisMonth':
                from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                to = tmrw.toISOString().split('T')[0];
                break;
            case 'lastMonth':
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
                from = lastMonth.toISOString().split('T')[0];
                to = lastMonthEnd.toISOString().split('T')[0];
                break;
            default:
                return;
        }

        onDateRangeChange({ from, to });
    };

    return (
        <div className="filters-panel">
            <div className="filters-section">
                <h3>Date Range</h3>
                <div className="date-controls">
                    <div className="quick-dates">
                        <button 
                            className="quick-date-btn"
                            onClick={() => setQuickDateRange('today')}
                        >
                            Today
                        </button>
                        <button 
                            className="quick-date-btn"
                            onClick={() => setQuickDateRange('yesterday')}
                        >
                            Yesterday
                        </button>
                        <button 
                            className="quick-date-btn"
                            onClick={() => setQuickDateRange('last7days')}
                        >
                            Last 7 Days
                        </button>
                        <button 
                            className="quick-date-btn"
                            onClick={() => setQuickDateRange('last30days')}
                        >
                            Last 30 Days
                        </button>
                        <button 
                            className="quick-date-btn"
                            onClick={() => setQuickDateRange('thisMonth')}
                        >
                            This Month
                        </button>
                        <button 
                            className="quick-date-btn"
                            onClick={() => setQuickDateRange('lastMonth')}
                        >
                            Last Month
                        </button>
                    </div>
                    
                    <div className="custom-dates">
                        <div className="date-input-group">
                            <label htmlFor="from-date">From:</label>
                            <input
                                id="from-date"
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => handleDateChange('from', e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="to-date">To:</label>
                            <input
                                id="to-date"
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => handleDateChange('to', e.target.value)}
                                className="date-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <h3>Chart Options</h3>
                <div className="chart-controls">
                    <div className="control-group">
                        <label htmlFor="interval-select">Interval:</label>
                        <select
                            id="interval-select"
                            value={filters.interval}
                            onChange={(e) => handleFilterChange('interval', e.target.value)}
                            className="filter-select"
                        >
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <h3>Filters</h3>
                <div className="filter-controls">
                    <div className="control-group">
                        <label htmlFor="category-filter">Category:</label>
                        <select
                            id="category-filter"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Books">Books</option>
                            <option value="Home">Home</option>
                            <option value="Sports">Sports</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersPanel;
