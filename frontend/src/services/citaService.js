const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let message = 'Error en la solicitud';
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {
      message = response.statusText || message;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

export const citaService = {
  /**
   * Obtiene los slots disponibles de un doctor para una fecha.
   * GET /api/doctores/{doctorId}/slots?date=YYYY-MM-DD
   */
  getDoctorSlots: async (doctorId, date) => {
    const response = await fetch(
      `${API_BASE_URL}/doctores/${doctorId}/slots?date=${date}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );
    return handleResponse(response);
  },

  /**
   * Crea una cita reservando un slot.
   * POST /api/citas
   * Body: { slotId, motivo }
   */
  createCita: async (slotId, motivo) => {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ slotId, motivo })
    });
    return handleResponse(response);
  }
};
