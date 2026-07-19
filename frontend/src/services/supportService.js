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

export const supportService = {
  createTicket: async ({ asunto, mensaje }) => {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ asunto, mensaje })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudo crear el ticket');
    }

    return response.json();
  },

  listMyTickets: async () => {
    const response = await fetch(`${API_BASE_URL}/tickets/mis-tickets`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudieron cargar tus tickets');
    }

    return response.json();
  },

  listAllTickets: async (estado) => {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    const response = await fetch(`${API_BASE_URL}/tickets${query}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudieron cargar los tickets');
    }

    return response.json();
  },

  getTicket: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudo cargar el ticket');
    }

    return response.json();
  },

  addMessage: async (id, mensaje) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}/mensajes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mensaje })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudo enviar el mensaje');
    }

    return response.json();
  },

  changeStatus: async (id, estado) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}/estado`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(estado)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudo actualizar el estado');
    }

    return response.json();
  },

  closeTicket: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}/cerrar`, {
      method: 'PATCH',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'No se pudo cerrar el ticket');
    }

    return response.json();
  }
};
