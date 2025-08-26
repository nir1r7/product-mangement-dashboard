import React, { useState, useEffect } from 'react';
import './AdminAnalytics.css';
import SideNavigation from '../../components/analytics/SideNavigation';
import KPIGrid from '../../components/analytics/KPIGrid';
import RevenueChart from '../../components/analytics/RevenueChart';
import ProductsTable from '../../components/analytics/ProductsTable';
import CategoryChart from '../../components/analytics/CategoryChart';
import InventoryRiskTable from '../../components/analytics/InventoryRiskTable';
import CohortHeatmap from '../../components/analytics/CohortHeatmap';
import CustomerSegments from '../../components/analytics/CustomerSegments';
import PerformanceMonitor from '../../components/analytics/PerformanceMonitor';
import DataQualityIndicator from '../../components/analytics/DataQualityIndicator';
import InsightsPanel from '../../components/analytics/InsightsPanel';
import FiltersPanel from '../../components/analytics/FiltersPanel';
import ExportTools from '../../components/analytics/ExportTools';

const AdminAnalytics = () => {
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({
        category: '',
        interval: 'day'
    });
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [productsData, setProductsData] = useState(null);
    const [categoriesData, setCategoriesData] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [cohortData, setCohortData] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [sideNavOpen, setSideNavOpen] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            fetchAnalyticsData();
        }
    }, [dateRange, filters, token]);

    // Auto-refresh functionality
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchAnalyticsData();
                setLastRefresh(new Date());
            }, 30000); // Refresh every 30 seconds
            setRefreshInterval(interval);
            return () => clearInterval(interval);
        } else if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
    }, [autoRefresh]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchKPIData(),
                fetchTrendsData(),
                fetchProductsData(),
                fetchCategoriesData(),
                fetchInventoryData(),
                fetchCohortData(),
                fetchCustomerData()
            ]);
            setLastRefresh(new Date());
        } catch (error) {
            // Error fetching analytics data
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefresh = () => {
        fetchAnalyticsData();
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    const fetchKPIData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/overview?from=${dateRange.from}&to=${dateRange.to}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setKpiData(data);
            }
        } catch (error) {
            console.error('Error fetching KPI data:', error);
        }
    };

    const fetchTrendsData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/trends?from=${dateRange.from}&to=${dateRange.to}&interval=${filters.interval}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setTrendsData(data);
            }
        } catch (error) {
            console.error('Error fetching trends data:', error);
        }
    };

    const fetchProductsData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/products?from=${dateRange.from}&to=${dateRange.to}&limit=20`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setProductsData(data);
            }
        } catch (error) {
            console.error('Error fetching products data:', error);
        }
    };

    const fetchCategoriesData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/categories?from=${dateRange.from}&to=${dateRange.to}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setCategoriesData(data);
            }
        } catch (error) {
            console.error('Error fetching categories data:', error);
        }
    };

    const fetchInventoryData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/inventory-risk?threshold=5&safetyDays=14`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setInventoryData(data);
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        }
    };

    const fetchCohortData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/cohorts?from=${dateRange.from}&to=${dateRange.to}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setCohortData(data);
            }
        } catch (error) {
            console.error('Error fetching cohort data:', error);
        }
    };

    const fetchCustomerData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/analytics/customer-segments?from=${dateRange.from}&to=${dateRange.to}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setCustomerData(data);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
    };

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleExport = async (type, component) => {
        try {
            let data;
            let filename;
            
            switch (component) {
                case 'kpis':
                    data = kpiData;
                    filename = `analytics-kpis-${dateRange.from}-to-${dateRange.to}`;
                    break;
                case 'trends':
                    data = trendsData;
                    filename = `analytics-trends-${dateRange.from}-to-${dateRange.to}`;
                    break;
                case 'products':
                    data = productsData;
                    filename = `analytics-products-${dateRange.from}-to-${dateRange.to}`;
                    break;
                default:
                    return;
            }
            
            if (type === 'csv') {
                exportToCSV(data, filename);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const exportToCSV = (data, filename) => {
        let csvContent = '';
        
        if (data.kpis) {
            // Export KPIs
            csvContent = 'Metric,Value,Change %\n';
            Object.entries(data.kpis).forEach(([key, value]) => {
                csvContent += `${key},${value.value},${value.deltaPct}\n`;
            });
        } else if (data.trends) {
            // Export trends
            csvContent = 'Date,Revenue,Orders,Units\n';
            data.trends.forEach(trend => {
                csvContent += `${trend._id},${trend.revenue},${trend.orders},${trend.units}\n`;
            });
        } else if (data.products) {
            // Export products
            csvContent = 'Product,Category,Revenue,Units,Orders,AOV\n';
            data.products.forEach(product => {
                csvContent += `${product.name},${product.category},${product.revenue},${product.units},${product.orders},${product.avgOrderValue}\n`;
            });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading && !kpiData) {
        return (
            <div className="admin-analytics loading">
                <div className="loading-spinner">Loading analytics...</div>
            </div>
        );
    }

    return (
        <>
            <SideNavigation
                isOpen={sideNavOpen}
                onToggle={() => setSideNavOpen(!sideNavOpen)}
            />
            <div className={`admin-analytics ${sideNavOpen ? 'nav-open' : ''}`}>
            <div className="analytics-header">
                <div className="header-left">
                    <h1>Analytics Dashboard</h1>
                    <div className="refresh-info">
                        <small>Last updated: {lastRefresh.toLocaleTimeString()}</small>
                    </div>
                </div>
                <div className="header-controls">
                    <div className="refresh-controls">
                        <button
                            className="btn btn-secondary"
                            onClick={handleManualRefresh}
                            disabled={loading}
                        >
                            🔄 Refresh
                        </button>
                        <label className="auto-refresh-toggle">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={toggleAutoRefresh}
                            />
                            Auto-refresh (30s)
                        </label>
                    </div>
                    {/* <PerformanceMonitor /> */}
                    <ExportTools onExport={handleExport} />
                </div>
            </div>
            
            <div id="filters" className="analytics-section">
                <FiltersPanel
                    dateRange={dateRange}
                    filters={filters}
                    onDateRangeChange={handleDateRangeChange}
                    onFiltersChange={handleFiltersChange}
                />
            </div>

            <div className="analytics-content">
                <div id="kpis" className="analytics-row analytics-section">
                    <KPIGrid data={kpiData} loading={loading} />
                    <DataQualityIndicator data={kpiData} />
                </div>

                <div id="trends" className="analytics-row analytics-section">
                    <RevenueChart data={trendsData} loading={loading} />
                </div>

                <div id="products" className="analytics-row analytics-section">
                    <ProductsTable data={productsData} loading={loading} />
                </div>

                <div id="categories" className="analytics-row analytics-section">
                    <CategoryChart data={categoriesData} loading={loading} />
                </div>

                <div id="inventory" className="analytics-row analytics-section">
                    <InventoryRiskTable data={inventoryData} loading={loading} />
                </div>

                <div id="cohort" className="analytics-row analytics-section">
                    <CohortHeatmap data={cohortData} loading={loading} />
                </div>

                <div id="segments" className="analytics-row analytics-section">
                    <CustomerSegments data={customerData} loading={loading} />
                </div>

                <div id="insights" className="analytics-row analytics-section">
                    <InsightsPanel
                        kpiData={kpiData}
                        trendsData={trendsData}
                        productsData={productsData}
                        categoriesData={categoriesData}
                    />
                </div>

                <div id="performance" className="analytics-row analytics-section">
                    <PerformanceMonitor />
                </div>
            </div>
        </div>
        </>
    );
};

export default AdminAnalytics;
