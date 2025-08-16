import React, { useState, useEffect } from 'react';
import OrderHistory from './OrderHistory';
import SearchBar from './SearchBar';

function UserDashboard({ token }) {
    const [users, setUsers] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [orders, setOrders] = useState({});
    const [notes, setNotes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2>User Dashboard</h2>

            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search users..."
            />

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
                {filteredUsers.map(user => (
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

            <div  style={{float: 'right'}}>
                {expandedUserId && orders[expandedUserId] && (
                    <OrderHistory 
                        orderProps={orders[expandedUserId]} 
                        titleProps={users.find(u => u._id === expandedUserId)?.name + "'s Orders"} 
                    />
                )}
            </div>
        </div>
    );
}

export default UserDashboard;
