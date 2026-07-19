import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Trash2, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { useToast } from '../Toast';
import '../../styles/Admin.css';

const DIAS_SEMANA = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo'
};

const AdminHorarios = () => {
  const [doctores, setDoctores] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newHorario, setNewHorario] = useState({ diaSemana: 1, horaInicio: '09:00', horaFin: '13:00' });
  const [generationRange, setGenerationRange] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadDoctores();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      loadHorariosBase(selectedDoctorId);
      loadSlots(selectedDoctorId, selectedDate);
    } else {
      setHorarios([]);
      setSlots([]);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      loadSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDate]);

  const loadDoctores = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDoctores();
      setDoctores(data);
      
      const savedDocId = localStorage.getItem('selectedDoctorIdForSchedules');
      if (savedDocId) {
        setSelectedDoctorId(savedDocId);
        localStorage.removeItem('selectedDoctorIdForSchedules');
      } else if (data.length > 0) {
        setSelectedDoctorId(data[0].id.toString());
      }
    } catch (err) {
      showToast('Error al cargar médicos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHorariosBase = async (docId) => {
    try {
      const data = await adminService.getHorarios(docId);
      setHorarios(data);
    } catch (err) {
      showToast('Error al cargar horarios base', 'error');
    }
  };

  const loadSlots = async (docId, date) => {
    try {
      const res = await fetch(`http://localhost:8080/api/doctores/${docId}/slots?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHorario = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    try {
      await adminService.createHorario({
        doctorId: Number(selectedDoctorId),
        diaSemana: Number(newHorario.diaSemana),
        horaInicio: newHorario.horaInicio + ':00',
        horaFin: newHorario.horaFin + ':00'
      });
      showToast('Horario base agregado', 'success');
      loadHorariosBase(selectedDoctorId);
    } catch (err) {
      showToast(err.message || 'Error al agregar horario base', 'error');
    }
  };

  const handleDeleteHorario = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este bloque de horario?')) {
      try {
        await adminService.deleteHorario(id);
        setHorarios(horarios.filter(h => h.id !== id));
        showToast('Horario base eliminado', 'success');
      } catch (err) {
        showToast('Error al eliminar horario base', 'error');
      }
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    try {
      const res = await adminService.generateSlots({
        doctorId: Number(selectedDoctorId),
        fechaInicio: generationRange.fechaInicio,
        fechaFin: generationRange.fechaFin
      });
      showToast(`¡Generación exitosa! Se crearon ${res.slotsGenerados} slots.`, 'success');
      loadSlots(selectedDoctorId, selectedDate);
    } catch (err) {
      showToast(err.message || 'Error al generar slots', 'error');
    }
  };

  // Inline styles to prevent style leak
  const styles = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' },
    card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' },
    title: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' },
    desc: { fontSize: '13px', color: '#6b7280', marginBottom: '16px' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', maxHeight: '250px', overflowY: 'auto' },
    item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' },
    dayName: { fontWeight: '700', color: '#1e293b' },
    timeRange: { fontWeight: '500', color: '#64748b' },
    form: { background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' },
    row: { display: 'flex', gap: '12px', marginBottom: '15px' },
    col6: { flex: 1 },
    slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', maxHeight: '480px', overflowY: 'auto', marginTop: '16px' },
    slotPill: { padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid' },
    DISPONIBLE: { background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' },
    RESERVADO: { background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' },
    CANCELADO: { background: '#fef2f2', color: '#991b1b', borderColor: '#fca5a5' },
    noSlots: { textAlign: 'center', padding: '40px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', fontSize: '14px', marginTop: '20px' },
    noDoc: { textAlign: 'center', padding: '80px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', fontSize: '16px', fontWeight: '500' }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Gestión de Horarios y Disponibilidad</h2>
        <p>Configura la agenda base semanal de los médicos y genera sus slots de atención</p>
      </div>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="doctorSelector" style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>Seleccionar Médico</label>
          <select
            id="doctorSelector"
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            disabled={loading}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', minWidth: '250px' }}
          >
            <option value="">{loading ? 'Cargando médicos...' : '-- Seleccione un doctor --'}</option>
            {!loading && doctores.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.nombre} ({doc.especialidad})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedDoctorId ? (
        <div style={styles.grid}>
          {/* Columna Izquierda: Horarios Base */}
          <div>
            <div style={styles.card}>
              <h3 style={styles.title}><Clock size={20} color="var(--color-primary)" /> Horario Base Semanal</h3>
              <p style={styles.desc}>
                Define las franjas horarias en las que este médico atiende usualmente cada día de la semana.
              </p>

              <div style={styles.list}>
                {horarios.map(h => (
                  <div key={h.id} style={styles.item}>
                    <span style={styles.dayName}>{DIAS_SEMANA[h.diaSemana]}</span>
                    <span style={styles.timeRange}>{h.horaInicio.slice(0, 5)} - {h.horaFin.slice(0, 5)}</span>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteHorario(h.id)}
                      title="Eliminar Horario Base"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {horarios.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '20px' }}>No hay horarios base registrados.</p>
                )}
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '15px', fontWeight: '700' }}>Agregar Franja Horaria</h4>
              <form onSubmit={handleCreateHorario} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Día de la semana</label>
                  <select
                    value={newHorario.diaSemana}
                    onChange={e => setNewHorario({ ...newHorario, diaSemana: e.target.value })}
                    style={styles.input}
                  >
                    {Object.entries(DIAS_SEMANA).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.row}>
                  <div style={styles.col6}>
                    <label style={styles.label}>Hora Inicio</label>
                    <input
                      type="time"
                      value={newHorario.horaInicio}
                      onChange={e => setNewHorario({ ...newHorario, horaInicio: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.col6}>
                    <label style={styles.label}>Hora Fin</label>
                    <input
                      type="time"
                      value={newHorario.horaFin}
                      onChange={e => setNewHorario({ ...newHorario, horaFin: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="admin-btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                  <Plus size={16} /> Agregar Horario Base
                </button>
              </form>
            </div>

            {/* Generación Masiva de Slots */}
            <div style={{ ...styles.card, marginTop: '24px' }}>
              <h3 style={styles.title}><Sparkles size={20} color="var(--color-primary)" /> Generar Agenda (Slots)</h3>
              <p style={styles.desc}>
                Crea turnos de 30 minutos basados en el horario base semanal para el rango de fechas seleccionado.
              </p>

              <form onSubmit={handleGenerateSlots}>
                <div style={styles.row}>
                  <div style={styles.col6}>
                    <label style={styles.label}>Fecha Inicio</label>
                    <input
                      type="date"
                      value={generationRange.fechaInicio}
                      onChange={e => setGenerationRange({ ...generationRange, fechaInicio: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.col6}>
                    <label style={styles.label}>Fecha Fin</label>
                    <input
                      type="date"
                      value={generationRange.fechaFin}
                      onChange={e => setGenerationRange({ ...generationRange, fechaFin: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  style={{ width: '100%', marginTop: '10px', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                  disabled={horarios.length === 0}
                >
                  Generar Slots de 30 Minutos
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Monitoreo de slots en fecha específica */}
          <div>
            <div style={styles.card}>
              <h3 style={styles.title}><Calendar size={20} color="var(--color-primary)" /> Monitoreo de Turnos</h3>
              <p style={styles.desc}>
                Selecciona un día para visualizar los slots operativos del doctor y ver su estado de reserva.
              </p>

              <div style={{ ...styles.formGroup, maxWidth: '200px' }}>
                <label style={styles.label}>Seleccionar Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.slotsGrid}>
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    style={{
                      ...styles.slotPill,
                      ...(slot.estado === 'DISPONIBLE' ? styles.DISPONIBLE : {}),
                      ...(slot.estado === 'RESERVADO' ? styles.RESERVADO : {}),
                      ...(slot.estado === 'CANCELADO' ? styles.CANCELADO : {})
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{slot.horaInicio.slice(0, 5)} - {slot.horaFin.slice(0, 5)}</span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>{slot.estado}</span>
                  </div>
                ))}
                {slots.length === 0 && (
                  <div style={styles.noSlots}>
                    No hay slots generados para este día. Utilice la herramienta de generación.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.noDoc}>
          Por favor seleccione un médico de la lista desplegable superior para gestionar sus horarios y disponibilidad.
        </div>
      )}
    </div>
  );
};

export default AdminHorarios;
