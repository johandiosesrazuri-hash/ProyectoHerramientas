import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Edit2, Trash2, Plus } from 'lucide-react';
import '../../styles/Admin.css';

const AdminEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEspecialidades();
  }, []);

  const loadEspecialidades = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEspecialidades();
      setEspecialidades(data);
    } catch (error) {
      console.error(error);
      alert('Error cargando especialidades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta especialidad?')) {
      try {
        await adminService.deleteEspecialidad(id);
        setEspecialidades(especialidades.filter(e => e.id !== id));
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const handleCreatePrompt = async () => {
    const nombre = prompt('Nombre de la nueva especialidad:');
    if (nombre && nombre.trim()) {
      const descripcion = prompt('Descripción (opcional):');
      try {
        const nueva = await adminService.createEspecialidad({ nombre: nombre.trim(), descripcion });
        setEspecialidades([...especialidades, nueva]);
      } catch (err) {
        alert('Error al crear especialidad');
      }
    }
  };

  if (loading) return <div className="admin-loading">Cargando especialidades...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Catálogo de Especialidades</h2>
        <p>Gestiona las ramas médicas disponibles en la clínica</p>
      </div>

      <div className="admin-toolbar">
        <div></div>
        <button className="admin-btn-primary" onClick={handleCreatePrompt}>
          <Plus size={18} />
          Nueva Especialidad
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {especialidades.map(e => (
              <tr key={e.id}>
                <td>#{e.id}</td>
                <td><strong>{e.nombre}</strong></td>
                <td>{e.descripcion || '—'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" title="Editar"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(e.id)} title="Eliminar"><Trash2 size={16} /></button>
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

export default AdminEspecialidades;
