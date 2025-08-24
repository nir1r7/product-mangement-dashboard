import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import PaymentMethod from '../PaymentMethod';
import OrderReview from '../OrderReview';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        postalCode: ''
    });

    const [paymentData, setPaymentData] = useState({
        method: 'COD',
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const product = item.product || item;
            const price = product.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    const calculateShipping = (subtotal) => {
        // Free shipping over $100, otherwise $15
        return subtotal >= 100 ? 0 : 15;
    };

    const calculateTax = (subtotal, province) => {
        // Canadian HST/GST rates by province
        const taxRates = {
            'ON': 0.13, // Ontario - HST
            'QC': 0.14975, // Quebec - GST + QST
            'BC': 0.12, // British Columbia - GST + PST
            'AB': 0.05, // Alberta - GST only
            'SK': 0.11, // Saskatchewan - GST + PST
            'MB': 0.12, // Manitoba - GST + PST
            'NB': 0.15, // New Brunswick - HST
            'NS': 0.15, // Nova Scotia - HST
            'PE': 0.15, // Prince Edward Island - HST
            'NL': 0.15, // Newfoundland and Labrador - HST
            'NT': 0.05, // Northwest Territories - GST only
            'NU': 0.05, // Nunavut - GST only
            'YT': 0.05  // Yukon - GST only
        };

        const rate = taxRates[province] || 0.13; // Default to Ontario HST
        return subtotal * rate;
    };

    const subtotal = calculateSubtotal();
    const shippingCost = calculateShipping(subtotal);
    const taxAmount = calculateTax(subtotal, formData.state);
    const total = subtotal + shippingCost + taxAmount;

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePaymentDataChange = (newPaymentData) => {
        setPaymentData(newPaymentData);
    };

    const checkStockAvailability = async () => {
        try {
            for (const item of cartItems) {
                const product = item.product || item;
                const productId = product._id || item._id;

                const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch product ${productId}`);
                }

                const productData = await response.json();
                if (productData.stock < item.quantity) {
                    throw new Error(`Insufficient stock for "${productData.name}". Available: ${productData.stock}, Requested: ${item.quantity}`);
                }
            }
            return true;
        } catch (error) {
            setError(error.message);
            return false;
        }
    };

    const handleNextStep = async () => {
        if (currentStep === 1) {
            // Validate shipping form
            if (!formData.fullName || !formData.address || !formData.city || !formData.state || !formData.postalCode) {
                setError('Please fill in all shipping information');
                return;
            }

            // Check stock availability
            const stockAvailable = await checkStockAvailability();
            if (!stockAvailable) {
                return;
            }

            setError('');
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Check stock again before proceeding to review
            const stockAvailable = await checkStockAvailability();
            if (!stockAvailable) {
                return;
            }
            setCurrentStep(3);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        setError('');

        try {
            // Final stock check before placing order
            const stockAvailable = await checkStockAvailability();
            if (!stockAvailable) {
                setLoading(false);
                return;
            }
            const orderData = {
                items: cartItems.map(item => {
                    const product = item.product || item;
                    const productId = product._id || item._id;
                    return {
                        product: productId,
                        quantity: item.quantity || 1,
                        price: product.price || 0
                    };
                }),
                subtotal: subtotal,
                shippingCost: shippingCost,
                taxAmount: taxAmount,
                totalPrice: total,
                paymentMethod: paymentData.method,
                paymentDetails: paymentData.method === 'Card' ? {
                    cardHolderName: paymentData.cardHolderName,
                    cardLastFour: paymentData.cardNumber.slice(-4),
                    cardType: 'Credit Card' // Could be enhanced to detect card type
                } : {},
                shippingAddress: {
                    fullName: formData.fullName,
                    street: formData.address,
                    city: formData.city,
                    province: formData.state,
                    postalCode: formData.postalCode,
                    country: 'Canada'
                }
            };

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const order = await response.json();
            clearCart();
            navigate(`/my-orders`);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-container">
                <div className="checkout-empty">
                    <h2>Your cart is empty</h2>
                    <p>Add some products to checkout!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Checkout</h1>

            {/* Step Indicator */}
            <div className="checkout-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Shipping</span>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Payment</span>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Review</span>
                </div>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-content">
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                    <div className="checkout-form-section">
                        <h2>Shipping Information</h2>
                        <form className="checkout-form">
                        <div className="form-group">
                            <label htmlFor="fullName" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address" className="form-label">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="checkout-form__row">
                            <div className="form-group">
                                <label htmlFor="city" className="form-label">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="state" className="form-label">Province</label>
                                <select
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select Province</option>
                                    <option value="ON">Ontario</option>
                                    <option value="QC">Quebec</option>
                                    <option value="BC">British Columbia</option>
                                    <option value="AB">Alberta</option>
                                    <option value="SK">Saskatchewan</option>
                                    <option value="MB">Manitoba</option>
                                    <option value="NB">New Brunswick</option>
                                    <option value="NS">Nova Scotia</option>
                                    <option value="PE">Prince Edward Island</option>
                                    <option value="NL">Newfoundland and Labrador</option>
                                    <option value="NT">Northwest Territories</option>
                                    <option value="NU">Nunavut</option>
                                    <option value="YT">Yukon</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="postalCode" className="form-label">Postal Code</label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="A1A 1A1"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn btn-primary"
                            >
                                Continue to Payment
                            </button>
                        </div>
                        </form>
                    </div>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                    <PaymentMethod
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                        paymentData={paymentData}
                        onPaymentDataChange={handlePaymentDataChange}
                    />
                )}

                {/* Step 3: Order Review */}
                {currentStep === 3 && (
                    <OrderReview
                        cartItems={cartItems}
                        shippingData={formData}
                        paymentData={paymentData}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        taxAmount={taxAmount}
                        total={total}
                        onBack={handlePrevStep}
                        onPlaceOrder={handlePlaceOrder}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
