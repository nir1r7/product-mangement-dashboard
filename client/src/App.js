import SignUp from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
import ProductList from './components/ProductList';
import ProductDashboard from './components/ProductDashboard';

import './App.css';

import React, { useState } from 'react';

function App() {
  const [displayProfile, setDisplayProfile] = useState(false);
  const [displayProducts, setDisplayProducts] = useState(false);
  const [displayProductDashboard, setDisplayProductDashboard] = useState(false);
  const [resetKey, setResetKey] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setDisplayProfile(false);
    setResetKey(!resetKey); // triggers reset in children
    alert('Logged out successfully');
  };

  return (
    <div className="App">
      <h1>User Authentication</h1>
      <p>Sign up or log in to access your account.</p>
      <SignUp resetKey={resetKey} />
      <Login resetKey={resetKey} />

      <button onClick={() => {setDisplayProfile(!displayProfile)}}>Profile</button>
      {displayProfile && <Profile />}

      {<button onClick={() => handleLogout()}>Logout</button>}

      <button onClick={() => {setDisplayProducts(!displayProducts)}}>Products</button>
      {displayProducts && <ProductList />}

      <button onClick={() => {setDisplayProductDashboard(!displayProductDashboard)}}>Product Dashboard</button>
      {displayProductDashboard && <ProductDashboard token={localStorage.getItem('token')} />}
    </div>
  );
}

export default App;
