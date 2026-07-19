import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../Toast';
import '../../styles/Admin.css'; // Reutilizamos estilos

const DoctorCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas/historial');
      setCitas(response.data);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar tus citas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, estado) => {
    if (window.confirm(`¿Seguro que deseas cambiar el estado a ${estado}?`)) {
      try {
        const response = await api.put(`/citas/${id}/estado`, { estado });
        
        // Actualizamos localmente el estado de la cita
        setCitas(citas.map(c => c.id === id ? { ...c, estado: response.data.estado } : c));
        showToast(`Cita actualizada a ${estado} correctamente`, 'success');
      } catch (err) {
        showToast('Error al actualizar estado de la cita', 'error');
      }
    }
  };

  if (loading) return <div className="admin-loading">Cargando citas...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Monitor de Citas (Doctor)</h2>
        <p>Vista general y control de todas tus citas reservadas por pacientes</p>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha/Hora</th>
              <th>Paciente</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.fecha} {c.horaInicio && c.horaInicio.slice(0,5)}</td>
                <td>{c.pacienteNombre}</td>
                <td>{c.motivo || 'N/A'}</td>
                <td>
                  <span className={`admin-badge ${c.estado === 'RESERVADA' ? 'MEDICO' : c.estado === 'CANCELADA' ? 'ADMIN' : 'PACIENTE'}`}>
                    {c.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {c.estado === 'RESERVADA' && (
                      <>
                        <button className="action-btn edit" onClick={() => handleUpdateEstado(c.id, 'CONFIRMADA')} title="Confirmar"><CheckCircle size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleUpdateEstado(c.id, 'CANCELADA')} title="Cancelar"><XCircle size={16} /></button>
                      </>
                    )}
                    {c.estado === 'CONFIRMADA' && (
                      <button className="action-btn edit" onClick={() => handleUpdateEstado(c.id, 'ATENDIDA')} title="Marcar Atendida"><CheckCircle size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {citas.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No tienes citas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorCitas;
