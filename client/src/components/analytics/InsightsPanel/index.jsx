import React from 'react';
import './InsightsPanel.css';

const InsightsPanel = ({ kpiData, trendsData, productsData, categoriesData }) => {
    const generateInsights = () => {
        const insights = [];
        
        if (!kpiData || !kpiData.kpis) return insights;
        
        const kpis = kpiData.kpis;
        
        // Revenue insights
        if (kpis.grossRevenue) {
            if (kpis.grossRevenue.delta > 10) {
                insights.push({
                    type: 'positive',
                    title: 'Strong Revenue Growth',
                    message: `Revenue is up ${kpis.grossRevenue.delta.toFixed(1)}% compared to the previous period.`,
                    action: 'Consider scaling successful marketing campaigns.'
                });
            } else if (kpis.grossRevenue.delta < -10) {
                insights.push({
                    type: 'warning',
                    title: 'Revenue Decline',
                    message: `Revenue is down ${Math.abs(kpis.grossRevenue.delta).toFixed(1)}% compared to the previous period.`,
                    action: 'Review marketing strategies and customer feedback.'
                });
            }
        }
        
        // AOV insights
        if (kpis.aov) {
            if (kpis.aov.value > 100) {
                insights.push({
                    type: 'positive',
                    title: 'High Average Order Value',
                    message: `Your AOV of $${kpis.aov.value.toFixed(2)} indicates customers are purchasing premium items.`,
                    action: 'Focus on upselling and cross-selling strategies.'
                });
            } else if (kpis.aov.value < 50) {
                insights.push({
                    type: 'info',
                    title: 'Opportunity for AOV Growth',
                    message: `Current AOV is $${kpis.aov.value.toFixed(2)}. There's room for improvement.`,
                    action: 'Consider bundling products or offering volume discounts.'
                });
            }
        }
        
        // Margin insights
        if (kpis.grossMarginPct) {
            if (kpis.grossMarginPct.value > 40) {
                insights.push({
                    type: 'positive',
                    title: 'Healthy Profit Margins',
                    message: `Gross margin of ${kpis.grossMarginPct.value.toFixed(1)}% indicates good pricing strategy.`,
                    action: 'Maintain current pricing while monitoring competition.'
                });
            } else if (kpis.grossMarginPct.value < 20) {
                insights.push({
                    type: 'warning',
                    title: 'Low Profit Margins',
                    message: `Gross margin of ${kpis.grossMarginPct.value.toFixed(1)}% may impact profitability.`,
                    action: 'Review product costs and pricing strategy.'
                });
            }
        }
        
        // Refund rate insights
        if (kpis.refundRate) {
            if (kpis.refundRate.value > 5) {
                insights.push({
                    type: 'warning',
                    title: 'High Refund Rate',
                    message: `Refund rate of ${kpis.refundRate.value.toFixed(1)}% is above industry average.`,
                    action: 'Investigate product quality and customer satisfaction.'
                });
            } else if (kpis.refundRate.value < 2) {
                insights.push({
                    type: 'positive',
                    title: 'Low Refund Rate',
                    message: `Refund rate of ${kpis.refundRate.value.toFixed(1)}% indicates high customer satisfaction.`,
                    action: 'Continue current quality standards.'
                });
            }
        }
        
        // Customer insights
        if (kpis.activeCustomers && kpis.orders) {
            const ordersPerCustomer = kpis.orders.value / kpis.activeCustomers.value;
            if (ordersPerCustomer > 2) {
                insights.push({
                    type: 'positive',
                    title: 'High Customer Loyalty',
                    message: `Customers are placing ${ordersPerCustomer.toFixed(1)} orders on average.`,
                    action: 'Implement loyalty programs to further increase retention.'
                });
            } else if (ordersPerCustomer < 1.2) {
                insights.push({
                    type: 'info',
                    title: 'Customer Retention Opportunity',
                    message: `Most customers are placing only one order.`,
                    action: 'Focus on email marketing and retargeting campaigns.'
                });
            }
        }
        
        return insights.slice(0, 4); // Limit to 4 insights
    };
    
    const insights = generateInsights();
    
    const getInsightIcon = (type) => {
        switch (type) {
            case 'positive': return '✅';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📊';
        }
    };
    
    const getInsightClass = (type) => {
        return `insight-item insight-${type}`;
    };
    
    if (insights.length === 0) {
        return (
            <div className="insights-panel">
                <h3>Key Insights</h3>
                <div className="no-insights">
                    <p>Gathering insights from your data...</p>
                    <small>Insights will appear as more data becomes available.</small>
                </div>
            </div>
        );
    }
    
    return (
        <div className="insights-panel">
            <h3>Key Insights</h3>
            <div className="insights-list">
                {insights.map((insight, index) => (
                    <div key={index} className={getInsightClass(insight.type)}>
                        <div className="insight-header">
                            <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                            <h4 className="insight-title">{insight.title}</h4>
                        </div>
                        <p className="insight-message">{insight.message}</p>
                        <div className="insight-action">
                            <strong>Action:</strong> {insight.action}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InsightsPanel;
