const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/cart
const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST /api/cart
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock === 0) {
            return res.status(400).json({ message: `${product.name} is out of stock` });
        }

        const user = await User.findById(req.user.id);

        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex !== -1) {
            const newQuantity = user.cart[cartItemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({ message: `Cannot add ${quantity} more. Only ${product.stock - user.cart[cartItemIndex].quantity} left in stock.` });
            }
            user.cart[cartItemIndex].quantity = newQuantity;
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `Cannot add ${quantity}. Only ${product.stock} in stock.` });
            }
            user.cart.push({ product: productId, quantity });
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json(updatedUser.cart);

    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(item => item.product.toString() !== productId);

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json(updatedUser.cart);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// DELETE /api/cart/clear
const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = [];
        await user.save();
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST /api/cart/bulk
const bulkUpdateCart = async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Invalid items array' });
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validItems = items.filter(item => item.productId && item.quantity);

        const productIds = validItems.map(item => {
            if (typeof item.productId === 'string') {
                return item.productId;
            } else if (typeof item.productId === 'object' && item.productId.product && item.productId.product._id) {
                return item.productId.product._id;
            } else {
                return null; 
            }
        }).filter(id => id);

        const existingProducts = await Product.find({ _id: { $in: productIds } });
        const validProductIds = existingProducts.map(p => p._id.toString());

        user.cart = validItems
            .filter(item => validProductIds.includes(item.productId))
            .map(item => ({
                product: item.productId,
                quantity: Math.max(1, parseInt(item.quantity))
            }));

        await user.save();

        const updatedUser = await User.findById(req.user.id).populate('cart.product');

        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// PATCH /api/cart/:productId
const updateCartItemQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }

    try {
        const user = await User.findById(req.user.id);
        const cartItem = user.cart.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await user.save();

        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    bulkUpdateCart,
    updateCartItemQuantity
};