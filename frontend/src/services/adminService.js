import { authUtils } from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = authUtils.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const adminService = {
  // Stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    return res.json();
  },

  // Usuarios
  getUsuarios: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  },
  updateUsuario: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    return res.json();
  },
  deleteUsuario: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar usuario');
  },

  // Doctores
  getDoctores: async () => {
    const res = await fetch(`${API_BASE_URL}/doctores`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener doctores');
    return res.json();
  },
  createDoctor: async (data) => {
    const res = await fetch(`${API_BASE_URL}/doctores/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.message || 'Error al crear doctor');
    }
    return res.json();
  },
  updateDoctor: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/doctores/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar doctor');
    return res.json();
  },
  deleteDoctor: async (id) => {
    const res = await fetch(`${API_BASE_URL}/doctores/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar doctor');
  },

  // Citas
  getCitas: async () => {
    const res = await fetch(`${API_BASE_URL}/citas`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener citas');
    return res.json();
  },
  updateCitaEstado: async (id, estado) => {
    const res = await fetch(`${API_BASE_URL}/citas/${id}/estado`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado })
    });
    if (!res.ok) throw new Error('Error al cambiar estado de la cita');
    return res.json();
  },

  // Especialidades
  getEspecialidades: async () => {
    const res = await fetch(`${API_BASE_URL}/especialidades`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener especialidades');
    return res.json();
  },
  createEspecialidad: async (data) => {
    const res = await fetch(`${API_BASE_URL}/especialidades`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear especialidad');
    return res.json();
  },
  updateEspecialidad: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/especialidades/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar especialidad');
    return res.json();
  },
  deleteEspecialidad: async (id) => {
    const res = await fetch(`${API_BASE_URL}/especialidades/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar especialidad');
  },

  // Crear Usuario (Admin)
  createUsuario: async (data) => {
    const res = await fetch(`${API_BASE_URL}/users/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear usuario');
    }
    return res.json();
  },

  // Horarios Base
  getHorarios: async (doctorId) => {
    const url = doctorId ? `${API_BASE_URL}/horarios?doctorId=${doctorId}` : `${API_BASE_URL}/horarios`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener horarios base');
    return res.json();
  },
  createHorario: async (data) => {
    const res = await fetch(`${API_BASE_URL}/horarios`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear horario');
    }
    return res.json();
  },
  deleteHorario: async (id) => {
    const res = await fetch(`${API_BASE_URL}/horarios/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar horario');
  },

  // Slots de Citas
  getSlots: async (doctorId, fecha) => {
    let url = `${API_BASE_URL}/slots`;
    if (doctorId || fecha) {
      const params = new URLSearchParams();
      if (doctorId) params.append('doctorId', doctorId);
      if (fecha) params.append('fecha', fecha);
      url += `?${params.toString()}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener slots');
    return res.json();
  },
  generateSlots: async (data) => {
    const res = await fetch(`${API_BASE_URL}/slots/generar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al generar slots');
    }
    return res.json();
  }
};
