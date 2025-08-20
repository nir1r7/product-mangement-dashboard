import React, { useState, useEffect } from 'react';
import SearchBar from '../../ui/SearchBar';
import './OrderDashboard.css';

const OrderDashboard = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [ignoreCancellations, setIgnoreCancellations] = useState(false);
    const [originalOrders, setOriginalOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (originalOrders.length > 0) {
            const filteredData = filterOrders(originalOrders, searchQuery);
            const sortedData = sortOrders(filteredData, sortBy, ignoreCancellations);
            setOrders(sortedData);
        }
    }, [sortBy, ignoreCancellations, originalOrders, searchQuery]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filterOrders = (ordersToFilter, query) => {
        if (!query) return ordersToFilter;

        return ordersToFilter.filter(order => {
            const orderId = order._id.toLowerCase();
            const customerEmail = order.user?.email?.toLowerCase() || '';
            const customerName = order.user?.name?.toLowerCase() || '';
            const status = order.status.toLowerCase();
            const shippingName = order.shippingAddress?.fullName?.toLowerCase() || '';
            const shippingAddress = `${order.shippingAddress?.street || ''} ${order.shippingAddress?.city || ''} ${order.shippingAddress?.province || order.shippingAddress?.state || ''}`.toLowerCase();

            const searchTerm = query.toLowerCase();

            return orderId.includes(searchTerm) ||
                   customerEmail.includes(searchTerm) ||
                   customerName.includes(searchTerm) ||
                   status.includes(searchTerm) ||
                   shippingName.includes(searchTerm) ||
                   shippingAddress.includes(searchTerm);
        });
    };

    const sortOrders = (ordersToSort, sortType, ignoreCancelled) => {
        let sortedOrders = [...ordersToSort];

        // Define completion order for status sorting
        const statusOrder = {
            'Cancelled': 0,
            'Pending': 1,
            'Paid': 2,
            'Shipped': 3,
            'Delivered': 4
        };

        switch (sortType) {
            case 'newest':
                sortedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sortedOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'least-complete':
                sortedOrders.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
                break;
            case 'most-complete':
                sortedOrders.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
                break;
            case 'most-expensive':
                sortedOrders.sort((a, b) => (b.totalPrice || b.total || 0) - (a.totalPrice || a.total || 0));
                break;
            case 'least-expensive':
                sortedOrders.sort((a, b) => (a.totalPrice || a.total || 0) - (b.totalPrice || b.total || 0));
                break;
            default:
                sortedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // If ignore cancellations is enabled, move cancelled orders to the bottom
        if (ignoreCancelled) {
            const cancelledOrders = sortedOrders.filter(order => order.status === 'Cancelled');
            const nonCancelledOrders = sortedOrders.filter(order => order.status !== 'Cancelled');
            sortedOrders = [...nonCancelledOrders, ...cancelledOrders];
        }

        return sortedOrders;
    };

    const fetchOrders = async () => {
        try {
            setError('');
            const response = await fetch('http://localhost:5000/api/orders/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch orders`);
            }

            const data = await response.json();
            console.log('Orders fetched:', data); // Debug log
            setOriginalOrders(data);
            // Apply initial sorting
            const sortedData = sortOrders(data, sortBy, ignoreCancellations);
            setOrders(sortedData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update order');

            await fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
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
            <div className="order-dashboard-container">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-dashboard-container">
                <h1 className="order-dashboard-title">Order Management</h1>
                <div className="error-container">
                    <h3>Error loading orders</h3>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-dashboard-container">
            <h1 className="order-dashboard-title">Order Management</h1>

            {/* Search Bar */}
            <div className="search-section">
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search orders by ID, customer, status, or shipping address..."
                    value={searchQuery}
                />
                {searchQuery && (
                    <div className="search-results-info">
                        <p>Showing {orders.length} results for "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* Sorting Controls */}
            <div className="sorting-controls">
                <div className="sort-options">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="least-complete">Least Complete</option>
                        <option value="most-complete">Most Complete</option>
                        <option value="most-expensive">Most Expensive</option>
                        <option value="least-expensive">Least Expensive</option>
                    </select>
                </div>
                <div className="ignore-cancellations">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={ignoreCancellations}
                            onChange={(e) => setIgnoreCancellations(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Ignore Cancellations
                    </label>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="orders-table-container">
                    <div className="empty-state">
                        <h3>No orders found</h3>
                        <p>There are no orders in the system yet.</p>
                    </div>
                </div>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                            <tr key={order._id}>
                                <td>#{order._id.slice(-8)}</td>
                                <td>{order.user?.email || 'No Email'}</td>
                                <td>
                                    <ul className="order-items-list">
                                        {order.items.map(item => (
                                            <li key={item.product?._id || item._id || Math.random()}>
                                                {item.product?.name || 'Product Deleted'} - Qty: {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>${(order.totalPrice || order.total || 0).toFixed(2)}</td>
                                <td>
                                    <span className={`order-status order-status--${order.status}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderDashboard;
