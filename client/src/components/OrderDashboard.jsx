import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';

function OrderDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('mostRecent');
    const [ignoreCancellations, setIgnoreCancellations] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();
    const statusRank = React.useMemo(() => [
        'Cancelled',
        'Pending',
        'Paid',
        'Shipped',
        'Delivered',
    ], []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders/admin/orders', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const sortOrders = React.useCallback((orders, option, ignoreCancel) => {
        const sorted = [...orders];

        sorted.sort((a, b) => {
            if (ignoreCancel) {
                if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1; // a after b
                if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1; // a before b
            }

            switch (option) {
                case 'mostRecent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'mostExpensive':
                    return b.totalPrice - a.totalPrice;
                case 'leastExpensive':
                    return a.totalPrice - b.totalPrice;
                case 'mostCompleteStatus':
                    return statusRank.indexOf(b.status) - statusRank.indexOf(a.status);
                case 'leastCompleteStatus':
                    return statusRank.indexOf(a.status) - statusRank.indexOf(b.status);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [statusRank]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleIgnoreCancellationsChange = () => {
        setIgnoreCancellations(!ignoreCancellations);
        sortOrders(orders, sortOption, ignoreCancellations);
    };


    const filteredAndSortedOrders = React.useMemo(() => {
        const filtered = orders.filter(order => 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return sortOrders(filtered, sortOption, ignoreCancellations);
    }, [orders, searchTerm, sortOption, ignoreCancellations, sortOrders]);

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <div>
            <h2>Order Dashboard</h2>

            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search orders..."
            />

            <label htmlFor="sortOrders">Sort By: </label>
            <select
                id="sortOrders"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ marginBottom: '1rem' }}
            >
                <option value="mostRecent">Most Recent Order</option>
                <option value="oldest">Oldest Order</option>
                <option value="mostExpensive">Most Expensive</option>
                <option value="leastExpensive">Least Expensive</option>
                <option value="mostCompleteStatus">Most Complete Status</option>
                <option value="leastCompleteStatus">Least Complete Status</option>
            </select>

            <label htmlFor="ignoreCancel">
                <input
                    type="checkbox"
                    id="ignoreCancel"
                    checked={ignoreCancellations}
                    onChange={handleIgnoreCancellationsChange}
                    style={{ marginRight: '0.5rem' }}
                />
                Ignore Cancellations
            </label>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Items</th>
                        <th>Total Price</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedOrders.map(order => (
                        <tr key={order._id}>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                            <td>{order._id}</td>
                            <td>{order.user?.name || 'Unknown User'}</td>
                            <td>{order.user?.email || 'No Email'}</td>
                            <td>
                                <ul>
                                    {order.items.map(item => (
                                        <li key={item.product._id}>
                                            {item.product.name} - Qty: {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>${order.totalPrice.toFixed(2)}</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                >
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OrderDashboard;
