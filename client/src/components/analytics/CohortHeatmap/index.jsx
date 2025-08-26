import React from 'react';
import './CohortHeatmap.css';

const CohortHeatmap = ({ data, loading = false }) => {
    const cohorts = data?.cohorts || {};
    const months = data?.months || [];
    
    if (loading) {
        return (
            <div className="cohort-heatmap">
                <h2>Customer Cohort Analysis</h2>
                <div className="chart-loading">Loading cohort data...</div>
            </div>
        );
    }

    if (!months.length) {
        return (
            <div className="cohort-heatmap">
                <h2>Customer Cohort Analysis</h2>
                <div className="chart-empty">Not enough data for cohort analysis. Need at least 2 months of orders.</div>
            </div>
        );
    }

    const getHeatmapColor = (rate) => {
        if (rate >= 80) return '#0066cc'; // Dark blue
        if (rate >= 60) return '#4d94ff'; // Medium blue
        if (rate >= 40) return '#80b3ff'; // Light blue
        if (rate >= 20) return '#b3d1ff'; // Very light blue
        if (rate > 0) return '#e6f0ff';   // Pale blue
        return '#f8f9fa';                 // Light gray
    };

    const formatMonth = (monthStr) => {
        const date = new Date(monthStr + '-01');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        });
    };

    return (
        <div className="cohort-heatmap">
            <h2>Customer Cohort Analysis</h2>
            <div className="cohort-description">
                <p>Shows customer retention rates by acquisition month. Each row represents a cohort of customers who made their first purchase in that month.</p>
            </div>
            
            <div className="cohort-table-container">
                <table className="cohort-table">
                    <thead>
                        <tr>
                            <th className="cohort-month-header">Cohort Month</th>
                            <th className="cohort-size-header">Size</th>
                            {Array.from({ length: 12 }, (_, i) => (
                                <th key={i} className="cohort-period-header">
                                    Month {i}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {months.map(month => {
                            const cohort = cohorts[month];
                            if (!cohort) return null;
                            
                            return (
                                <tr key={month} className="cohort-row">
                                    <td className="cohort-month">
                                        {formatMonth(month)}
                                    </td>
                                    <td className="cohort-size">
                                        {cohort.size}
                                    </td>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const retention = cohort.retention[i];
                                        if (!retention || retention.users === 0) {
                                            return (
                                                <td key={i} className="cohort-cell empty">
                                                    -
                                                </td>
                                            );
                                        }
                                        
                                        return (
                                            <td 
                                                key={i} 
                                                className="cohort-cell"
                                                style={{
                                                    backgroundColor: getHeatmapColor(retention.rate),
                                                    color: retention.rate >= 60 ? 'white' : '#333'
                                                }}
                                                title={`${retention.users} customers (${retention.rate.toFixed(1)}%)`}
                                            >
                                                {retention.rate.toFixed(0)}%
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <div className="cohort-legend">
                <h4>Retention Rate Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#0066cc' }}></div>
                        <span>80%+</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#4d94ff' }}></div>
                        <span>60-79%</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#80b3ff' }}></div>
                        <span>40-59%</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#b3d1ff' }}></div>
                        <span>20-39%</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#e6f0ff' }}></div>
                        <span>1-19%</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#f8f9fa' }}></div>
                        <span>0%</span>
                    </div>
                </div>
            </div>
            
            <div className="cohort-insights">
                <h4>Key Insights</h4>
                <div className="insights-grid">
                    <div className="insight-item">
                        <span className="insight-label">Total Cohorts:</span>
                        <span className="insight-value">{months.length}</span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">Largest Cohort:</span>
                        <span className="insight-value">
                            {Math.max(...months.map(m => cohorts[m]?.size || 0))} customers
                        </span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">Avg Month 1 Retention:</span>
                        <span className="insight-value">
                            {months.length > 0 ? (
                                months.reduce((sum, m) => sum + (cohorts[m]?.retention[1]?.rate || 0), 0) / months.length
                            ).toFixed(1) : 0}%
                        </span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">Avg Month 3 Retention:</span>
                        <span className="insight-value">
                            {months.length > 0 ? (
                                months.reduce((sum, m) => sum + (cohorts[m]?.retention[3]?.rate || 0), 0) / months.length
                            ).toFixed(1) : 0}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CohortHeatmap;
