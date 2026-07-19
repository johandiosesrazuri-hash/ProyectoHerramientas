const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const obtenerSlotsDisponibles = async (doctorId, fecha) => {
  if (!doctorId || !fecha) {
    throw new Error('doctorId y fecha son requeridos');
  }

  const endpoint = `${BASE_URL}/doctores/${doctorId}/slots`;
  const queryParams = new URLSearchParams({ date: fecha });

  const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar los slots`);
  }

  const slots = await response.json();

  if (!Array.isArray(slots)) {
    throw new Error('Formato de respuesta inválido');
  }

  return slots;
};

export const obtenerFechasDisponibles = async (doctorId, desde) => {
  if (!doctorId) {
    throw new Error('doctorId es requerido');
  }

  const endpoint = `${BASE_URL}/doctores/${doctorId}/disponibilidad`;
  const queryParams = new URLSearchParams();
  if (desde) queryParams.append('desde', desde);

  const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar las fechas disponibles`);
  }

  const fechas = await response.json();
  if (!Array.isArray(fechas)) {
    throw new Error('Formato de respuesta inválido');
  }

  return fechas;
};

export const obtenerDoctores = async (search, especialidad) => {
  const endpoint = `${BASE_URL}/doctores`;
  const queryParams = new URLSearchParams();
  
  if (search) queryParams.append('search', search);
  if (especialidad) queryParams.append('especialidad', especialidad);

  const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    }
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar los doctores`);
  }

  const doctores = await response.json();
  return Array.isArray(doctores) ? doctores : [];
};

export const crearCita = async (datoCita) => {
  if (!datoCita || !datoCita.slotId || !datoCita.motivo) {
    throw new Error('slotId y motivo son requeridos');
  }

  if (typeof datoCita.motivo !== 'string' || datoCita.motivo.trim().length === 0) {
    throw new Error('El motivo no puede estar vacío');
  }

  const endpoint = `${BASE_URL}/citas`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({
      slotId: datoCita.slotId,
      motivo: datoCita.motivo.trim()
    })
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Si no es JSON, usar mensaje por defecto
      if (response.status === 409) {
        errorMessage = 'El horario ya no está disponible. Fue reservado por otro usuario.';
      } else if (response.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (response.status === 403) {
        errorMessage = 'No tienes permisos para reservar citas.';
      } else {
        errorMessage = 'No se pudo crear la cita. Intenta nuevamente.';
      }
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};

export default {
  obtenerSlotsDisponibles,
  obtenerDoctores,
  crearCita,
  obtenerFechasDisponibles
};

export const obtenerHistorial = async ({ search, estado } = {}) => {
  const endpoint = `${BASE_URL}/citas/historial`;
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (estado) params.append('estado', estado);

  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Error ${response.status}: no se pudo cargar el historial`);
  }

  return await response.json();
};
