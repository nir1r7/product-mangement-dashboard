import React, { useState } from 'react';
import './RevenueChart.css';

const RevenueChart = ({ data, loading = false }) => {
    const [activeMetric, setActiveMetric] = useState('revenue');
    
    const trends = data?.trends || [];
    
    if (loading) {
        return (
            <div className="revenue-chart">
                <h2>Revenue Over Time</h2>
                <div className="chart-loading">Loading chart data...</div>
            </div>
        );
    }

    if (!trends.length) {
        return (
            <div className="revenue-chart">
                <h2>Revenue Over Time</h2>
                <div className="chart-empty">No data available for the selected period</div>
            </div>
        );
    }

    // Calculate max value for scaling
    const maxValue = Math.max(...trends.map(t => t[activeMetric] || 0));
    const minValue = Math.min(...trends.map(t => t[activeMetric] || 0));
    const range = maxValue - minValue;

    // Generate SVG path for line chart
    const generatePath = (data, metric) => {
        if (!data.length) return '';

        const width = 800;
        const height = 300;
        const padding = 40;
        
        const points = data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((item[metric] - minValue) / range) * (height - 2 * padding);
            return `${x},${y}`;
        });
        
        return `M ${points.join(' L ')}`;
    };

    const formatValue = (value, metric) => {
        switch (metric) {
            case 'revenue':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
            default:
                return new Intl.NumberFormat('en-US').format(value);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className="revenue-chart">
            <div className="chart-header">
                <h2>Trends Over Time</h2>
                <div className="chart-controls">
                    <button
                        className={`metric-btn ${activeMetric === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveMetric('revenue')}
                    >
                        Revenue
                    </button>
                    <button
                        className={`metric-btn ${activeMetric === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveMetric('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={`metric-btn ${activeMetric === 'units' ? 'active' : ''}`}
                        onClick={() => setActiveMetric('units')}
                    >
                        Units
                    </button>
                </div>
            </div>
            
            <div className="chart-container">
                <svg viewBox="0 0 800 300" className="chart-svg" preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Chart line */}
                    <path
                        d={generatePath(trends, activeMetric)}
                        fill="none"
                        stroke="#0066cc"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {trends.map((item, index) => {
                        const x = 40 + (index / (trends.length - 1)) * (800 - 80);
                        const y = 300 - 40 - ((item[activeMetric] - minValue) / range) * (300 - 80);
                        
                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#0066cc"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                <title>
                                    {formatDate(item._id)}: {formatValue(item[activeMetric], activeMetric)}
                                </title>
                            </g>
                        );
                    })}
                    
                    {/* Y-axis labels */}
                    <text x="10" y="50" fontSize="12" fill="#666">
                        {formatValue(maxValue, activeMetric)}
                    </text>
                    <text x="10" y="270" fontSize="12" fill="#666">
                        {formatValue(minValue, activeMetric)}
                    </text>
                </svg>
                
                {/* X-axis labels */}
                <div className="chart-x-labels">
                    {trends.map((item, index) => (
                        <span key={index} className="x-label">
                            {formatDate(item._id)}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="chart-summary">
                <div className="summary-item">
                    <span className="summary-label">Total {activeMetric}:</span>
                    <span className="summary-value">
                        {formatValue(
                            trends.reduce((sum, item) => sum + (item[activeMetric] || 0), 0),
                            activeMetric
                        )}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Average:</span>
                    <span className="summary-value">
                        {formatValue(
                            trends.reduce((sum, item) => sum + (item[activeMetric] || 0), 0) / trends.length,
                            activeMetric
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
