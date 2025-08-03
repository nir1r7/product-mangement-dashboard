import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDashboard from './components/ProductDashboard';
import Login from './components/Login';
import SignUp from './components/Signup';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import { getUserRole } from './utils/auth';


function App() {
    const token = localStorage.getItem('token'); // Simplified auth check

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/dashboard" element={token && getUserRole() === 'admin' ? <ProductDashboard token={token} /> : <Navigate to="/" />} />
                {/* <Route path="/cart" element={<Cart />} /> */}
                <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </Router>
    );
}

export default App;