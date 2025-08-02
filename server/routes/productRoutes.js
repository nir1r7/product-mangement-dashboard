const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getProducts, createProduct, updateProduct, deleteProduct} = require('../controllers/productController');

// setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// anyone can view products
router.get('/', getProducts);

// admin-only routes
router.post('/', protect, isAdmin, upload.single('image'), createProduct);
router.put('/:id', protect, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
