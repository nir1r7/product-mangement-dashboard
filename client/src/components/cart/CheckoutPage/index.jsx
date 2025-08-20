import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: calculateTotal(),
                shippingAddress: {
                    fullName: formData.fullName,
                    street: formData.address,
                    city: formData.city,
                    province: formData.state,
                    postalCode: formData.zipCode,
                    country: 'USA' // Default to USA, could be made configurable
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
            
            {error && <div className="checkout-error">{error}</div>}
            
            <div className="checkout-content">
                <div className="checkout-form-section">
                    <h2>Shipping Information</h2>
                    <form onSubmit={handleSubmit} className="checkout-form">
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
                                <label htmlFor="state" className="form-label">State</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <h2>Payment Information</h2>
                        
                        <div className="form-group">
                            <label htmlFor="cardNumber" className="form-label">Card Number</label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="1234 5678 9012 3456"
                                required
                            />
                        </div>
                        
                        <div className="checkout-form__row">
                            <div className="form-group">
                                <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                                <input
                                    type="text"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="MM/YY"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="cvv" className="form-label">CVV</label>
                                <input
                                    type="text"
                                    id="cvv"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="123"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary checkout-submit"
                        >
                            {loading ? <span className="loading"></span> : `Place Order - $${calculateTotal().toFixed(2)}`}
                        </button>
                    </form>
                </div>
                
                <div className="checkout-summary">
                    <h2>Order Summary</h2>
                    <div className="checkout-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="checkout-item">
                                <div className="checkout-item__info">
                                    <h4>{item.name}</h4>
                                    <p>Qty: {item.quantity}</p>
                                </div>
                                <div className="checkout-item__price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="checkout-total">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
