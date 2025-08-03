import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const token = localStorage.getItem('token');

    return (
        <nav>
            <ul>
                <li><Link to="/">Shop</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                {token && <li><Link to="/profile">Profile</Link></li>}
                {token && getUserRole() === 'admin' && <li><Link to="/dashboard">Admin Dashboard</Link></li>}
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
