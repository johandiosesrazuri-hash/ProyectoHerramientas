const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const citaService = {
  // Obtener historial de citas del usuario autenticado (paciente)
  getHistorial: async () => {
    const response = await fetch(`${API_BASE_URL}/citas/historial`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
      throw new Error('No se pudieron obtener las citas');
    }

    return await response.json();
  },

  // Obtener historial de citas del doctor autenticado
  getHistorialDoctor: async () => {
    const response = await fetch(`${API_BASE_URL}/citas/doctor/historial`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
      throw new Error('No se pudieron obtener las citas del doctor');
    }

    return await response.json();
  },

  // Crear una nueva cita
  createCita: async (slotId, motivo) => {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        slotId,
        motivo
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'No se pudo crear la cita');
    }

    return await response.json();
  }
};
