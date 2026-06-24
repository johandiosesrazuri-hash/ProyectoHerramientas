import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useToast } from '../Toast';
import '../../styles/Admin.css';
import '../../styles/AppointmentModal.css';

const AdminEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const { showToast } = useToast();

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
      showToast('Error cargando especialidades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta especialidad?')) {
      try {
        await adminService.deleteEspecialidad(id);
        setEspecialidades(especialidades.filter(e => e.id !== id));
        showToast('Especialidad eliminada correctamente', 'success');
      } catch (err) {
        showToast('Error al eliminar especialidad', 'error');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSpecialty(null);
    setFormData({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (specialty) => {
    setEditingSpecialty(specialty);
    setFormData({ nombre: specialty.nombre, descripcion: specialty.descripcion || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSpecialty(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showToast('El nombre de la especialidad es obligatorio', 'error');
      return;
    }

    try {
      if (editingSpecialty) {
        const updated = await adminService.updateEspecialidad(editingSpecialty.id, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim()
        });
        setEspecialidades(especialidades.map(e => e.id === editingSpecialty.id ? updated : e));
        showToast('Especialidad actualizada correctamente', 'success');
      } else {
        const nueva = await adminService.createEspecialidad({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim()
        });
        setEspecialidades([...especialidades, nueva]);
        showToast('Especialidad creada correctamente', 'success');
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Error al guardar especialidad', 'error');
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
        <button className="admin-btn-primary" onClick={handleOpenCreateModal}>
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
                    <button className="action-btn edit" onClick={() => handleOpenEditModal(e)} title="Editar"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(e.id)} title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form reusing native Overlay & Modal */}
      {isModalOpen && (
        <div className="appointment-modal-overlay" onClick={handleCloseModal}>
          <div className="appointment-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar modal">✕</button>
            <div className="modal-header" style={{ padding: '24px' }}>
              <h2 className="doctor-name" style={{ margin: 0, fontSize: '20px' }}>
                {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    className="form-textarea"
                    style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                    placeholder="Ej. Cardiología"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    className="form-textarea"
                    style={{ background: '#f9fafb' }}
                    placeholder="Descripción corta de la especialidad..."
                    value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={4}
                  />
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

export default AdminEspecialidades;
