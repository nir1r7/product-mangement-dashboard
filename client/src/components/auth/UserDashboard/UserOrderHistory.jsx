import React, { useState, useEffect } from 'react';

const UserOrderHistory = ({ userId, token, userName }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            fetchUserOrders();
        }
    }, [userId]);

    const fetchUserOrders = async () => {
        try {
            setError('');
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/orders/admin/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch user orders`);
            }

            const data = await response.json();
            // Sort orders from newest to oldest
            const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="user-order-history">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading {userName}'s orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-order-history">
                <div className="error-container">
                    <h3>Error loading orders</h3>
                    <p>{error}</p>
                    <button onClick={fetchUserOrders} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-order-history">
            <h2>{userName}'s Order History</h2>
            
            {orders.length === 0 ? (
                <div className="order-history-empty">
                    <h3>No orders yet</h3>
                    <p>{userName} hasn't placed any orders yet.</p>
                </div>
            ) : (
                <div className="order-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Order #{order._id.slice(-8)}</h3>
                                    <p className="order-date">{formatDate(order.createdAt)}</p>
                                    <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-total">
                                    ${(order.totalPrice || order.total || 0).toFixed(2)}
                                </div>
                            </div>
                            
                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <div className="order-item__info">
                                            <h4>{item.product?.name || 'Product Deleted'}</h4>
                                            <p>Quantity: {item.quantity}</p>
                                            {item.product?.price && (
                                                <p>Price: ${item.product.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <div className="order-item__total">
                                            {item.product?.price ? 
                                                `$${(item.product.price * item.quantity).toFixed(2)}` : 
                                                'Price unavailable'
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {order.shippingAddress && (
                                <div className="order-shipping">
                                    <h4>Shipping Address:</h4>
                                    <p>
                                        {order.shippingAddress.fullName && (
                                            <>{order.shippingAddress.fullName}<br /></>
                                        )}
                                        {order.shippingAddress.street || order.shippingAddress.address}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.province || order.shippingAddress.state} {order.shippingAddress.postalCode || order.shippingAddress.zipCode}
                                        {order.shippingAddress.country && (
                                            <><br />{order.shippingAddress.country}</>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrderHistory;
