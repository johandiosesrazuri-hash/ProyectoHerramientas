import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { CheckCircle, XCircle } from 'lucide-react';
import '../../styles/Admin.css';

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert('Error cargando citas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, estado) => {
    if (window.confirm(`¿Seguro que deseas cambiar el estado a ${estado}?`)) {
      try {
        const updated = await adminService.updateCitaEstado(id, estado);
        setCitas(citas.map(c => c.id === id ? updated : c));
      } catch (err) {
        alert('Error al actualizar estado');
      }
    }
  };

  if (loading) return <div className="admin-loading">Cargando citas...</div>;

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
            {citas.map(c => (
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
