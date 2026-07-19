const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Error en la petición';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // Ignorar
        }
        throw new Error(errorMessage);
    }
    // Para responses 204 No Content
    if (response.status === 204) return { data: null };
    const data = await response.json();
    return { data };
};

const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    post: async (endpoint, body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },
    
    put: async (endpoint, body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },
    
    delete: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

export default api;
