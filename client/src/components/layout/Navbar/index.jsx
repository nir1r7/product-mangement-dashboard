import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setAdminDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar__container">
                <Link to="/" className="navbar__brand">
                    <span className="gradient-text">ShopHub</span>
                </Link>
                
                <div className="navbar__nav">
                    <Link to="/products" className="navbar__link">
                        Products
                    </Link>
                    
                    {user ? (
                        <>
                            <Link to="/cart" className="navbar__link">
                                Cart
                            </Link>
                            <Link to="/profile" className="navbar__link">
                                Profile
                            </Link>
                            <Link to="/my-orders" className="navbar__link">
                                My Orders
                            </Link>
                            {user.isAdmin && (
                                <div className="admin-dropdown" ref={dropdownRef}>
                                    <button
                                        className="navbar__link admin-dropdown-toggle"
                                        onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                                    >
                                        Admin ▼
                                    </button>
                                    {adminDropdownOpen && (
                                        <div className="admin-dropdown-menu">
                                            <Link
                                                to="/product-dashboard"
                                                className="admin-dropdown-item"
                                                onClick={() => setAdminDropdownOpen(false)}
                                            >
                                                Product Dashboard
                                            </Link>
                                            <Link
                                                to="/order-dashboard"
                                                className="admin-dropdown-item"
                                                onClick={() => setAdminDropdownOpen(false)}
                                            >
                                                Order Dashboard
                                            </Link>
                                            <Link
                                                to="/user-dashboard"
                                                className="admin-dropdown-item"
                                                onClick={() => setAdminDropdownOpen(false)}
                                            >
                                                User Dashboard
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-secondary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
