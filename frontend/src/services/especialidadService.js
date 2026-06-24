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

export const especialidadService = {
  /**
   * Obtiene todas las especialidades disponibles
   */
  getAllEspecialidades: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/especialidades`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching especialidades:', error);
      throw new Error(error.message || 'Error al obtener especialidades');
    }
  },

  /**
   * Obtiene una especialidad específica por ID
   */
  getEspecialidadById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/especialidades/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching especialidad:', error);
      throw new Error(error.message || 'Error al obtener especialidad');
    }
  }
};
