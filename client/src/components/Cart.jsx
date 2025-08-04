import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

function Cart() {
    const { cartItems, removeFromCart, updateCartQuantity } = useContext(CartContext);

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
        </div>
    );
}


export default Cart;
