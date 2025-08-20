import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth = () => {
    const { token, user, role } = useAuth();

    const clearStorage = () => {
        localStorage.clear();
        window.location.reload();
    };

    const checkToken = () => {
        const storedToken = localStorage.getItem('token');
        console.log('Stored token:', storedToken);
        
        if (storedToken) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                console.log('Token payload:', payload);
            } catch (e) {
                console.error('Failed to decode token:', e);
            }
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>Auth Debug Info</h3>
            <p><strong>Token:</strong> {token ? 'Present' : 'None'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user) : 'None'}</p>
            <p><strong>Role:</strong> {role || 'None'}</p>
            
            <div style={{ marginTop: '10px' }}>
                <button onClick={clearStorage} style={{ marginRight: '10px' }}>
                    Clear Storage & Reload
                </button>
                <button onClick={checkToken}>
                    Check Token in Console
                </button>
            </div>
        </div>
    );
};

export default DebugAuth;
