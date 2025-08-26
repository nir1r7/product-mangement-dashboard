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

// Cost calculation based on category and price
const calculateCostByCategory = (category, price) => {
    const costRatios = {
        'Electronics': 0.65,      // 35% margin
        'Clothing': 0.50,         // 50% margin  
        'Books': 0.40,            // 60% margin
        'Home': 0.60,             // 40% margin
        'Sports': 0.50,           // 50% margin
        'Beauty': 0.45,           // 55% margin
        'Toys': 0.55,             // 45% margin
        'default': 0.60           // 40% margin for unknown categories
    };
    
    const ratio = costRatios[category] || costRatios['default'];
    return price * ratio;
};

const updateProductCosts = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Updating product costs...\n');
        
        // Find all products without cost or with cost = 0
        const productsToUpdate = await Product.find({
            $or: [
                { cost: { $exists: false } },
                { cost: 0 },
                { cost: null }
            ]
        });
        
        console.log(`📦 Found ${productsToUpdate.length} products to update`);
        
        if (productsToUpdate.length === 0) {
            console.log('✅ All products already have cost data!');
            return;
        }
        
        let updatedCount = 0;
        
        for (const product of productsToUpdate) {
            const calculatedCost = calculateCostByCategory(product.category, product.price);
            
            // Add some randomness to make it more realistic (±10%)
            const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
            const finalCost = Math.round(calculatedCost * randomFactor * 100) / 100;
            
            await Product.findByIdAndUpdate(product._id, {
                cost: finalCost
            });
            
            const margin = ((product.price - finalCost) / product.price * 100).toFixed(1);
            
            console.log(`✅ ${product.name}`);
            console.log(`   Price: $${product.price.toFixed(2)} | Cost: $${finalCost.toFixed(2)} | Margin: ${margin}%`);
            
            updatedCount++;
        }
        
        console.log(`\n🎉 Successfully updated ${updatedCount} products with cost data!`);
        
        // Show summary by category
        console.log('\n📊 Cost Summary by Category:');
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    avgCost: { $avg: '$cost' },
                    avgMargin: {
                        $avg: {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ['$price', '$cost'] },
                                        '$price'
                                    ]
                                },
                                100
                            ]
                        }
                    }
                }
            }
        ]);
        
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} products, Avg Margin: ${cat.avgMargin.toFixed(1)}%`);
        });
        
    } catch (error) {
        console.error('❌ Error updating product costs:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

updateProductCosts();
