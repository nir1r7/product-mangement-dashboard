const nodemailer = require('nodemailer');

// Create Gmail transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'nir1r7@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD || 'your-gmail-app-password'
        }
    });
};

// Welcome email template
const getWelcomeEmailTemplate = (userName) => {
    return {
        subject: 'Welcome to Our Store!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0066cc;">Welcome to Our Store, ${userName}!</h2>
                <p>Thank you for joining our community. We're excited to have you on board!</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse our extensive product catalog</li>
                    <li>Add items to your cart and checkout securely</li>
                    <li>Track your orders and view order history</li>
                    <li>Enjoy fast shipping across Canada</li>
                </ul>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Happy shopping!</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This email was sent from Our Store. Please do not reply to this email.</p>
            </div>
        `
    };
};

// Order confirmation email template
const getOrderConfirmationTemplate = (order, user) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.product?.price || 0).toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${((item.product?.price || 0) * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return {
        subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0066cc;">Order Confirmation</h2>
                <p>Hi ${user.name},</p>
                <p>Thank you for your order! We've received your order and it's being processed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                </div>

                <h3>Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="text-align: right; margin: 20px 0;">
                    <p><strong>Subtotal: $${(order.subtotal || order.totalPrice || 0).toFixed(2)}</strong></p>
                    <p><strong>Shipping: $${(order.shippingCost || 0).toFixed(2)}</strong></p>
                    <p><strong>Tax: $${(order.taxAmount || 0).toFixed(2)}</strong></p>
                    <hr>
                    <h3>Total: $${(order.totalPrice || 0).toFixed(2)}</h3>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Shipping Address</h3>
                    <p>${order.shippingAddress.fullName}<br>
                    ${order.shippingAddress.street}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}</p>
                </div>

                <p>We'll send you another email when your order ships.</p>
                <p>Thank you for shopping with us!</p>
                
                <hr>
                <p style="color: #666; font-size: 12px;">This email was sent from Our Store. Please do not reply to this email.</p>
            </div>
        `
    };
};

// Order status update email template
const getOrderStatusUpdateTemplate = (order, user, newStatus) => {
    const statusMessages = {
        'Paid': 'Your payment has been confirmed and your order is being prepared.',
        'Shipped': 'Great news! Your order has been shipped and is on its way to you.',
        'Delivered': 'Your order has been delivered! We hope you enjoy your purchase.',
        'Cancelled': 'Your order has been cancelled. If you have any questions, please contact our support team.'
    };

    return {
        subject: `Order Update - #${order._id.toString().slice(-8)} - ${newStatus}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0066cc;">Order Status Update</h2>
                <p>Hi ${user.name},</p>
                <p>Your order status has been updated to: <strong>${newStatus}</strong></p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
                    <p><strong>Status:</strong> ${newStatus}</p>
                    <p><strong>Total:</strong> $${(order.totalPrice || 0).toFixed(2)}</p>
                </div>

                <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
                
                ${newStatus === 'Shipped' ? `
                    <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <p><strong>Shipping Information:</strong></p>
                        <p>Your order is on its way to:</p>
                        <p>${order.shippingAddress.fullName}<br>
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}</p>
                    </div>
                ` : ''}
                
                <p>Thank you for shopping with us!</p>
                
                <hr>
                <p style="color: #666; font-size: 12px;">This email was sent from Our Store. Please do not reply to this email.</p>
            </div>
        `
    };
};

// Send email function using Gmail
const sendEmail = async (to, template) => {
    try {
        console.log('\n=== SENDING EMAIL ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${template.subject}`);
        console.log('====================\n');

        // Check if we have Gmail app password
        if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'your-gmail-app-password') {
            console.log('📧 DEMO MODE - Gmail App Password not configured');
            console.log(`From: ShopHub <nir1r7@gmail.com>`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${template.subject}`);
            console.log('HTML Content Preview:', template.html.substring(0, 200) + '...');
            console.log('\n✅ Email demo completed successfully!');
            console.log('\n📝 To send real emails:');
            console.log('1. Enable 2-Factor Authentication on Gmail');
            console.log('2. Generate App Password: https://support.google.com/accounts/answer/185833');
            console.log('3. Add GMAIL_APP_PASSWORD=your_app_password to .env file');
            console.log('4. Restart the server\n');

            return {
                success: true,
                messageId: 'demo-' + Date.now(),
                mode: 'demo'
            };
        }

        // Send real email using Gmail
        const transporter = createTransporter();

        const mailOptions = {
            from: '"ShopHub" <nir1r7@gmail.com>',
            to: to,
            subject: template.subject,
            html: template.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Real email sent successfully via Gmail!');
        console.log('Message ID:', result.messageId);

        return {
            success: true,
            messageId: result.messageId,
            mode: 'real'
        };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);

        // Fallback to demo mode
        console.log('\n📧 Falling back to DEMO MODE');
        console.log(`To: ${to}`);
        console.log(`Subject: ${template.subject}`);
        console.log('✅ Email demo completed as fallback!');

        return {
            success: true,
            messageId: 'demo-fallback-' + Date.now(),
            mode: 'demo-fallback',
            originalError: error.message
        };
    }
};

// Export functions
module.exports = {
    sendWelcomeEmail: async (userEmail, userName) => {
        const template = getWelcomeEmailTemplate(userName);
        return await sendEmail(userEmail, template);
    },
    
    sendOrderConfirmationEmail: async (userEmail, order, user) => {
        const template = getOrderConfirmationTemplate(order, user);
        return await sendEmail(userEmail, template);
    },
    
    sendOrderStatusUpdateEmail: async (userEmail, order, user, newStatus) => {
        const template = getOrderStatusUpdateTemplate(order, user, newStatus);
        return await sendEmail(userEmail, template);
    }
};
