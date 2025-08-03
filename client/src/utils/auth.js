import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.role;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};
