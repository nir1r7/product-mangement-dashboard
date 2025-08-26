import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = ({ onPerformanceUpdate }) => {
    const [metrics, setMetrics] = useState({
        loadTime: 0,
        apiCalls: 0,
        cacheHits: 0,
        errors: 0
    });

    useEffect(() => {
        const startTime = performance.now();
        
        const updateMetrics = () => {
            const loadTime = performance.now() - startTime;
            setMetrics(prev => ({
                ...prev,
                loadTime: loadTime
            }));
            
            if (onPerformanceUpdate) {
                onPerformanceUpdate({ loadTime });
            }
        };

        // Update metrics after initial load
        const timer = setTimeout(updateMetrics, 100);
        
        return () => clearTimeout(timer);
    }, [onPerformanceUpdate]);

    const trackApiCall = (endpoint, duration, fromCache = false) => {
        setMetrics(prev => ({
            ...prev,
            apiCalls: prev.apiCalls + 1,
            cacheHits: fromCache ? prev.cacheHits + 1 : prev.cacheHits
        }));
    };

    const trackError = (error) => {
        setMetrics(prev => ({
            ...prev,
            errors: prev.errors + 1
        }));
    };

    // Expose tracking functions globally for other components
    useEffect(() => {
        window.analyticsTracker = {
            trackApiCall,
            trackError
        };
        
        return () => {
            delete window.analyticsTracker;
        };
    }, []);

    const formatTime = (ms) => {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const getCacheHitRate = () => {
        if (metrics.apiCalls === 0) return 0;
        return ((metrics.cacheHits / metrics.apiCalls) * 100).toFixed(1);
    };

    const getPerformanceStatus = () => {
        if (metrics.loadTime < 2000) return 'excellent';
        if (metrics.loadTime < 5000) return 'good';
        if (metrics.loadTime < 10000) return 'fair';
        return 'poor';
    };

    return (
        <div className="performance-monitor">
            <div className="performance-header">
                <h4>Performance Metrics </h4>
                <div className={`performance-status ${getPerformanceStatus()}`}>
                    {getPerformanceStatus().toUpperCase()}
                </div>
            </div>
            
            <div className="performance-metrics">
                <div className="performance-metric">
                    <span className="metric-label">Load Time:</span>
                    <span className="metric-value">{formatTime(metrics.loadTime)}</span>
                </div>
                <div className="performance-metric">
                    <span className="metric-label">API Calls:</span>
                    <span className="metric-value">{metrics.apiCalls}</span>
                </div>
                <div className="performance-metric">
                    <span className="metric-label">Cache Hit Rate:</span>
                    <span className="metric-value">{getCacheHitRate()}%</span>
                </div>
                <div className="performance-metric">
                    <span className="metric-label">Errors:</span>
                    <span className={`metric-value ${metrics.errors > 0 ? 'error' : ''}`}>
                        {metrics.errors}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceMonitor;
