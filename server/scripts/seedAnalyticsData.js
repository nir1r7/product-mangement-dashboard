const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample data generators
const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'];
const productNames = {
    Electronics: ['Smartphone', 'Laptop', 'Headphones', 'Tablet', 'Smart Watch', 'Camera', 'Speaker'],
    Clothing: ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sneakers', 'Hoodie', 'Shorts'],
    Books: ['Fiction Novel', 'Cookbook', 'Biography', 'Self-Help', 'Textbook', 'Comic Book', 'Poetry'],
    Home: ['Coffee Maker', 'Lamp', 'Pillow', 'Candle', 'Plant Pot', 'Mirror', 'Rug'],
    Sports: ['Running Shoes', 'Yoga Mat', 'Dumbbells', 'Basketball', 'Tennis Racket', 'Bike Helmet', 'Water Bottle'],
    Beauty: ['Lipstick', 'Foundation', 'Perfume', 'Moisturizer', 'Shampoo', 'Nail Polish', 'Face Mask'],
    Toys: ['Action Figure', 'Board Game', 'Puzzle', 'Doll', 'Building Blocks', 'Remote Car', 'Stuffed Animal']
};

const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna', 'Mark', 'Jessica', 'Paul', 'Amy', 'Steve'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// Utility functions
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Generate random date within last 6 months
const randomDate = (daysAgo = 180) => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return new Date(pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime()));
};

// Create sample users
const createUsers = async (count = 50) => {
    console.log(`Creating ${count} sample users...`);
    const users = [];
    
    for (let i = 0; i < count; i++) {
        const firstName = randomChoice(firstNames);
        const lastName = randomChoice(lastNames);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
        
        const user = new User({
            name: `${firstName} ${lastName}`,
            email: email,
            password: await bcrypt.hash('password123', 10),
            role: 'user'
        });
        
        users.push(user);
    }
    
    await User.insertMany(users);
    console.log(`✅ Created ${count} users`);
    return users;
};

// Create sample products
const createProducts = async (count = 100) => {
    console.log(`Creating ${count} sample products...`);
    const products = [];
    
    for (let i = 0; i < count; i++) {
        const category = randomChoice(categories);
        const baseName = randomChoice(productNames[category]);
        const name = `${baseName} ${randomChoice(['Pro', 'Plus', 'Elite', 'Classic', 'Premium', 'Standard'])}`;
        
        const product = new Product({
            name: name,
            description: `High-quality ${baseName.toLowerCase()} perfect for everyday use. Features premium materials and excellent craftsmanship.`,
            price: randomFloat(10, 500),
            category: category,
            stock: randomInt(0, 100),
            images: [`https://via.placeholder.com/300x300?text=${encodeURIComponent(name)}`]
        });
        
        products.push(product);
    }
    
    await Product.insertMany(products);
    console.log(`✅ Created ${count} products`);
    return products;
};

// Create sample orders
const createOrders = async (users, products, count = 500) => {
    console.log(`Creating ${count} sample orders...`);
    const orders = [];
    const orderStatuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
    const statusWeights = [0.1, 0.3, 0.25, 0.3, 0.05]; // Most orders are paid/shipped/delivered
    
    for (let i = 0; i < count; i++) {
        const user = randomChoice(users);
        const orderDate = randomDate(180); // Last 6 months
        
        // Determine order status based on age (older orders more likely to be delivered)
        const daysSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
        let status;
        if (daysSinceOrder > 30) {
            status = randomChoice(['Delivered', 'Delivered', 'Delivered', 'Cancelled']);
        } else if (daysSinceOrder > 7) {
            status = randomChoice(['Shipped', 'Delivered', 'Delivered']);
        } else if (daysSinceOrder > 2) {
            status = randomChoice(['Paid', 'Shipped']);
        } else {
            status = randomChoice(['Pending', 'Paid']);
        }
        
        // Create order items (1-5 items per order)
        const itemCount = randomInt(1, 5);
        const items = [];
        let subtotal = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = randomChoice(products);
            const quantity = randomInt(1, 3);
            const price = product.price;

            items.push({
                product: product._id,
                quantity: quantity
            });

            subtotal += price * quantity;
        }

        const shippingCost = randomFloat(0, 15);
        const taxAmount = subtotal * 0.08; // 8% tax
        const totalPrice = subtotal + shippingCost + taxAmount;
        
        const firstName = randomChoice(firstNames);
        const lastName = randomChoice(lastNames);

        const order = new Order({
            user: user._id,
            items: items,
            subtotal: subtotal,
            shippingCost: shippingCost,
            taxAmount: taxAmount,
            totalPrice: totalPrice,
            status: status,
            paymentStatus: status === 'Pending' ? 'Pending' : 'Paid',
            shippingAddress: {
                fullName: `${firstName} ${lastName}`,
                street: `${randomInt(100, 9999)} ${randomChoice(['Main', 'Oak', 'Pine', 'Elm', 'Maple'])} St`,
                city: randomChoice(['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton']),
                province: randomChoice(['ON', 'BC', 'QC', 'AB', 'MB', 'SK']),
                postalCode: `${randomChoice(['K', 'M', 'N', 'P', 'R', 'S', 'T', 'V'])}${randomInt(1, 9)}${randomChoice(['A', 'B', 'C', 'E', 'G', 'H'])} ${randomInt(1, 9)}${randomChoice(['A', 'B', 'C', 'E', 'G', 'H'])}${randomInt(1, 9)}`,
                country: 'Canada'
            },
            createdAt: orderDate
        });
        
        // Note: The Order model doesn't have shippedAt/deliveredAt fields
        // Status progression is handled by the status field
        
        orders.push(order);
    }
    
    await Order.insertMany(orders);
    console.log(`✅ Created ${count} orders`);
    return orders;
};

// Main seeding function
const seedDatabase = async () => {
    try {
        await connectDB();
        
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('Clearing existing sample data...');
        await User.deleteMany({ email: { $regex: /@example\.com$/ } });
        await Product.deleteMany({});
        await Order.deleteMany({});
        
        // Create sample data
        const users = await createUsers(50);
        const products = await createProducts(100);
        const orders = await createOrders(users, products, 500);
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`📊 Analytics data summary:`);
        console.log(`   - ${users.length} sample users`);
        console.log(`   - ${products.length} products across ${categories.length} categories`);
        console.log(`   - ${orders.length} orders over the last 6 months`);
        console.log(`   - Revenue data spanning multiple months for trend analysis`);
        console.log(`   - Customer cohorts for retention analysis`);
        console.log(`   - Inventory levels for risk analysis`);
        
        console.log('\n✅ Your analytics dashboard should now show rich data!');
        console.log('🔗 Navigate to Admin → Analytics to see the results');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run the seeding
seedDatabase();
