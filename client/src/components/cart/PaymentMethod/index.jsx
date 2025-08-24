import React, { useState } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ onNext, onBack, paymentData, onPaymentDataChange }) => {
    const [selectedMethod, setSelectedMethod] = useState(paymentData.method || 'COD');
    const [cardDetails, setCardDetails] = useState({
        cardHolderName: paymentData.cardHolderName || '',
        cardNumber: paymentData.cardNumber || '',
        expiryDate: paymentData.expiryDate || '',
        cvv: paymentData.cvv || ''
    });

    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        onPaymentDataChange({ ...paymentData, method });
    };

    const handleCardDetailsChange = (field, value) => {
        const updatedDetails = { ...cardDetails, [field]: value };
        setCardDetails(updatedDetails);
        onPaymentDataChange({ ...paymentData, ...updatedDetails });
    };

    const handleNext = () => {
        if (selectedMethod === 'Card' && (!cardDetails.cardHolderName || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
            alert('Please fill in all card details');
            return;
        }
        onNext();
    };

    return (
        <div className="payment-method-container">
            <h2>Payment Method</h2>
            
            <div className="payment-options">
                {/* Cash on Delivery */}
                <div className={`payment-option ${selectedMethod === 'COD' ? 'selected' : ''}`}>
                    <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="COD"
                        checked={selectedMethod === 'COD'}
                        onChange={() => handleMethodChange('COD')}
                    />
                    <label htmlFor="cod" className="payment-option-label">
                        <div className="payment-option-content">
                            <div className="payment-icon">💵</div>
                            <div className="payment-info">
                                <h3>Cash on Delivery (COD)</h3>
                                <p>Pay when your order arrives</p>
                            </div>
                        </div>
                    </label>
                </div>

                {/* Credit/Debit Card */}
                <div className={`payment-option ${selectedMethod === 'Card' ? 'selected' : ''}`}>
                    <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="Card"
                        checked={selectedMethod === 'Card'}
                        onChange={() => handleMethodChange('Card')}
                    />
                    <label htmlFor="card" className="payment-option-label">
                        <div className="payment-option-content">
                            <div className="payment-icons">
                                <img src="/images/visa.png" alt="Visa" className="card-logo" onError={(e) => e.target.style.display = 'none'} />
                                <img src="/images/mastercard.png" alt="Mastercard" className="card-logo" onError={(e) => e.target.style.display = 'none'} />
                                <img src="/images/amex.png" alt="American Express" className="card-logo" onError={(e) => e.target.style.display = 'none'} />
                                <span className="card-fallback">💳</span>
                            </div>
                            <div className="payment-info">
                                <h3>Credit/Debit Card</h3>
                                <p>Secure payment with your card</p>
                            </div>
                        </div>
                    </label>
                </div>

                {/* PayPal */}
                <div className={`payment-option ${selectedMethod === 'PayPal' ? 'selected' : ''}`}>
                    <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="PayPal"
                        checked={selectedMethod === 'PayPal'}
                        onChange={() => handleMethodChange('PayPal')}
                    />
                    <label htmlFor="paypal" className="payment-option-label">
                        <div className="payment-option-content">
                            <div className="payment-icon">
                                <img src="/images/paypal.png" alt="PayPal" className="paypal-logo" onError={(e) => e.target.style.display = 'none'} />
                                <span className="paypal-fallback">🅿️</span>
                            </div>
                            <div className="payment-info">
                                <h3>PayPal</h3>
                                <p>Pay securely with PayPal</p>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Card Details Form */}
            {selectedMethod === 'Card' && (
                <div className="card-details-form">
                    <h3>Card Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cardHolderName">Cardholder Name</label>
                            <input
                                type="text"
                                id="cardHolderName"
                                value={cardDetails.cardHolderName}
                                onChange={(e) => handleCardDetailsChange('cardHolderName', e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cardNumber">Card Number</label>
                            <input
                                type="text"
                                id="cardNumber"
                                value={cardDetails.cardNumber}
                                onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="expiryDate">Expiry Date</label>
                            <input
                                type="text"
                                id="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                                placeholder="MM/YY"
                                maxLength="5"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                type="text"
                                id="cvv"
                                value={cardDetails.cvv}
                                onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                                placeholder="123"
                                maxLength="4"
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="payment-actions">
                <button type="button" onClick={onBack} className="btn btn-secondary">
                    Back to Shipping
                </button>
                <button type="button" onClick={handleNext} className="btn btn-primary">
                    Continue to Review
                </button>
            </div>
        </div>
    );
};

export default PaymentMethod;
