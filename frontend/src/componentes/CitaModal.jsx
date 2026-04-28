import React, { useState, useEffect } from 'react';
import { citaService } from '../services/citaService';
import '../styles/CitaModal.css';

const CitaModal = ({ doctor, onClose, onSuccess }) => {
  const [fecha, setFecha] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!fecha || !doctor?.id) return;

    const loadSlots = async () => {
      setLoadingSlots(true);
      setError('');
      setSelectedSlot(null);
      try {
        const data = await citaService.getDoctorSlots(doctor.id, fecha);
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          setError('Sesion expirada. Redirigiendo al login...');
          setTimeout(() => onClose(), 1500);
        } else {
          setError(err.message || 'No se pudieron cargar los horarios.');
        }
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [fecha, doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedSlot) {
      setError('Selecciona un horario disponible.');
      return;
    }
    if (!motivo.trim()) {
      setError('El motivo de la cita es obligatorio.');
      return;
    }

    setLoadingSubmit(true);
    try {
      const data = await citaService.createCita(selectedSlot.id, motivo.trim());
      setSuccessMsg('Cita agendada correctamente.');
      setMotivo('');
      setSelectedSlot(null);
      if (onSuccess) onSuccess(data);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setError('Sesion expirada. Redirigiendo al login...');
        setTimeout(() => onClose(), 1500);
      } else if (err.status === 409) {
        setError('El horario seleccionado ya no esta disponible.');
      } else {
        setError(err.message || 'Error al agendar la cita.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.slice(0, 5);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agendar Cita</h2>
          <button className="modal-close" type="button" onClick={onClose}>x</button>
        </div>

        <div className="modal-body">
          <p className="modal-doctor">
            <strong>Doctor:</strong> {doctor?.nombre}
          </p>
          <p className="modal-especialidad">
            <strong>Especialidad:</strong> {doctor?.especialidad}
          </p>

          <form onSubmit={handleSubmit} className="cita-form">
            <div className="form-group">
              <label htmlFor="cita-fecha">Fecha</label>
              <input
                id="cita-fecha"
                type="date"
                value={fecha}
                min={today}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            {loadingSlots && (
              <div className="slots-loading">
                <div className="spinner-small" />
                <span>Cargando horarios...</span>
              </div>
            )}

            {!loadingSlots && fecha && slots.length > 0 && (
              <div className="form-group">
                <label>Horarios disponibles</label>
                <div className="slots-grid">
                  {slots
                    .filter((s) => s.estado === 'DISPONIBLE')
                    .map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className={selectedSlot && selectedSlot.id === slot.id ? 'slot-btn selected' : 'slot-btn'}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {formatTime(slot.horaInicio)} - {formatTime(slot.horaFin)}
                      </button>
                    ))}
                </div>
                {slots.filter((s) => s.estado === 'DISPONIBLE').length === 0 && (
                  <p className="slots-empty">No hay horarios disponibles para esta fecha.</p>
                )}
              </div>
            )}

            {!loadingSlots && fecha && slots.length === 0 && !error && (
              <p className="slots-empty">No hay horarios para esta fecha.</p>
            )}

            <div className="form-group">
              <label htmlFor="cita-motivo">Motivo de la cita</label>
              <textarea
                id="cita-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describe el motivo de tu consulta..."
                rows={3}
                maxLength={255}
                required
              />
              <span className="char-count">{motivo.length}/255</span>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingSubmit || !selectedSlot}
              >
                {loadingSubmit ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CitaModal;
