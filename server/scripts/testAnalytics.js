const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const testAnalytics = async () => {
    try {
        await connectDB();
        
        console.log('🔍 Testing Analytics Data...\n');
        
        // Check users
        const userCount = await User.countDocuments();
        console.log(`👥 Users in database: ${userCount}`);
        
        // Check products
        const productCount = await Product.countDocuments();
        console.log(`📦 Products in database: ${productCount}`);
        
        // Check orders
        const orderCount = await Order.countDocuments();
        console.log(`🛒 Orders in database: ${orderCount}`);
        
        if (orderCount > 0) {
            // Test basic analytics query
            const orders = await Order.find({
                status: { $in: ['Paid', 'Shipped', 'Delivered'] }
            }).populate('user').populate('items.product');
            
            console.log(`💰 Paid orders: ${orders.length}`);
            
            if (orders.length > 0) {
                const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
                console.log(`💵 Total revenue: $${totalRevenue.toFixed(2)}`);
                
                const totalUnits = orders.reduce((sum, order) => 
                    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
                );
                console.log(`📊 Total units sold: ${totalUnits}`);
                
                const avgOrderValue = totalRevenue / orders.length;
                console.log(`📈 Average order value: $${avgOrderValue.toFixed(2)}`);
                
                console.log('\n✅ Analytics data is available!');
                console.log('🎯 Your analytics dashboard should now show meaningful data.');
            } else {
                console.log('\n⚠️  No paid orders found. Analytics will show limited data.');
            }
        } else {
            console.log('\n❌ No orders found. Need to create sample data.');
            console.log('💡 Run: node scripts/quickSeed.js');
        }
        
        // Show sample order data
        if (orderCount > 0) {
            console.log('\n📋 Sample Order Data:');
            const sampleOrder = await Order.findOne().populate('user').populate('items.product');
            if (sampleOrder) {
                console.log(`   Order ID: ${sampleOrder._id}`);
                console.log(`   User: ${sampleOrder.user?.name || 'Unknown'}`);
                console.log(`   Total: $${sampleOrder.totalPrice}`);
                console.log(`   Status: ${sampleOrder.status}`);
                console.log(`   Items: ${sampleOrder.items.length}`);
                console.log(`   Date: ${sampleOrder.createdAt}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing analytics:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

testAnalytics();
