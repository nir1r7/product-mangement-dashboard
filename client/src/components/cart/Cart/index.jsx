import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateCartQuantity } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = item.product || item;
            const price = product.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="cart-empty">
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <Link to="/products" className="btn btn-primary">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1 className="cart-title">Shopping Cart</h1>
            
            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map((item) => {
                        // Handle both direct product items and nested product structure
                        const product = item.product || item;
                        const productId = product._id || item._id;

                        return (
                        <div key={productId} className="cart-item">
                            <div className="cart-item__image">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:5000${product.images[0]}`}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="cart-item__no-image">No Image</div>
                                )}
                            </div>

                            <div className="cart-item__info">
                                <h3 className="cart-item__name">{product.name}</h3>
                                <p className="cart-item__price">${product.price.toFixed(2)}</p>
                                <p className="cart-item__description">{product.description}</p>
                            </div>
                            
                            <div className="cart-item__quantity">
                                <label htmlFor={`quantity-${productId}`}>Quantity:</label>
                                <select
                                    id={`quantity-${productId}`}
                                    value={item.quantity || 1}
                                    onChange={(e) => updateCartQuantity(productId, parseInt(e.target.value))}
                                    className="cart-item__quantity-select"
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="cart-item__total">
                                ${(product.price * (item.quantity || 1)).toFixed(2)}
                            </div>

                            <button
                                onClick={() => removeFromCart(productId)}
                                className="btn btn-danger cart-item__remove"
                            >
                                Remove
                            </button>
                        </div>
                        );
                    })}
                </div>
                
                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="cart-summary__item">
                        <span>Subtotal:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="cart-summary__total">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <Link to="/checkout" className="btn btn-primary cart-summary__checkout">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
