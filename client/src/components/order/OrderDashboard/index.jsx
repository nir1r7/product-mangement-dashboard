// client/src/pages/OrderDashboard/index.jsx
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, searchQuery, ignoreCancellations, dateRange.from, dateRange.to]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const setQuickDateRange = (days) => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - days);

    setDateRange({
      from: fromDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    });
    setCurrentPage(1);
  };

  const clearDateRange = () => {
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
  };

  // NOTE: sorting & push-cancelled-to-bottom are handled server-side now.
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage,
        limit: ordersPerPage,
        sort: sortBy,
        ignoreCancellations: String(ignoreCancellations)
      });

      if (searchQuery) params.append('search', searchQuery);
      if (dateRange.from) params.append('dateFrom', dateRange.from);
      if (dateRange.to) params.append('dateTo', dateRange.to);

      const response = await fetch(`http://localhost:5000/api/orders/admin/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch orders`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.total || 0);
      setOriginalOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
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
          <button onClick={fetchOrders} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-dashboard-container">
      <h1 className="order-dashboard-title">Order Management</h1>

      {/* Sorting and Search Controls */}
      <div className="sorting-controls">
        <div className="sort-options">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
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

        <div className="search-controls">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search orders..."
            value={searchQuery}
          />
        </div>

        <div className="date-range-controls">
          <div className="date-inputs">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="date-input"
            />
            <label>To:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="date-input"
            />
            {(dateRange.from || dateRange.to) && (
              <button onClick={clearDateRange} className="btn btn-secondary btn-sm">Clear</button>
            )}
          </div>
          <div className="quick-date-buttons">
            <button onClick={() => setQuickDateRange(7)} className="btn btn-outline btn-sm">Last 7 days</button>
            <button onClick={() => setQuickDateRange(30)} className="btn btn-outline btn-sm">Last 30 days</button>
            <button onClick={() => setQuickDateRange(90)} className="btn btn-outline btn-sm">Last 90 days</button>
          </div>
        </div>

        <div className="ignore-cancellations">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={ignoreCancellations}
              onChange={(e) => { setIgnoreCancellations(e.target.checked); setCurrentPage(1); }}
            />
            <span className="checkmark"></span>
            Ignore Cancellations
          </label>
        </div>
      </div>

      {searchQuery && (
        <div className="search-results-info">
          <p>Showing {orders.length} results for "{searchQuery}"</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="orders-table-container">
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>Try adjusting your filters or date range.</p>
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
                  <td>#{String(order._id).slice(-8)}</td>
                  <td>{order.user?.email || 'No Email'}</td>
                  <td>
                    <ul className="order-items-list">
                      {(order.items || []).map((item, idx) => (
                        <li key={item.product?._id || item._id || idx}>
                          {(item.product?.name) || 'Product Deleted'} - Qty: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${Number(order.totalPrice || order.total || 0).toFixed(2)}</td>
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

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDashboard;
