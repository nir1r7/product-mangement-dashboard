const express = require('express');
const router = express.Router();
const { signupUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { sendWelcomeEmail } = require('../services/emailService');

// POST /api/auth/signup
router.post('/signup', signupUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// Test email endpoint
router.post('/test-email', async (req, res) => {
    try {
        const { email, name } = req.body;
        console.log(`Testing email to: ${email} for user: ${name}`);

        const result = await sendWelcomeEmail(email, name || 'Test User');

        if (result.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully!',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Test email failed',
            error: error.message
        });
    }
});

module.exports = router;