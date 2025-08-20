import React, { useState, useEffect } from 'react';
import UserOrderHistory from './UserOrderHistory';
import SearchBar from '../../ui/SearchBar';
import './UserDashboard.css';

const UserDashboard = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) throw new Error('Failed to update user');

            await fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user role');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');

            await fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const handleViewOrders = (user) => {
        setSelectedUser(user);
        setShowOrderHistory(true);
    };

    const handleCloseOrderHistory = () => {
        setShowOrderHistory(false);
        setSelectedUser(null);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="user-dashboard-container">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard-container">
            <h1 className="user-dashboard-title">User Management</h1>

            {/* Search Bar */}
            <div className="search-section">
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search users by name, email, or role..."
                    value={searchQuery}
                />
                {searchQuery && (
                    <div className="search-results-info">
                        <p>Showing {filteredUsers.length} of {users.length} users</p>
                    </div>
                )}
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Orders</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`user-role user-role--${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleViewOrders(user)}
                                        className="btn btn-secondary view-orders-btn"
                                    >
                                        View Orders
                                    </button>
                                </td>
                                <td>
                                    <div className="user-actions">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user._id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            className="btn btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order History Modal */}
            {showOrderHistory && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedUser.name}'s Order History</h2>
                            <button
                                className="modal-close-btn"
                                onClick={handleCloseOrderHistory}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <UserOrderHistory
                                userId={selectedUser._id}
                                token={token}
                                userName={selectedUser.name}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
