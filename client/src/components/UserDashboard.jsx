import React, { useState, useEffect } from 'react';

function UserDashboard({ token }) {
    const [users, setUsers] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [orders, setOrders] = useState({});
    const [notes, setNotes] = useState({});

    useEffect(() => {
        fetch('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUsers(data);
            const initialNotes = {};
            data.forEach(u => initialNotes[u._id] = u.notes || '');
            setNotes(initialNotes);
        });
    }, [token]);

    const toggleOrders = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            if (!orders[userId]) {
                fetch(`http://localhost:5000/api/users/${userId}/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    setOrders(prev => ({ ...prev, [userId]: data }));
                });
            }
            setExpandedUserId(userId);
        }
    };

    const saveNotes = (userId) => {
        fetch(`http://localhost:5000/api/users/${userId}/notes`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ notes: notes[userId] })
        }).then(res => res.json())
        .then(data => {
            alert('Notes saved!');
        });
    };

    return (
        <div>
            <h2>User Dashboard</h2>
            <table border="1" cellPadding="10" style={{ float: 'left' }}>
                <thead>
                <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <React.Fragment key={user._id}>
                    <tr>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role === 'admin' ? 'Yes' : 'No'}</td>
                        <td>
                        <textarea
                            value={notes[user._id] || ''}
                            onChange={e => setNotes(prev => ({ ...prev, [user._id]: e.target.value }))}
                            rows={2}
                            cols={20}
                        />
                        <br />
                        <button onClick={() => saveNotes(user._id)}>Save</button>
                        </td>
                        <td>
                        <button onClick={() => toggleOrders(user._id)}>
                            {expandedUserId === user._id ? 'Hide Orders' : 'View Orders'}
                        </button>
                        </td>
                    </tr>
                    
                    </React.Fragment>
                ))}
                </tbody>
            </table>

            <table border="1" cellPadding="10" style={{float: 'right'}}>
                {expandedUserId && orders[expandedUserId] && (
                    <tbody>
                        <tr>
                            <td colSpan="6">
                                <h4>{users.find(u => u._id === expandedUserId)?.name}'s Orders</h4>
                                <table border="1" cellPadding="5" style={{ marginTop: '10px' }}>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders[expandedUserId].map(order => (
                                            <tr key={order._id}>
                                                <td style={{ fontSize: '12px' }}>{order._id}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>{order.status}</td>
                                                <td>
                                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                                        {order.items.map(item => (
                                                            <li key={item.product._id}>
                                                                {item.product.name + ' ' || 'Product Unavailable'} 
                                                                <span style={{ color: '#666' }}>
                                                                    (x{item.quantity}) - ${(item.product.price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td>${order.totalPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                )}
            </table>
        </div>
    );
}

export default UserDashboard;
