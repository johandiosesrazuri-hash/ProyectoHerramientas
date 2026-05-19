import React, { useEffect, useState } from 'react';
import { citaService } from '../services/citaService';
import '../styles/HistorialCitas.css';

const HistorialCitas = (props) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODAS');

  useEffect(() => {
    loadCitas();
    // Obtener el rol del usuario del localStorage o props
    const role = localStorage.getItem('userRole') || props.userRole || 'PACIENTE';
    setUserRole(role);
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      setError('');
      const role = localStorage.getItem('userRole') || props.userRole || 'PACIENTE';
      
      let citasData;
      if (role === 'DOCTOR') {
        citasData = await citaService.getHistorialDoctor();
      } else {
        citasData = await citaService.getHistorial();
      }
      
      setCitas(Array.isArray(citasData) ? citasData : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (hora) => {
    if (!hora) return '';
    const [hours, minutes] = hora.split(':');
    return `${hours}:${minutes}`;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'RESERVADA':
        return 'estado-reservada';
      case 'COMPLETADA':
        return 'estado-completada';
      case 'CANCELADA':
        return 'estado-cancelada';
      default:
        return 'estado-default';
    }
  };

  const filteredCitas = filterEstado === 'TODAS' 
    ? citas 
    : citas.filter(cita => cita.estado === filterEstado);

  const estadoUnicoValues = ['TODAS', ...new Set(citas.map(c => c.estado))];

  if (loading) {
    return (
      <div className="historial-citas-container loading">
        <p>Cargando historial de citas...</p>
      </div>
    );
  }

  return (
    <div className="historial-citas-container">
      <div className="historial-header">
        <h1>
          {userRole === 'DOCTOR' ? 'Historial de Citas - Doctor' : 'Mis Citas'}
        </h1>
        <button 
          className="btn-refrescar"
          onClick={loadCitas}
          title="Refrescar historial"
        >
          🔄 Refrescar
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadCitas} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      )}

      <div className="filtros-section">
        <label htmlFor="filtro-estado">Filtrar por estado:</label>
        <select 
          id="filtro-estado"
          className="filtro-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          {estadoUnicoValues.map(estado => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        <span className="citas-count">
          {filteredCitas.length} cita{filteredCitas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredCitas.length === 0 ? (
        <div className="empty-state">
          <p>
            {filterEstado !== 'TODAS' 
              ? `No hay citas con estado "${filterEstado}"`
              : 'No hay citas registradas'}
          </p>
        </div>
      ) : (
        <div className="citas-grid">
          {filteredCitas.map((cita) => (
            <div key={cita.id} className={`cita-card ${getEstadoColor(cita.estado)}`}>
              <div className="cita-header">
                <div className="cita-fecha-hora">
                  <span className="fecha">{formatDate(cita.fecha)}</span>
                  <span className="hora">
                    {formatTime(cita.horaInicio)} - {formatTime(cita.horaFin)}
                  </span>
                </div>
                <span className={`estado-badge ${getEstadoColor(cita.estado)}`}>
                  {cita.estado}
                </span>
              </div>

              <div className="cita-content">
                <div className="info-row">
                  <span className="label">ID Cita:</span>
                  <span className="value">#{cita.id}</span>
                </div>

                {userRole === 'DOCTOR' && cita.pacienteNombre && (
                  <div className="info-row">
                    <span className="label">Paciente:</span>
                    <span className="value">{cita.pacienteNombre}</span>
                  </div>
                )}

                {userRole === 'DOCTOR' && cita.pacienteEmail && (
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{cita.pacienteEmail}</span>
                  </div>
                )}

                {userRole !== 'DOCTOR' && cita.doctorNombre && (
                  <div className="info-row">
                    <span className="label">Doctor:</span>
                    <span className="value">{cita.doctorNombre}</span>
                  </div>
                )}

                {cita.motivo && (
                  <div className="info-row">
                    <span className="label">Motivo:</span>
                    <span className="value motivo">{cita.motivo}</span>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">Slot ID:</span>
                  <span className="value">{cita.slotId}</span>
                </div>
              </div>

              <div className="cita-footer">
                <span className="fecha-creacion">
                  Registrada: {new Date(cita.createdAt || new Date()).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialCitas;
