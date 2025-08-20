const Product = require('../models/Product');

// public access
// GET /api/products?search=&category=&minPrice=&maxPrice=&page=&limit=&sortBy=&sortOrder=
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (
            (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) ||
            (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice))
        ) {
            query.price = {};
            if (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice)) {
                query.price.$lte = Number(maxPrice);
            }
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Error in getProducts:', err);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

// admin access only
// POST /api/products
const createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;
        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const product = new Product({
            name,
            price,
            description,
            category,
            stock,
            images
        });

        const saved = await product.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: 'Error creating product', error: err.message });
    }
};

// admin access only
// PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, images } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.name = name ?? product.name;
        product.price = price ?? product.price;
        product.description = description ?? product.description;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;

        if (images !== undefined) {
            try {
                const imagesArray = typeof images === 'string' ? JSON.parse(images) : images;
                product.images = imagesArray;
            } catch (err) {
                product.images = images;
            }
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => `/uploads/${f.filename}`);
            product.images = [...product.images, ...newImages];
        }

        const updated = await product.save();
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: 'Error updating product', error: err.message });
    }
};

// admin access only
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};

// public access
// GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const prod = await Product.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Product not found' });
        res.json(prod);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching product' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};