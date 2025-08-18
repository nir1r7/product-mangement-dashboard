import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const initialAddress = {
    fullName: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: ''
};

export default function CheckoutPage() {
    const { cartItems, clearCart } = useContext(CartContext);
    const { token } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState(initialAddress);
    const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Card' | 'PayPal' (non-integrated)
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const totalPrice = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = item.product?.price ?? 0;
            return sum + price * (item.quantity || 1);
        }, 0);
    }, [cartItems]);

    if (!token) {
        return <p>Please log in to checkout.</p>;
    }

    if (cartItems.length === 0) {
        return <p>Your cart is empty.</p>;
    }

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
        const payload = {
            items: cartItems.map(ci => ({
                product: ci.product?._id || ci._id,
                quantity: ci.quantity || 1
            })),
            shippingAddress,
            paymentMethod
        };

        const res = await fetch('http://localhost:5000/api/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || 'Failed to place order');
        }

        alert('Payment successful! Your order was placed. Check “My Orders” for details.');
        await clearCart();
        navigate('/my-orders');
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
        <h2>Checkout</h2>

        <div style={{ marginBottom: 20 }}>
            <h3>Order Summary</h3>
            <ul>
            {cartItems.map(ci => (
                <li key={ci.product?._id || ci._id}>
                {ci.product?.name || 'Product'} x {ci.quantity || 1} — $
                {(ci.product?.price || 0) * (ci.quantity || 1)}
                </li>
            ))}
            </ul>
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
        </div>

        <form onSubmit={handlePlaceOrder}>
            <h3>Shipping Information</h3>
            <div>
            <label>Full Name</label><br />
            <input
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleAddressChange}
                required
            />
            </div>
            <div>
            <label>Street</label><br />
            <input
                name="street"
                value={shippingAddress.street}
                onChange={handleAddressChange}
                required
            />
            </div>
            <div>
            <label>City</label><br />
            <input
                name="city"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                required
            />
            </div>
            <div>
            <label>Province</label><br />
            <input
                name="province"
                value={shippingAddress.province}
                onChange={handleAddressChange}
                required
            />
            </div>
            <div>
            <label>Postal Code</label><br />
            <input
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleAddressChange}
                required
            />
            </div>
            <div>
            <label>Country</label><br />
            <input
                name="country"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                required
            />
            </div>

            <div style={{ marginTop: 20 }}>
            <h3>Payment Method</h3>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="COD">Cash on Delivery</option>
                <option value="Card">Card (Simulated)</option>
                <option value="PayPal">PayPal (Simulated)</option>
            </select>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit" disabled={submitting} style={{ marginTop: 20, padding: '8px 16px' }}>
            {submitting ? 'Placing Order...' : 'Pay & Place Order'}
            </button>
        </form>
        </div>
    );
}
