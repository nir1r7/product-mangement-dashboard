import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function OrderHistory({ orderProps, titleProps }) {
    const { token } = useAuth();
    const [title, setTitle] = useState('My Orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTitle(titleProps || 'My Orders');
    }, [titleProps]);

    useEffect(() => {
        if (orderProps !== undefined) {
            setOrders(orderProps);
            setLoading(false);
            return;
        }

        fetch('http://localhost:5000/api/orders', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                return res.json();
            })
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [token, orderProps]);

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div>
                    {title && <h2>{title}</h2>}
                    <table border="1" cellPadding="5" style={{ marginTop: '10px' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ fontSize: '12px' }}>{order._id}</td>
                                    <td>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {order.items.map(item => (
                                                <li key={item.product?._id || item._id}>
                                                    {item.product?.name || 'Product Unavailable'} 
                                                    <span>
                                                        (x{item.quantity}) - $
                                                        {(item.product?.price
                                                            ? item.product.price * item.quantity
                                                            : 0
                                                        ).toFixed(2)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default OrderHistory;
