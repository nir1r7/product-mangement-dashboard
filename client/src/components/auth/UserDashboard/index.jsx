import React, { useState, useEffect } from 'react';
import UserOrderHistory from './UserOrderHistory';
import SearchBar from '../../ui/SearchBar';
import NotesModal from './NotesModal';
import './UserDashboard.css';

const UserDashboard = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesUser, setNotesUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const usersPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage,
                limit: usersPerPage,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`http://localhost:5000/api/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            setTotalUsers(data.total || 0);
        } catch (error) {
            // Error fetching users - silently handle
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user role');
            }

            await fetchUsers();
        } catch (error) {
            alert(`Failed to update user role: ${error.message}`);
        }
    };

    const deleteUser = async (userId) => {
        // Find the user to get their details for confirmation
        const userToDelete = users.find(user => user._id === userId);
        const confirmMessage = `Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})?\n\nThis action cannot be undone.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            const result = await response.json();
            alert(result.message || 'User deleted successfully');
            await fetchUsers();
        } catch (error) {
            alert(`Failed to delete user: ${error.message}`);
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

    const handleEditNotes = (user) => {
        setNotesUser(user);
        setShowNotesModal(true);
    };

    const handleCloseNotesModal = () => {
        setShowNotesModal(false);
        setNotesUser(null);
    };

    const handleSaveNotes = (userId, notesContent) => {
        // Update the user in the local state
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user._id === userId
                    ? { ...user, notes: notesContent }
                    : user
            )
        );
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when searching
    };

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
                        <p>Showing {totalUsers} users matching "{searchQuery}"</p>
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
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
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
                                <td className="notes-column">
                                    <div className="notes-display">
                                        <div
                                            className="notes-preview"
                                            dangerouslySetInnerHTML={{
                                                __html: user.notes
                                                    ? (user.notes.length > 50
                                                        ? user.notes.substring(0, 50) + '...'
                                                        : user.notes)
                                                    : '<em>No notes</em>'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleEditNotes(user)}
                                            className="btn btn-outline btn-sm"
                                        >
                                            {user.notes ? 'Edit Notes' : 'Add Notes'}
                                        </button>
                                    </div>
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

                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
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

            {/* Notes Modal */}
            <NotesModal
                isOpen={showNotesModal}
                onClose={handleCloseNotesModal}
                user={notesUser}
                token={token}
                onSave={handleSaveNotes}
            />
        </div>
    );
};

export default UserDashboard;
