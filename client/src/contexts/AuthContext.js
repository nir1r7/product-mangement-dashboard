import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        // Check if token exists and is valid on initialization
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                // Try to decode the token to validate it
                const decoded = jwtDecode(storedToken);
                return storedToken;
            } catch (err) {
                localStorage.removeItem('token');
                return null;
            }
        }
        return null;
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role,
                    isAdmin: decoded.role === 'admin'
                });
            } catch (err) {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                return data;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'user' }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                return data;
            } else {
                throw new Error(data.error || 'Signup failed');
            }
        } catch (error) {
            throw new Error(error.message || 'Signup failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // For backward compatibility, also provide token and role
    const role = user?.role || null;

    return (
        <AuthContext.Provider value={{
            token,
            user,
            role,
            login,
            signup,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);