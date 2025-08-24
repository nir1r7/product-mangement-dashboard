import React from 'react';
import './OrderReview.css';

const OrderReview = ({ 
    cartItems, 
    shippingData, 
    paymentData, 
    subtotal, 
    shippingCost, 
    taxAmount, 
    total, 
    onBack, 
    onPlaceOrder, 
    loading 
}) => {
    const formatCardNumber = (cardNumber) => {
        if (!cardNumber) return '';
        const lastFour = cardNumber.slice(-4);
        return `**** **** **** ${lastFour}`;
    };

    return (
        <div className="order-review-container">
            <h2>Order Review</h2>
            
            {/* Order Items */}
            <div className="review-section">
                <h3>Order Items</h3>
                <div className="order-items">
                    {cartItems.map((item) => {
                        const product = item.product || item;
                        const productId = product._id || item._id;
                        const price = product.price || 0;
                        const quantity = item.quantity || 1;
                        
                        return (
                            <div key={productId} className="order-item">
                                <div className="item-image">
                                    {product.images && product.images.length > 0 ? (
                                        <img 
                                            src={`http://localhost:5000${product.images[0]}`} 
                                            alt={product.name} 
                                        />
                                    ) : (
                                        <div className="no-image">No Image</div>
                                    )}
                                </div>
                                <div className="item-details">
                                    <h4>{product.name}</h4>
                                    <p className="item-description">{product.description}</p>
                                    <div className="item-pricing">
                                        <span className="quantity">Qty: {quantity}</span>
                                        <span className="price">${price.toFixed(2)} each</span>
                                        <span className="total">${(price * quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Shipping Information */}
            <div className="review-section">
                <h3>Shipping Information</h3>
                <div className="shipping-info">
                    <p><strong>Name:</strong> {shippingData.fullName}</p>
                    <p><strong>Address:</strong> {shippingData.address}</p>
                    <p><strong>City:</strong> {shippingData.city}</p>
                    <p><strong>Province:</strong> {shippingData.state}</p>
                    <p><strong>Postal Code:</strong> {shippingData.postalCode}</p>
                    <p><strong>Country:</strong> Canada</p>
                </div>
            </div>

            {/* Payment Information */}
            <div className="review-section">
                <h3>Payment Information</h3>
                <div className="payment-info">
                    <p><strong>Payment Method:</strong> {paymentData.method}</p>
                    {paymentData.method === 'Card' && (
                        <>
                            <p><strong>Cardholder Name:</strong> {paymentData.cardHolderName}</p>
                            <p><strong>Card Number:</strong> {formatCardNumber(paymentData.cardNumber)}</p>
                        </>
                    )}
                    {paymentData.method === 'PayPal' && (
                        <p><strong>PayPal Account:</strong> Connected</p>
                    )}
                    {paymentData.method === 'COD' && (
                        <p><strong>Payment:</strong> Cash on Delivery</p>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="review-section order-summary">
                <h3>Order Summary</h3>
                <div className="summary-line">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                    <span>Shipping:</span>
                    <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                    <span>Tax (HST):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-line total-line">
                    <span><strong>Total:</strong></span>
                    <span><strong>${total.toFixed(2)}</strong></span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="review-actions">
                <button type="button" onClick={onBack} className="btn btn-secondary">
                    Back to Payment
                </button>
                <button 
                    type="button" 
                    onClick={onPlaceOrder} 
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading-spinner">Placing Order...</span>
                    ) : (
                        `Place Order - $${total.toFixed(2)}`
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderReview;
