import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import Login from './components/Login';
import SignUp from './components/Signup';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import ProductDashboard from './components/ProductDashboard';
import OrderDashboard from './components/OrderDashboard';
import UserDashboard from './components/UserDashboard';

import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

function App() {
    const { token, role } = useAuth();
    const { clearCart } = useCart();
    const { logout } = useAuth();

    const handleGlobalLogout = () => {
        clearCart();
        logout();
    };

    return (
        <Router>
            <Navbar onLogout={handleGlobalLogout} />
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product-dashboard" element={token && role === 'admin' ? <ProductDashboard token={token} /> : <Navigate to="/" />} />
                <Route path="/order-dashboard" element={token && role === 'admin' ? <OrderDashboard token={token} /> : <Navigate to="/" />} />
                <Route path="/user-dashboard" element={token && role === 'admin' ? <UserDashboard token={token} /> : <Navigate to="/" />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </Router>
    );
}

export default App;
