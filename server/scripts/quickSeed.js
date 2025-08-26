const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const quickSeed = async () => {
    try {
        await connectDB();
        
        console.log('🌱 Quick seeding sample data...');
        
        // Create admin user if it doesn't exist
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (!existingAdmin) {
            const bcrypt = require('bcryptjs');
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@example.com',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin'
            });
            await adminUser.save();
            console.log('✅ Created admin user');
        }

        // Create a few sample users
        console.log('Creating sample users...');
        const sampleUsers = await User.insertMany([
            {
                name: 'John Smith',
                email: 'john.smith@example.com',
                password: '$2a$10$example', // placeholder hash
                role: 'user'
            },
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: '$2a$10$example',
                role: 'user'
            },
            {
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                password: '$2a$10$example',
                role: 'user'
            }
        ]);
        console.log(`✅ Created ${sampleUsers.length} users`);
        
        // Create sample products with realistic costs
        console.log('Creating sample products...');
        const sampleProducts = await Product.insertMany([
            {
                name: 'Smartphone Pro',
                description: 'Latest smartphone with advanced features',
                price: 699.99,
                cost: 420.00, // 60% margin
                category: 'Electronics',
                stock: 50,
                images: ['https://via.placeholder.com/300x300?text=Smartphone']
            },
            {
                name: 'Laptop Elite',
                description: 'High-performance laptop for professionals',
                price: 1299.99,
                cost: 910.00, // 30% margin
                category: 'Electronics',
                stock: 25,
                images: ['https://via.placeholder.com/300x300?text=Laptop']
            },
            {
                name: 'Running Shoes',
                description: 'Comfortable running shoes for athletes',
                price: 129.99,
                cost: 65.00, // 50% margin
                category: 'Sports',
                stock: 100,
                images: ['https://via.placeholder.com/300x300?text=Shoes']
            },
            {
                name: 'Coffee Maker',
                description: 'Premium coffee maker for home use',
                price: 199.99,
                cost: 120.00, // 40% margin
                category: 'Home',
                stock: 30,
                images: ['https://via.placeholder.com/300x300?text=Coffee']
            },
            {
                name: 'Fiction Book',
                description: 'Bestselling fiction novel',
                price: 19.99,
                cost: 8.00, // 60% margin
                category: 'Books',
                stock: 200,
                images: ['https://via.placeholder.com/300x300?text=Book']
            }
        ]);
        console.log(`✅ Created ${sampleProducts.length} products`);
        
        // Create sample orders
        console.log('Creating sample orders...');
        const now = new Date();
        const sampleOrders = [];
        
        // Create orders for the last 3 months
        for (let i = 0; i < 20; i++) {
            const daysAgo = Math.floor(Math.random() * 90); // Random day in last 3 months
            const orderDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
            
            const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
            const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            
            const subtotal = product.price * quantity;
            const shippingCost = 10;
            const taxAmount = subtotal * 0.08;
            const totalPrice = subtotal + shippingCost + taxAmount;
            
            const statuses = ['Pending', 'Paid', 'Shipped', 'Delivered'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            sampleOrders.push({
                user: user._id,
                items: [{
                    product: product._id,
                    quantity: quantity
                }],
                subtotal: subtotal,
                shippingCost: shippingCost,
                taxAmount: taxAmount,
                totalPrice: totalPrice,
                status: status,
                paymentStatus: status === 'Pending' ? 'Pending' : 'Paid',
                shippingAddress: {
                    fullName: user.name,
                    street: '123 Main St',
                    city: 'Toronto',
                    province: 'ON',
                    postalCode: 'M5V 3A8',
                    country: 'Canada'
                },
                createdAt: orderDate
            });
        }
        
        await Order.insertMany(sampleOrders);
        console.log(`✅ Created ${sampleOrders.length} orders`);
        
        console.log('\n🎉 Quick seeding completed successfully!');
        console.log('📊 Your analytics dashboard should now show data!');
        
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

quickSeed();
