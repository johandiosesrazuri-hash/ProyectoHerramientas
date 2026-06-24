import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Edit2, Trash2, Plus } from 'lucide-react';
import '../../styles/Admin.css';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      alert('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
      try {
        await adminService.deleteUsuario(id);
        setUsuarios(usuarios.filter(u => u.id !== id));
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  if (loading) return <div className="admin-loading">Cargando usuarios...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administra los pacientes, médicos y administradores</p>
      </div>

      <div className="admin-toolbar">
        <div></div> {/* Placeholder for search */}
        <button className="admin-btn-primary">
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`admin-badge ${u.rol}`}>{u.rol}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" title="Editar"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(u.id)} title="Eliminar"><Trash2 size={16} /></button>
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

export default AdminUsuarios;
