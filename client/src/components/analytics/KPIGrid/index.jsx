import React from 'react';
import './KPIGrid.css';

const KPICard = ({ title, value, delta, format = 'number', loading = false }) => {
    const formatValue = (val, fmt) => {
        if (loading || val === null || val === undefined) return '...';
        
        switch (fmt) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(val);
            case 'percentage':
                return `${val.toFixed(1)}%`;
            case 'decimal':
                return val.toFixed(2);
            default:
                return new Intl.NumberFormat('en-US').format(val);
        }
    };

    const getDeltaColor = (delta) => {
        if (delta > 0) return 'positive';
        if (delta < 0) return 'negative';
        return 'neutral';
    };

    const getDeltaIcon = (delta) => {
        if (delta > 0) return '↗';
        if (delta < 0) return '↘';
        return '→';
    };

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <h3 className="kpi-title">{title}</h3>
            </div>
            <div className="kpi-content">
                <div className="kpi-value">
                    {formatValue(value, format)}
                </div>
                {delta !== undefined && delta !== null && (
                    <div className={`kpi-delta ${getDeltaColor(delta)}`}>
                        <span className="delta-icon">{getDeltaIcon(delta)}</span>
                        <span className="delta-value">{Math.abs(delta).toFixed(1)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const KPIGrid = ({ data, loading = false }) => {
    const kpis = data?.kpis || {};

    const kpiConfigs = [
        {
            key: 'grossRevenue',
            title: 'Gross Revenue',
            format: 'currency'
        },
        {
            key: 'orders',
            title: 'Orders',
            format: 'number'
        },
        {
            key: 'aov',
            title: 'Average Order Value',
            format: 'currency'
        },
        {
            key: 'units',
            title: 'Units Sold',
            format: 'number'
        },
        {
            key: 'conversionRate',
            title: 'Conversion Rate',
            format: 'percentage'
        },
        {
            key: 'refundRate',
            title: 'Refund Rate',
            format: 'percentage'
        },
        {
            key: 'grossMarginPct',
            title: 'Gross Margin',
            format: 'percentage'
        },
        {
            key: 'activeCustomers',
            title: 'Active Customers',
            format: 'number'
        }
    ];

    return (
        <div className="kpi-grid">
            <h2>Key Performance Indicators</h2>
            <div className="kpi-cards">
                {kpiConfigs.map(config => (
                    <KPICard
                        key={config.key}
                        title={config.title}
                        value={kpis[config.key]?.value}
                        delta={kpis[config.key]?.deltaPct}
                        format={config.format}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    );
};

export default KPIGrid;
