import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function Cart() {
    const { cartItems, removeFromCart, updateCartQuantity, clearCart } = useContext(CartContext);
    const { token } = useAuth();

    const handleOrderNow = async () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity
                    }))
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Order placed successfully!');
                clearCart();
            } else {
                alert(`Order failed: ${data.message}`);
            }
        } catch (err) {
            console.error('Order placement error:', err);
            alert('An error occurred while placing the order.');
        }
    };

    if (cartItems.length === 0) {
        return <div>Your cart is empty.</div>;
    }

    // Calculate total price
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

            <button onClick={handleOrderNow} style={{ marginTop: '20px', padding: '10px 20px' }}>
                Order Now
            </button>
        </div>
    );
}

export default Cart;
