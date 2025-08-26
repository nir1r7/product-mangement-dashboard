export class APIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

export const handleAPIError = (error, endpoint) => {
    if (error.name === 'APIError') {
        return error;
    }

    if (error.response) {
        const status = error.response.status;
        let message = 'An error occurred';

        switch (status) {
            case 400:
                message = 'Invalid request. Please check your input.';
                break;
            case 401:
                message = 'Authentication required. Please log in.';
                break;
            case 403:
                message = 'Access denied. You do not have permission.';
                break;
            case 404:
                message = 'Resource not found.';
                break;
            case 429:
                message = 'Too many requests. Please try again later.';
                break;
            case 500:
                message = 'Server error. Please try again later.';
                break;
            case 503:
                message = 'Service unavailable. Please try again later.';
                break;
            default:
                message = `Request failed with status ${status}`;
        }

        return new APIError(message, status, endpoint);
    }

    if (error.request) {
        return new APIError('Network error. Please check your connection.', 0, endpoint);
    }

    return new APIError(error.message || 'An unexpected error occurred', 0, endpoint);
};

export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                throw lastError;
            }

            if (error.status && error.status < 500) {
                throw lastError;
            }

            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }

    throw lastError;
};

export const createAPIRequest = (baseURL = 'http://localhost:5000/api') => {
    return async (endpoint, options = {}) => {
        const url = `${baseURL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(
                    errorData.message || `HTTP ${response.status}`,
                    response.status,
                    endpoint
                );
            }

            return await response.json();
        } catch (error) {
            throw handleAPIError(error, endpoint);
        }
    };
};

export const apiRequest = createAPIRequest();
