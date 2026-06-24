import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Edit2, Trash2, Plus, Calendar } from 'lucide-react';
import '../../styles/Admin.css';

const AdminDoctores = () => {
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctores();
  }, []);

  const loadDoctores = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDoctores();
      setDoctores(data);
    } catch (error) {
      console.error(error);
      alert('Error cargando doctores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este doctor?')) {
      try {
        await adminService.deleteDoctor(id);
        setDoctores(doctores.filter(d => d.id !== id));
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  if (loading) return <div className="admin-loading">Cargando doctores...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Gestión de Médicos</h2>
        <p>Administra el catálogo de médicos y sus especialidades</p>
      </div>

      <div className="admin-toolbar">
        <div></div>
        <button className="admin-btn-primary">
          <Plus size={18} />
          Nuevo Médico
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Especialidades</th>
              <th>Consultorio</th>
              <th>Exp. (Años)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {doctores.map(d => (
              <tr key={d.id}>
                <td>#{d.id}</td>
                <td>{d.nombre}</td>
                <td>{d.especialidad}</td>
                <td>{d.consultorio || '—'}</td>
                <td>{d.experiencia}</td>
                <td>
                  <span className={`admin-badge ${d.estado === 'DISPONIBLE' ? 'PACIENTE' : 'ADMIN'}`}>
                    {d.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" title="Horarios"><Calendar size={16} /></button>
                    <button className="action-btn edit" title="Editar"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(d.id)} title="Eliminar"><Trash2 size={16} /></button>
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

export default AdminDoctores;
