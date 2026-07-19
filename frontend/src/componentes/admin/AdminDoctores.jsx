import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Edit2, Trash2, Plus, Calendar } from 'lucide-react';
import { useToast } from '../Toast';
import '../../styles/Admin.css';
import '../../styles/AppointmentModal.css';

const AdminDoctores = ({ onNavigate }) => {
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    experienciaAnios: '',
    consultorio: '',
    fotoUrl: '',
    email: '',
    password: '',
    clinicaId: 1,
    especialidadIds: []
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, specs] = await Promise.all([
        adminService.getDoctores(),
        adminService.getEspecialidades()
      ]);
      setDoctores(docs);
      setEspecialidades(specs);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar datos de médicos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este médico?')) {
      try {
        await adminService.deleteDoctor(id);
        setDoctores(doctores.filter(d => d.id !== id));
        showToast('Médico eliminado correctamente', 'success');
      } catch (err) {
        showToast('Error al eliminar médico', 'error');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      nombre: '',
      apellido: '',
      experienciaAnios: '',
      consultorio: '',
      fotoUrl: '',
      email: '',
      password: '',
      clinicaId: 1,
      especialidadIds: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    const parts = doctor.nombre.split(' ');
    const nombre = parts[0] || '';
    const apellido = parts.slice(1).join(' ') || '';

    const doctorSpecNames = doctor.especialidad.split(',').map(s => s.trim());
    const matchedIds = especialidades
      .filter(spec => doctorSpecNames.includes(spec.nombre))
      .map(spec => spec.id);

    setEditingDoctor(doctor);
    setFormData({
      nombre,
      apellido,
      experienciaAnios: doctor.experiencia || 0,
      consultorio: doctor.consultorio || '',
      fotoUrl: doctor.foto || '',
      email: doctor.email || '',
      password: '',
      clinicaId: 1,
      especialidadIds: matchedIds
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleCheckboxChange = (specId) => {
    setFormData(prev => {
      const alreadySelected = prev.especialidadIds.includes(specId);
      const updated = alreadySelected
        ? prev.especialidadIds.filter(id => id !== specId)
        : [...prev.especialidadIds, specId];
      return { ...prev, especialidadIds: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      showToast('Nombre y apellido son obligatorios', 'error');
      return;
    }

    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim(),
      password: formData.password,
      experienciaAnios: parseInt(formData.experienciaAnios) || 0,
      consultorio: formData.consultorio.trim(),
      fotoUrl: formData.fotoUrl.trim() || 'https://via.placeholder.com/150',
      clinicaId: Number(formData.clinicaId) || 1,
      especialidadIds: formData.especialidadIds
    };

    try {
      if (editingDoctor) {
        const updated = await adminService.updateDoctor(editingDoctor.id, payload);
        setDoctores(doctores.map(d => d.id === editingDoctor.id ? updated : d));
        showToast('Médico actualizado correctamente', 'success');
      } else {
        const nuevo = await adminService.createDoctor(payload);
        setDoctores([...doctores, nuevo]);
        showToast('Médico creado correctamente', 'success');
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Error al guardar médico', 'error');
    }
  };

  const handleGoToSchedules = (doctor) => {
    localStorage.setItem('selectedDoctorIdForSchedules', doctor.id);
    if (onNavigate) {
      onNavigate('admin-horarios');
    }
  };

  const renderTableSkeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <tr key={n}>
          <td><div className="table-skeleton-bar id shimmer"></div></td>
          <td><div className="table-skeleton-bar shimmer" style={{ width: '70%' }}></div></td>
          <td><div className="table-skeleton-bar shimmer"></div></td>
          <td><div className="table-skeleton-bar short shimmer"></div></td>
          <td><div className="table-skeleton-bar id shimmer" style={{ width: '20px' }}></div></td>
          <td><div className="table-skeleton-bar badge shimmer"></div></td>
          <td>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="table-skeleton-bar id shimmer" style={{ height: '24px', width: '24px', borderRadius: '6px' }}></div>
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
        <h2>Gestión de Médicos</h2>
        <p>Administra el catálogo de médicos y sus especialidades</p>
      </div>

      <div className="admin-toolbar">
        <div></div>
        <button className="admin-btn-primary" onClick={handleOpenCreateModal} disabled={loading}>
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
            {loading ? renderTableSkeletons() : doctores.map(d => (
              <tr key={d.id}>
                <td>#{d.id}</td>
                <td>{d.nombre}</td>
                <td>{d.especialidad || '—'}</td>
                <td>{d.consultorio || '—'}</td>
                <td>{d.experiencia}</td>
                <td>
                  <span className={`admin-badge ${d.estado === 'DISPONIBLE' ? 'PACIENTE' : 'ADMIN'}`}>
                    {d.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" onClick={() => handleGoToSchedules(d)} title="Horarios & Slots"><Calendar size={16} /></button>
                    <button className="action-btn edit" onClick={() => handleOpenEditModal(d)} title="Editar"><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(d.id)} title="Eliminar"><Trash2 size={16} /></button>
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
          <div className="appointment-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar modal">✕</button>
            <div className="modal-header" style={{ padding: '24px' }}>
              <h2 className="doctor-name" style={{ margin: 0, fontSize: '20px' }}>
                {editingDoctor ? 'Editar Médico' : 'Nuevo Médico'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="nombreDoc">Nombre</label>
                    <input
                      id="nombreDoc"
                      type="text"
                      className="form-textarea"
                      style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                      placeholder="Ej. Carlos"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="apellidoDoc">Apellido</label>
                    <input
                      id="apellidoDoc"
                      type="text"
                      className="form-textarea"
                      style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                      placeholder="Ej. Mendoza"
                      value={formData.apellido}
                      onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {!editingDoctor && (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="emailDoc">Correo Electrónico (Usuario Médico)</label>
                      <input
                        id="emailDoc"
                        type="email"
                        className="form-textarea"
                        style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                        placeholder="Ej. carlos.mendoza@clinica.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required={!editingDoctor}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="passwordDoc">Contraseña (Usuario Médico)</label>
                      <input
                        id="passwordDoc"
                        type="password"
                        className="form-textarea"
                        style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                        placeholder="Ej. secreta123"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required={!editingDoctor}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="experienciaDoc">Años de Experiencia</label>
                    <input
                      id="experienciaDoc"
                      type="number"
                      className="form-textarea"
                      style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                      placeholder="Ej. 10"
                      value={formData.experienciaAnios}
                      onChange={e => setFormData({ ...formData, experienciaAnios: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="consultorioDoc">Consultorio</label>
                    <input
                      id="consultorioDoc"
                      type="text"
                      className="form-textarea"
                      style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                      placeholder="Ej. B-204"
                      value={formData.consultorio}
                      onChange={e => setFormData({ ...formData, consultorio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fotoUrlDoc">Foto URL (Opcional)</label>
                  <input
                    id="fotoUrlDoc"
                    type="text"
                    className="form-textarea"
                    style={{ minHeight: 'unset', padding: '10px', background: '#f9fafb' }}
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={formData.fotoUrl}
                    onChange={e => setFormData({ ...formData, fotoUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Especialidades</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    padding: '14px',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: '10px',
                    background: '#f9fafb',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {especialidades.map(spec => (
                      <label key={spec.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--neutral-700)', fontWeight: '600' }}>
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          checked={formData.especialidadIds.includes(spec.id)}
                          onChange={() => handleCheckboxChange(spec.id)}
                        />
                        <span>{spec.nombre}</span>
                      </label>
                    ))}
                    {especialidades.length === 0 && (
                      <p style={{ gridColumn: '1 / -1', color: '#6b7280', fontSize: '13px' }}>No hay especialidades registradas.</p>
                    )}
                  </div>
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

export default AdminDoctores;
