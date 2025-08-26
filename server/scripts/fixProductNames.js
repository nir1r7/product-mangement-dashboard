const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');

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

const fixProductNames = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Fixing product names...\n');
        
        // Update the test products to have normal names
        const updates = [
            {
                oldName: 'Critical Stock Item - Phone Case',
                newName: 'Premium Phone Case'
            },
            {
                oldName: 'Critical Stock Item - Wireless Earbuds',
                newName: 'Wireless Bluetooth Earbuds'
            },
            {
                oldName: 'Popular T-Shirt - Low Stock',
                newName: 'Cotton Graphic T-Shirt'
            },
            {
                oldName: 'Gaming Mouse - Fast Seller',
                newName: 'RGB Gaming Mouse'
            },
            {
                oldName: 'Well Stocked Notebook',
                newName: 'Spiral Notebook'
            }
        ];
        
        for (const update of updates) {
            const result = await Product.updateOne(
                { name: update.oldName },
                { $set: { name: update.newName } }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`✅ Updated: "${update.oldName}" → "${update.newName}"`);
            } else {
                console.log(`⚠️ Not found: "${update.oldName}"`);
            }
        }
        
        console.log('\n🎯 Product names have been normalized!');
        console.log('The products now have normal names without stock level indicators.');
        
    } catch (error) {
        console.error('❌ Error fixing product names:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

fixProductNames();
