import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const { token, role, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav>
            <ul>
                <li><Link to="/">Shop</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                {token && <li><Link to="/profile">Profile</Link></li>}
                {token && role === 'admin' && <li><Link to="/dashboard">Admin Dashboard</Link></li>}
                {!token ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                ) : (
                    <li><button onClick={handleLogout}>Logout</button></li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
