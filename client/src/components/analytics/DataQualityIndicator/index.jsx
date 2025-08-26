import React from 'react';
import './DataQualityIndicator.css';

const DataQualityIndicator = ({ data }) => {
    const calculateDataQuality = () => {
        if (!data) return { score: 0, issues: ['No data available'] };
        
        const issues = [];
        let score = 100;
        
        // Check for missing KPI data
        if (!data.kpis || Object.keys(data.kpis).length === 0) {
            issues.push('Missing KPI data');
            score -= 20;
        }
        
        // Check for recent data
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (data.range && new Date(data.range.to) < lastWeek) {
            issues.push('Data is more than a week old');
            score -= 15;
        }
        
        // Check for sufficient data volume
        if (data.kpis && data.kpis.orders < 10) {
            issues.push('Low order volume may affect accuracy');
            score -= 10;
        }
        
        // Check for missing comparison data
        if (!data.compareRange) {
            issues.push('No comparison period selected');
            score -= 5;
        }
        
        return { score: Math.max(0, score), issues };
    };
    
    const { score, issues } = calculateDataQuality();
    
    const getScoreColor = (score) => {
        if (score >= 90) return '#28a745'; // Green
        if (score >= 70) return '#ffc107'; // Yellow
        if (score >= 50) return '#fd7e14'; // Orange
        return '#dc3545'; // Red
    };
    
    const getScoreLabel = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Poor';
    };
    
    return (
        <div className="data-quality-indicator">
            <div className="quality-header">
                <h4>Data Quality</h4>
                <div 
                    className="quality-score"
                    style={{ color: getScoreColor(score) }}
                >
                    {score}% - {getScoreLabel(score)}
                </div>
            </div>
            
            {issues.length > 0 && (
                <div className="quality-issues">
                    <h5>Issues:</h5>
                    <ul>
                        {issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="quality-tips">
                <h5>Tips for better insights:</h5>
                <ul>
                    <li>Select a comparison period to see trends</li>
                    <li>Use recent date ranges for current performance</li>
                    <li>Ensure sufficient order volume for accuracy</li>
                    <li>Check data regularly for anomalies</li>
                </ul>
            </div>
        </div>
    );
};

export default DataQualityIndicator;
