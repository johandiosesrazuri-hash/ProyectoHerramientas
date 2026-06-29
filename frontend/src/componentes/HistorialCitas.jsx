import React, { useEffect, useState } from 'react';
import { obtenerHistorial } from '../services/citasService';
import '../styles/HistorialCitas.css';

const HistorialCitas = () => {
  const [citas, setCitas] = useState([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistorial();
  }, [search, estado]);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerHistorial({ search: search.trim() || undefined, estado: estado || undefined });
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial.');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-section">
      <div className="history-card">
        <div className="history-card-inner">
          <section className="history-filters">
            <div className="filter-group">
              <label htmlFor="histSearch">Buscar</label>
              <input
                id="histSearch"
                type="text"
                placeholder="Nombre doctor, paciente o especialidad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="histEstado">Estado</label>
              <select id="histEstado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="RESERVADA">Reservada</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="ATENDIDA">Completada</option>
              </select>
            </div>
          </section>

          {loading && <p className="panel-state">Cargando historial...</p>}
          {!loading && error && <p className="panel-state panel-error">{error}</p>}
          {!loading && !error && citas.length === 0 && <p className="panel-state">No hay citas para mostrar.</p>}

          {!loading && citas.length > 0 && (
            <div className="table-responsive">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Doctor</th>
                    <th>Especialidad</th>
                    <th>Consultorio</th>
                    <th>Paciente</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => {
                    const estadoKey = (c.estado || '').toUpperCase();
                    const estadoLabel =
                      estadoKey === 'CONFIRMADA' ? 'Confirmada' :
                      estadoKey === 'RESERVADA' ? 'Reservada' :
                      estadoKey === 'CANCELADA' ? 'Cancelada' :
                      estadoKey === 'ATENDIDA' ? 'Completada' :
                      c.estado || '';

                    const estadoClass =
                      estadoKey === 'CONFIRMADA' || estadoKey === 'ATENDIDA' ? 'ok' :
                      estadoKey === 'CANCELADA' ? 'cancel' :
                      'pending';

                    return (
                      <tr key={c.id}>
                        <td>{c.fecha}</td>
                        <td>{c.horaInicio ? c.horaInicio.slice(0,5) : ''}</td>
                        <td>{c.doctorNombre}</td>
                        <td>{c.especialidad}</td>
                        <td>{c.consultorio || '—'}</td>
                        <td>{c.pacienteNombre || '—'}</td>
                        <td>{c.motivo || '—'}</td>
                        <td>
                          <span className={`status-badge ${estadoClass}`}>{estadoLabel}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HistorialCitas;
