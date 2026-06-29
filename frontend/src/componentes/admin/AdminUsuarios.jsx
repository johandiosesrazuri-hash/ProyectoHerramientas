import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useToast } from '../Toast';
import '../../styles/Admin.css';
import '../../styles/AppointmentModal.css';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'PACIENTE' });

  const { showToast } = useToast();

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
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
      try {
        await adminService.deleteUsuario(id);
        setUsuarios(usuarios.filter(u => u.id !== id));
        showToast('Usuario eliminado correctamente', 'success');
      } catch (err) {
        showToast('Error al eliminar usuario', 'error');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'PACIENTE' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ nombre: user.nombre, email: user.email, password: '', rol: user.rol });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'PACIENTE' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.rol) {
      showToast('Por favor, rellene todos los campos requeridos', 'error');
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      showToast('La contraseña es obligatoria y debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (editingUser && !formData.password) {
      showToast('Por favor ingrese una contraseña (nueva o actual) para confirmar cambios de seguridad', 'info');
      return;
    }

    const body = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      rol: formData.rol,
      password: formData.password
    };

    try {
      if (editingUser) {
        const updated = await adminService.updateUsuario(editingUser.id, body);
        setUsuarios(usuarios.map(u => u.id === editingUser.id ? updated : u));
        showToast('Usuario actualizado correctamente', 'success');
      } else {
        const nuevo = await adminService.createUsuario(body);
        setUsuarios([...usuarios, nuevo]);
        showToast('Usuario creado correctamente', 'success');
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Error al guardar usuario', 'error');
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
        <div></div>
        <button className="admin-btn-primary" onClick={handleOpenCreateModal}>
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
                    <button className="action-btn edit" onClick={() => handleOpenEditModal(u)} title="Editar"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(u.id)} title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form using native Overlay & Modal */}
      {isModalOpen && (
        <div className="appointment-modal-overlay" onClick={handleCloseModal}>
          <div className="appointment-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar modal">✕</button>
            <div className="modal-header" style={{ padding: '24px' }}>
              <h2 className="doctor-name" style={{ margin: 0, fontSize: '20px' }}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">Nombre Completo</label>
                  <input
                    id="nombre"
                    type="text"
                    className="form-textarea"
                    style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                    placeholder="Ej. Juan Pérez"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-textarea"
                    style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                    placeholder="Ej. juan.perez@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Contraseña {editingUser && '(requerida para guardar)'}
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-textarea"
                    style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                    placeholder={editingUser ? "Ingrese contraseña para confirmar" : "Mínimo 6 caracteres"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rol">Rol del Usuario</label>
                  <select
                    id="rol"
                    className="form-textarea"
                    style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                    value={formData.rol}
                    onChange={e => setFormData({ ...formData, rol: e.target.value })}
                    required
                  >
                    <option value="PACIENTE">Paciente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px 24px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
