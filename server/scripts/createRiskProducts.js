const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Order = require('../models/Order');
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

const createRiskProducts = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Creating inventory risk test products...\n');
        
        // Create products with different risk levels
        const riskProducts = [
            // Critical Risk - Very low stock
            {
                name: 'Critical Stock Item - Phone Case',
                description: 'Phone case with critically low stock',
                price: 29.99,
                cost: 15.00,
                category: 'Electronics',
                stock: 2, // Critical: ≤ 5 units
                images: ['https://via.placeholder.com/300x300?text=Phone+Case']
            },
            {
                name: 'Critical Stock Item - Wireless Earbuds',
                description: 'Wireless earbuds with very low inventory',
                price: 89.99,
                cost: 45.00,
                category: 'Electronics',
                stock: 1, // Critical: ≤ 5 units
                images: ['https://via.placeholder.com/300x300?text=Earbuds']
            },
            // Low Stock - Will run out soon based on sales
            {
                name: 'Popular T-Shirt - Low Stock',
                description: 'Best-selling t-shirt running low',
                price: 24.99,
                cost: 12.00,
                category: 'Clothing',
                stock: 15, // Will be low stock based on sales velocity
                images: ['https://via.placeholder.com/300x300?text=T-Shirt']
            },
            {
                name: 'Gaming Mouse - Fast Seller',
                description: 'Popular gaming mouse with declining stock',
                price: 59.99,
                cost: 30.00,
                category: 'Electronics',
                stock: 20, // Will be low stock based on sales velocity
                images: ['https://via.placeholder.com/300x300?text=Gaming+Mouse']
            },
            // Normal stock for comparison
            {
                name: 'Well Stocked Notebook',
                description: 'Notebook with healthy stock levels',
                price: 12.99,
                cost: 6.00,
                category: 'Books',
                stock: 100, // Good stock
                images: ['https://via.placeholder.com/300x300?text=Notebook']
            }
        ];
        
        const createdProducts = await Product.insertMany(riskProducts);
        console.log(`✅ Created ${createdProducts.length} test products`);
        
        // Create some recent orders for the "fast selling" products to trigger velocity-based risk
        const users = await User.find({ role: 'user' }).limit(5);
        if (users.length === 0) {
            console.log('⚠️ No users found, skipping order creation');
            return;
        }
        
        const fastSellingProducts = createdProducts.filter(p => 
            p.name.includes('T-Shirt') || p.name.includes('Gaming Mouse')
        );
        
        console.log('\n🛒 Creating orders to simulate high sales velocity...');
        
        const orders = [];
        const now = new Date();
        
        // Create orders over the last 14 days
        for (let day = 0; day < 14; day++) {
            const orderDate = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000));
            
            // Create 2-4 orders per day for fast-selling products
            const ordersPerDay = Math.floor(Math.random() * 3) + 2;
            
            for (let i = 0; i < ordersPerDay; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const product = fastSellingProducts[Math.floor(Math.random() * fastSellingProducts.length)];
                const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 units
                
                const subtotal = product.price * quantity;
                const shippingCost = 10;
                const taxAmount = subtotal * 0.08;
                const totalPrice = subtotal + shippingCost + taxAmount;
                
                orders.push({
                    user: user._id,
                    items: [{
                        product: product._id,
                        quantity: quantity
                    }],
                    subtotal: subtotal,
                    shippingCost: shippingCost,
                    taxAmount: taxAmount,
                    totalPrice: totalPrice,
                    status: 'Delivered', // Completed orders for velocity calculation
                    paymentStatus: 'Paid',
                    shippingAddress: {
                        fullName: user.name,
                        street: '123 Test St',
                        city: 'Toronto',
                        province: 'ON',
                        postalCode: 'M5V 3A8',
                        country: 'Canada'
                    },
                    createdAt: orderDate
                });
            }
        }
        
        if (orders.length > 0) {
            await Order.insertMany(orders);
            console.log(`✅ Created ${orders.length} orders to simulate sales velocity`);
        }
        
        console.log('\n📊 Inventory Risk Test Summary:');
        console.log('Critical Risk Products:');
        createdProducts.filter(p => p.stock <= 5).forEach(p => {
            console.log(`   - ${p.name}: ${p.stock} units`);
        });
        
        console.log('\nFast-Selling Products (should show as Low Stock):');
        fastSellingProducts.forEach(p => {
            console.log(`   - ${p.name}: ${p.stock} units with simulated high sales`);
        });
        
        console.log('\n🎯 Test the inventory risk analysis in Admin → Analytics!');
        console.log('Expected results:');
        console.log('   - Phone Case & Earbuds: Critical (≤5 units)');
        console.log('   - T-Shirt & Gaming Mouse: Low Stock (high sales velocity)');
        console.log('   - Notebook: Should not appear (good stock)');
        
    } catch (error) {
        console.error('❌ Error creating risk products:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

createRiskProducts();
