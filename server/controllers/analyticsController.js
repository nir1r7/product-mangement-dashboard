const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint, params) => {
    return `${endpoint}_${JSON.stringify(params)}`;
};

const getFromCache = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

const setCache = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

// GET /api/analytics/overview
const getOverview = async (req, res) => {
    try {
        const { from, to, compareFrom, compareTo } = req.query;

        // Check cache first
        const cacheKey = getCacheKey('overview', { from, to, compareFrom, compareTo });
        const cached = getFromCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Parse dates properly to avoid timezone issues
        let fromDate, toDate;

        if (from) {
            fromDate = new Date(from + 'T00:00:00.000Z');
        } else {
            fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        if (to) {
            // For end date, include the entire day by setting to end of day
            toDate = new Date(to + 'T23:59:59.999Z');
        } else {
            toDate = new Date();
        }
        
        // Current period metrics
        const currentMetrics = await calculateMetrics(fromDate, toDate);
        
        // Compare period metrics (if provided)
        let compareMetrics = null;
        if (compareFrom && compareTo) {
            const compareFromDate = new Date(compareFrom);
            const compareToDate = new Date(compareTo);
            compareMetrics = await calculateMetrics(compareFromDate, compareToDate);
        }
        
        // Calculate deltas
        const kpis = calculateKPIsWithDeltas(currentMetrics, compareMetrics);

        const result = {
            range: { from: fromDate, to: toDate },
            kpis,
            compareRange: compareMetrics ? { from: compareFrom, to: compareTo } : null
        };

        // Cache the result
        setCache(cacheKey, result);

        res.json(result);
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
    try {
        const { from, to, interval = 'day' } = req.query;
        
        const fromDate = new Date(from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const toDate = new Date(to || new Date());
        
        let groupBy;
        switch (interval) {
            case 'week':
                groupBy = { $dateToString: { format: "%Y-%U", date: "$createdAt" } };
                break;
            case 'month':
                groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                break;
            default:
                groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        }
        
        const trends = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate },
                    status: { $in: ['Paid', 'Shipped', 'Delivered'] }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 },
                    units: { $sum: { $sum: '$items.quantity' } }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.json({ interval, trends });
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ message: 'Error fetching trends data' });
    }
};

// GET /api/analytics/products
const getTopProducts = async (req, res) => {
    try {
        const { from, to, limit = 50, metric = 'revenue' } = req.query;
        
        const fromDate = new Date(from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const toDate = new Date(to || new Date());
        
        const sortField = metric === 'units' ? 'units' : 'revenue';
        
        const topProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate },
                    status: { $in: ['Paid', 'Shipped', 'Delivered'] }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$items.product',
                    revenue: { $sum: { $multiply: ['$productInfo.price', '$items.quantity'] } },
                    units: { $sum: '$items.quantity' },
                    orders: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    productId: '$_id',
                    name: '$product.name',
                    category: '$product.category',
                    revenue: 1,
                    units: 1,
                    orders: 1,
                    avgOrderValue: { $divide: ['$revenue', '$orders'] }
                }
            },
            { $sort: { [sortField]: -1 } },
            { $limit: parseInt(limit) }
        ]);
        
        res.json({ metric, products: topProducts });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: 'Error fetching products data' });
    }
};

// Helper function to calculate metrics for a date range
const calculateMetrics = async (fromDate, toDate) => {
    const orders = await Order.find({
        createdAt: { $gte: fromDate, $lte: toDate },
        status: { $in: ['Paid', 'Shipped', 'Delivered'] }
    }).populate('items.product');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const totalUnits = orders.reduce((sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const uniqueCustomers = new Set(orders.map(order => order.user.toString())).size;

    // Calculate actual gross margin based on product costs
    let totalCost = 0;
    let totalRevenueForMargin = 0;

    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.product && item.product.cost > 0) {
                const itemCost = item.product.cost * item.quantity;
                const itemRevenue = item.product.price * item.quantity;
                totalCost += itemCost;
                totalRevenueForMargin += itemRevenue;
            }
        });
    });

    const grossMarginPct = totalRevenueForMargin > 0
        ? ((totalRevenueForMargin - totalCost) / totalRevenueForMargin) * 100
        : 0;

    // Calculate refund rate (simplified - assuming cancelled orders are refunds)
    const cancelledOrders = await Order.countDocuments({
        createdAt: { $gte: fromDate, $lte: toDate },
        status: 'Cancelled'
    });

    const refundRate = totalOrders > 0 ? (cancelledOrders / (totalOrders + cancelledOrders)) * 100 : 0;

    return {
        grossRevenue: totalRevenue,
        orders: totalOrders,
        aov: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        units: totalUnits,
        activeCustomers: uniqueCustomers,
        refundRate,
        conversionRate: 2.5, // Placeholder - would need session tracking
        grossMarginPct: grossMarginPct
    };
};

// Helper function to calculate KPIs with deltas
const calculateKPIsWithDeltas = (current, compare) => {
    const calculateDelta = (currentVal, compareVal) => {
        if (!compareVal || compareVal === 0) return 0;
        return ((currentVal - compareVal) / compareVal) * 100;
    };
    
    return {
        grossRevenue: {
            value: current.grossRevenue,
            deltaPct: compare ? calculateDelta(current.grossRevenue, compare.grossRevenue) : 0
        },
        orders: {
            value: current.orders,
            deltaPct: compare ? calculateDelta(current.orders, compare.orders) : 0
        },
        aov: {
            value: current.aov,
            deltaPct: compare ? calculateDelta(current.aov, compare.aov) : 0
        },
        units: {
            value: current.units,
            deltaPct: compare ? calculateDelta(current.units, compare.units) : 0
        },
        conversionRate: {
            value: current.conversionRate,
            deltaPct: compare ? calculateDelta(current.conversionRate, compare.conversionRate) : 0
        },
        refundRate: {
            value: current.refundRate,
            deltaPct: compare ? calculateDelta(current.refundRate, compare.refundRate) : 0
        },
        grossMarginPct: {
            value: current.grossMarginPct,
            deltaPct: compare ? calculateDelta(current.grossMarginPct, compare.grossMarginPct) : 0
        },
        activeCustomers: {
            value: current.activeCustomers,
            deltaPct: compare ? calculateDelta(current.activeCustomers, compare.activeCustomers) : 0
        }
    };
};

// GET /api/analytics/categories
const getCategoryPerformance = async (req, res) => {
    try {
        const { from, to } = req.query;

        const fromDate = new Date(from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const toDate = new Date(to || new Date());

        const categoryPerformance = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate },
                    status: { $in: ['Paid', 'Shipped', 'Delivered'] }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    revenue: { $sum: { $multiply: ['$product.price', '$items.quantity'] } },
                    units: { $sum: '$items.quantity' },
                    orders: { $sum: 1 },
                    products: { $addToSet: '$items.product' }
                }
            },
            {
                $project: {
                    category: '$_id',
                    revenue: 1,
                    units: 1,
                    orders: 1,
                    productCount: { $size: '$products' },
                    avgOrderValue: { $divide: ['$revenue', '$orders'] }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json({ categories: categoryPerformance });
    } catch (error) {
        console.error('Error fetching category performance:', error);
        res.status(500).json({ message: 'Error fetching category data' });
    }
};

// GET /api/analytics/inventory-risk
const getInventoryRisk = async (req, res) => {
    try {
        const { threshold = 5, safetyDays = 14 } = req.query;

        // Get sales velocity for the last 14 days
        const fourteenDaysAgo = new Date(Date.now() - parseInt(safetyDays) * 24 * 60 * 60 * 1000);

        const salesVelocity = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: fourteenDaysAgo },
                    status: { $in: ['Paid', 'Shipped', 'Delivered'] }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' }
                }
            }
        ]);

        // Create a map for quick lookup
        const velocityMap = {};
        salesVelocity.forEach(item => {
            velocityMap[item._id.toString()] = item.totalSold;
        });

        // Get all products and calculate risk
        const products = await Product.find({});
        const riskProducts = [];

        products.forEach(product => {
            const sold = velocityMap[product._id.toString()] || 0;
            const dailyVelocity = sold / parseInt(safetyDays);

            // Simplified risk assessment without replenishment data
            let riskLevel = 'Normal';
            let riskReason = '';

            // Critical: Very low stock regardless of sales
            if (product.stock <= parseInt(threshold)) {
                riskLevel = 'Critical';
                riskReason = `Only ${product.stock} units remaining`;
            }
            // Low Stock: Based on recent sales pattern
            else if (dailyVelocity > 0) {
                const daysOfCover = product.stock / dailyVelocity;
                if (daysOfCover <= 7) {
                    riskLevel = 'Critical';
                    riskReason = `Will run out in ${daysOfCover.toFixed(1)} days at current sales rate`;
                } else if (daysOfCover <= parseInt(safetyDays)) {
                    riskLevel = 'Low Stock';
                    riskReason = `Will run out in ${daysOfCover.toFixed(1)} days at current sales rate`;
                }
            }
            // No recent sales but very low stock
            else if (product.stock <= parseInt(threshold) * 2) {
                riskLevel = 'Low Stock';
                riskReason = `Low stock with no recent sales data`;
            }

            // Only include products that have some risk
            if (riskLevel !== 'Normal') {
                riskProducts.push({
                    productId: product._id,
                    name: product.name,
                    category: product.category,
                    currentStock: product.stock,
                    dailyVelocity: dailyVelocity.toFixed(2),
                    daysOfCover: dailyVelocity > 0 ? (product.stock / dailyVelocity).toFixed(1) : 'No recent sales',
                    riskLevel: riskLevel,
                    riskReason: riskReason
                });
            }
        });

        // Sort by risk level and days of cover
        riskProducts.sort((a, b) => {
            if (a.riskLevel === 'Critical' && b.riskLevel !== 'Critical') return -1;
            if (b.riskLevel === 'Critical' && a.riskLevel !== 'Critical') return 1;

            const aDays = parseFloat(a.daysOfCover) || 999;
            const bDays = parseFloat(b.daysOfCover) || 999;
            return aDays - bDays;
        });

        res.json({
            riskProducts,
            summary: {
                totalAtRisk: riskProducts.length,
                critical: riskProducts.filter(p => p.riskLevel === 'Critical').length,
                lowStock: riskProducts.filter(p => p.riskLevel === 'Low Stock').length
            }
        });
    } catch (error) {
        console.error('Error fetching inventory risk:', error);
        res.status(500).json({ message: 'Error fetching inventory risk data' });
    }
};

// GET /api/analytics/cohorts
const getCohortAnalysis = async (req, res) => {
    try {
        const { from, to } = req.query;

        const fromDate = new Date(from || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)); // 6 months
        const toDate = new Date(to || new Date());

        // Get all orders for cohort analysis
        const orders = await Order.find({
            createdAt: { $gte: fromDate, $lte: toDate },
            status: { $in: ['Paid', 'Shipped', 'Delivered'] }
        }).sort({ createdAt: 1 });

        // Group orders by user and month
        const userFirstOrders = {};
        const userOrdersByMonth = {};

        orders.forEach(order => {
            const userId = order.user.toString();
            const orderMonth = new Date(order.createdAt.getFullYear(), order.createdAt.getMonth(), 1);
            const monthKey = orderMonth.toISOString().substring(0, 7); // YYYY-MM

            // Track first order month
            if (!userFirstOrders[userId]) {
                userFirstOrders[userId] = monthKey;
            }

            // Track orders by month
            if (!userOrdersByMonth[userId]) {
                userOrdersByMonth[userId] = new Set();
            }
            userOrdersByMonth[userId].add(monthKey);
        });

        // Build cohort matrix
        const cohortData = {};
        const allMonths = [...new Set(Object.values(userFirstOrders))].sort();

        allMonths.forEach(cohortMonth => {
            cohortData[cohortMonth] = { size: 0, retention: {} };

            // Count users in this cohort
            const cohortUsers = Object.keys(userFirstOrders).filter(
                userId => userFirstOrders[userId] === cohortMonth
            );
            cohortData[cohortMonth].size = cohortUsers.length;

            // Calculate retention for each subsequent month
            for (let i = 0; i < 12; i++) { // 12 months retention
                const targetDate = new Date(cohortMonth + '-01');
                targetDate.setMonth(targetDate.getMonth() + i);
                const targetMonth = targetDate.toISOString().substring(0, 7);

                const retainedUsers = cohortUsers.filter(userId =>
                    userOrdersByMonth[userId] && userOrdersByMonth[userId].has(targetMonth)
                ).length;

                cohortData[cohortMonth].retention[i] = {
                    month: i,
                    users: retainedUsers,
                    rate: cohortUsers.length > 0 ? (retainedUsers / cohortUsers.length) * 100 : 0
                };
            }
        });

        res.json({ cohorts: cohortData, months: allMonths });
    } catch (error) {
        console.error('Error fetching cohort analysis:', error);
        res.status(500).json({ message: 'Error fetching cohort data' });
    }
};

// GET /api/analytics/customer-segments
const getCustomerSegments = async (req, res) => {
    try {
        const { from, to } = req.query;

        const fromDate = new Date(from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)); // 1 year
        const toDate = new Date(to || new Date());

        // Calculate RFM metrics for each customer
        const customerMetrics = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate },
                    status: { $in: ['Paid', 'Shipped', 'Delivered'] }
                }
            },
            {
                $group: {
                    _id: '$user',
                    recency: { $max: '$createdAt' },
                    frequency: { $sum: 1 },
                    monetary: { $sum: '$totalPrice' },
                    firstOrder: { $min: '$createdAt' },
                    lastOrder: { $max: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    name: '$user.name',
                    email: '$user.email',
                    recencyDays: {
                        $divide: [
                            { $subtract: [new Date(), '$recency'] },
                            1000 * 60 * 60 * 24
                        ]
                    },
                    frequency: 1,
                    monetary: 1,
                    firstOrder: 1,
                    lastOrder: 1
                }
            }
        ]);

        // Calculate RFM scores and segments
        const customers = customerMetrics.map(customer => {
            // RFM scoring (1-5 scale)
            const recencyScore = customer.recencyDays <= 30 ? 5 :
                                customer.recencyDays <= 60 ? 4 :
                                customer.recencyDays <= 90 ? 3 :
                                customer.recencyDays <= 180 ? 2 : 1;

            const frequencyScore = customer.frequency >= 10 ? 5 :
                                  customer.frequency >= 5 ? 4 :
                                  customer.frequency >= 3 ? 3 :
                                  customer.frequency >= 2 ? 2 : 1;

            const monetaryScore = customer.monetary >= 1000 ? 5 :
                                 customer.monetary >= 500 ? 4 :
                                 customer.monetary >= 200 ? 3 :
                                 customer.monetary >= 100 ? 2 : 1;

            // Determine segment based on RFM scores
            let segment = 'New Customer';
            if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
                segment = 'Champions';
            } else if (recencyScore >= 3 && frequencyScore >= 3 && monetaryScore >= 3) {
                segment = 'Loyal Customers';
            } else if (recencyScore >= 4 && frequencyScore <= 2) {
                segment = 'Potential Loyalists';
            } else if (recencyScore <= 2 && frequencyScore >= 3) {
                segment = 'At Risk';
            } else if (recencyScore <= 2 && frequencyScore <= 2 && monetaryScore >= 3) {
                segment = 'Cannot Lose Them';
            } else if (recencyScore <= 2 && frequencyScore <= 2) {
                segment = 'Lost Customers';
            }

            return {
                ...customer,
                recencyScore,
                frequencyScore,
                monetaryScore,
                segment,
                rfmScore: `${recencyScore}${frequencyScore}${monetaryScore}`
            };
        });

        // Group by segments
        const segments = {};
        customers.forEach(customer => {
            if (!segments[customer.segment]) {
                segments[customer.segment] = {
                    name: customer.segment,
                    count: 0,
                    totalValue: 0,
                    avgRecency: 0,
                    avgFrequency: 0,
                    avgMonetary: 0
                };
            }

            segments[customer.segment].count++;
            segments[customer.segment].totalValue += customer.monetary;
            segments[customer.segment].avgRecency += customer.recencyDays;
            segments[customer.segment].avgFrequency += customer.frequency;
            segments[customer.segment].avgMonetary += customer.monetary;
        });

        // Calculate averages
        Object.values(segments).forEach(segment => {
            segment.avgRecency = segment.avgRecency / segment.count;
            segment.avgFrequency = segment.avgFrequency / segment.count;
            segment.avgMonetary = segment.avgMonetary / segment.count;
        });

        res.json({
            customers: customers.slice(0, 100), // Limit for performance
            segments: Object.values(segments),
            totalCustomers: customers.length
        });
    } catch (error) {
        console.error('Error fetching customer segments:', error);
        res.status(500).json({ message: 'Error fetching customer segments data' });
    }
};

module.exports = {
    getOverview,
    getTrends,
    getTopProducts,
    getCategoryPerformance,
    getInventoryRisk,
    getCohortAnalysis,
    getCustomerSegments
};
