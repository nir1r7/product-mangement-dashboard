import { jwtDecode } from 'jwt-decode';
import { apiRequest, retryRequest } from './errorHandler';

export const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.role;
    } catch (error) {
        localStorage.removeItem('token');
        return null;
    }
};

export const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        localStorage.removeItem('token');
        return false;
    }
};

export const login = async (credentials) => {
    return retryRequest(async () => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    });
};

export const register = async (userData) => {
    return retryRequest(async () => {
        return await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    });
};

export const logout = () => {
    localStorage.removeItem('token');
};
