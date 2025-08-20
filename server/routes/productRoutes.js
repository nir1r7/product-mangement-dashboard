const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct} = require('../controllers/productController');

// setup for image uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, isAdmin, upload.array('images', 5), createProduct); // 5 is an arbitrary limit for number of images
router.put('/:id', protect, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;