import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../Toast';
import '../../styles/Admin.css';

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCitas();
      setCitas(data);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar citas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, estado) => {
    if (window.confirm(`¿Seguro que deseas cambiar el estado a ${estado}?`)) {
      try {
        const updated = await adminService.updateCitaEstado(id, estado);
        setCitas(citas.map(c => c.id === id ? updated : c));
        showToast(`Cita actualizada a ${estado} correctamente`, 'success');
      } catch (err) {
        showToast('Error al actualizar estado de la cita', 'error');
      }
    }
  };

  const renderTableSkeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <tr key={n}>
          <td><div className="table-skeleton-bar id shimmer"></div></td>
          <td><div className="table-skeleton-bar shimmer" style={{ width: '85%' }}></div></td>
          <td><div className="table-skeleton-bar shimmer"></div></td>
          <td><div className="table-skeleton-bar shimmer"></div></td>
          <td><div className="table-skeleton-bar badge shimmer"></div></td>
          <td>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="table-skeleton-bar id shimmer" style={{ height: '24px', width: '24px', borderRadius: '6px' }}></div>
              <div className="table-skeleton-bar id shimmer" style={{ height: '24px', width: '24px', borderRadius: '6px' }}></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Monitor de Citas</h2>
        <p>Vista general y control de todas las citas del sistema</p>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha/Hora</th>
              <th>Paciente</th>
              <th>Doctor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? renderTableSkeletons() : citas.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.fecha} {c.horaInicio && c.horaInicio.slice(0,5)}</td>
                <td>{c.pacienteNombre}</td>
                <td>{c.doctorNombre}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCitas;
