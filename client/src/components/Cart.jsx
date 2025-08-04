import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

function Cart() {
    const { cartItems, removeFromCart } = useContext(CartContext);

    if (cartItems.length === 0) {
        return <div>Your cart is empty.</div>;
    }

    return (
        <div>
            <h2>Your Cart</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.product._id}>
                        <h3>{item.product.name}</h3>
                        <p>Price: ${item.product.price}</p>
                        <p>Quantity: {item.quantity}</p>
                        <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default Cart;
