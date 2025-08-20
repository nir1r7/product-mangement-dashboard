import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/product/ProductList';
import ProductDetail from './components/product/ProductDetail';
import Login from './components/auth/Login';
import SignUp from './components/auth/Signup';
import Profile from './components/auth/Profile';
import Navbar from './components/layout/Navbar';
import Cart from './components/cart/Cart';
import OrderHistory from './components/order/OrderHistory';
import ProductDashboard from './components/product/ProductDashboard';
import OrderDashboard from './components/order/OrderDashboard';
import UserDashboard from './components/auth/UserDashboard';
import CheckoutPage from './components/cart/CheckoutPage';


import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

function App() {
    const { token, user } = useAuth();
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
                <Route path="/" element={<Navigate to="/products" />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/product-dashboard" element={token && user?.isAdmin ? <ProductDashboard token={token} /> : <Navigate to="/" />} />
                <Route path="/order-dashboard" element={token && user?.isAdmin ? <OrderDashboard token={token} /> : <Navigate to="/" />} />
                <Route path="/user-dashboard" element={token && user?.isAdmin ? <UserDashboard token={token} /> : <Navigate to="/" />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={token ? <CheckoutPage /> : <Navigate to="/login" />} />
                <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" />} />
                <Route path="/my-orders" element={<OrderHistory />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </Router>
    );
}

export default App;
