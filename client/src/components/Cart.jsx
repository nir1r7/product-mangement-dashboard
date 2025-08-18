import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const { cartItems, removeFromCart, updateCartQuantity } = useContext(CartContext);
    const { token } = useAuth();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return <div>Your cart is empty.</div>;
    }

    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
    }, 0);

    return (
        <div>
            <h2>Your Cart</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.product._id}>
                        <h3>{item.product.name}</h3>
                        <p>Price: ${item.product.price}</p>
                        
                        <p>
                            Quantity:
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                    const newQuantity = Math.max(1, parseInt(e.target.value));
                                    updateCartQuantity(item.product._id, newQuantity);
                                }}
                                style={{ width: '50px', marginLeft: '10px' }}
                            />
                        </p>

                        <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
                    </li>
                ))}
            </ul>

            <h3>Total: ${totalPrice.toFixed(2)}</h3>

            <button
                onClick={() => {
                if (!token) {
                    alert('Please log in to proceed to checkout.');
                    return;
                }
                navigate('/checkout');
                }}
                style={{ marginTop: '20px', padding: '10px 20px' }}
            >
                Proceed to Checkout
            </button>
        </div>
    );
}

export default Cart;
