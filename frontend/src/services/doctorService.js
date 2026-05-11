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

const toQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.append(key, value);
    }
  });

  const raw = query.toString();
  return raw ? `?${raw}` : '';
};

const createHttpError = (response, fallbackMessage) => {
  const error = new Error(fallbackMessage);
  error.status = response.status;
  error.statusText = response.statusText;
  return error;
};

export const doctorService = {
  listDoctors: async ({ search, especialidad, signal } = {}) => {
    const query = toQueryString({ search, especialidad });
    const response = await fetch(`${API_BASE_URL}/doctores${query}`, {
      method: 'GET',
      headers: getHeaders(),
      signal
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw createHttpError(response, 'Necesitas iniciar sesion para ver los doctores.');
      }

      throw createHttpError(response, 'No fue posible obtener los doctores desde la base de datos.');
    }

    return response.json();
  }
};
