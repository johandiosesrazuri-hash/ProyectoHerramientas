const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const authService = {

  register: async (nombre, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ nombre, email, password })
  });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el registro');
    }

    return await response.json();
  },


  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el login');
    }

    return await response.json();
  },


  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const userService = {
  
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario actual');
    }

    return await response.json();
  },

  // Obtener todos los usuarios (solo ADMIN)
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('No tienes permisos para ver los usuarios');
    }

    return await response.json();
  },

  // Crear usuario (solo ADMIN)
  createUser: async (nombre, email, password, rol = 'USER') => {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nombre, email, password, rol })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear usuario');
    }

    return await response.json();
  }
};

// Utilidades
export const authUtils = {
  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Obtener usuario
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Establecer token y usuario
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Limpiar autenticación
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si el usuario es admin
  isAdmin: () => {
    const user = authUtils.getUser();
    return user && user.rol === 'ADMIN';
  }
};
