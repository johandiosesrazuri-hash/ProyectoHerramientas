import { useState, useEffect } from 'react';
import citasService from '../services/citasService';
import '../styles/AppointmentModal.css';

const AppointmentModal = ({ isOpen, onClose, doctor }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(null);
  
  // Estados para la reserva
  const [motivo, setMotivo] = useState('');
  const [cargandoReserva, setCargandoReserva] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  useEffect(() => {
    if (mensajeError) {
      const timer = setTimeout(() => setMensajeError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajeError]);

  // Cargar horarios disponibles
  useEffect(() => {
    if (!isOpen || !doctor?.id) return;

    const cargarHorarios = async () => {
      try {
        setCargandoHorarios(true);
        setErrorHorarios(null);

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const fechaFormato = `${year}-${month}-${day}`;
        const slotsDelBackend = await citasService.obtenerSlotsDisponibles(
          doctor.id,
          fechaFormato
        );

        const horariosTransformados = slotsDelBackend.map((slot) => ({
          id: slot.id,
          time: slot.horaInicio,
          available: slot.estado === 'DISPONIBLE',
          horaFin: slot.horaFin
        }));

        setHorarios(horariosTransformados);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setErrorHorarios('No se pudieron cargar los horarios.');
      } finally {
        setCargandoHorarios(false);
      }
    };

    cargarHorarios();
  }, [isOpen, selectedDate, doctor?.id]);

  // Limpiar formulario al cambiar de fecha
  useEffect(() => {
    setSelectedSlot(null);
    setMotivo('');
    setMensajeError(null);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleDayClick = (day) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const handleTimeSlotClick = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot.id === selectedSlot ? null : slot.id);
      setMensajeError(null);
    }
  };

  // Validar antes de confirmar
  const validarReserva = () => {
    if (!selectedSlot) {
      setMensajeError('Debes seleccionar un horario');
      return false;
    }
    if (!motivo.trim()) {
      setMensajeError('Debes indicar el motivo de la cita');
      return false;
    }
    if (motivo.trim().length < 5) {
      setMensajeError('El motivo debe tener al menos 5 caracteres');
      return false;
    }
    if (motivo.trim().length > 255) {
      setMensajeError('El motivo no puede superar 255 caracteres');
      return false;
    }
    return true;
  };

  const handleConfirmAppointment = async () => {
    if (!validarReserva()) {
      return;
    }

    try {
      setCargandoReserva(true);
      setMensajeError(null);
      setMensajeExito(null);

      const datoCita = {
        slotId: selectedSlot,
        motivo: motivo.trim()
      };

      const respuesta = await citasService.crearCita(datoCita);
      
      setMensajeExito('¡Cita agendada exitosamente!');
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setSelectedSlot(null);
        setMotivo('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error al crear cita:', error);
      setMensajeError(error.message || 'Error al reservar la cita. Intenta nuevamente.');
    } finally {
      setCargandoReserva(false);
    }
  };

  const isDateAvailable = (date) => {
    return true; // Habilitamos todos los días, la disponibilidad real se obtiene de la API de slots
  };

  const isDateSelected = (date) => {
    return selectedDate.getDate() === date.getDate() &&
           selectedDate.getMonth() === date.getMonth() &&
           selectedDate.getFullYear() === date.getFullYear();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const available = isDateAvailable(currentDate);
      const selected = isDateSelected(currentDate);
      const today = isToday(currentDate);

      days.push(
        <button
          key={day}
          className={`calendar-day ${available ? 'available' : 'unavailable'} ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
          onClick={() => handleDayClick(day)}
          disabled={!available}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="appointment-modal-overlay" onClick={onClose}>
      <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">✕</button>

        <div className="modal-header">
          <div className="doctor-info">
            <img
              src={doctor.image || 'https://via.placeholder.com/80'}
              alt={doctor.name}
              className="doctor-image"
            />
            <div className="doctor-details">
              <h2 className="doctor-name">{doctor.name}</h2>
              <p className="doctor-specialty">{doctor.specialty}</p>
              <p className="doctor-office">
                <span className="office-icon"></span> {doctor.office}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-content">
          {mensajeExito && (
            <div className="alert alert-success" role="alert">
              ✓ {mensajeExito}
            </div>
          )}
          
          {mensajeError && (
            <div className="alert alert-error" role="alert">
              ✗ {mensajeError}
            </div>
          )}

          <div className="calendar-section">
            <h3 className="section-title">Selecciona una Fecha</h3>
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Mes anterior">←</button>
              <h4 className="calendar-title">
                {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h4>
              <button className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Próximo mes">→</button>
            </div>

            <div className="calendar-weekdays">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {renderCalendarDays()}
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <div className="legend-color unavailable"></div>
                <span>No disponible</span>
              </div>
            </div>
          </div>

          <div className="timeslots-section">
            <h3 className="section-title">Horarios Disponibles</h3>
            <p className="timeslots-date">
              {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="timeslots-grid">
              {cargandoHorarios && <p className="timeslot-loading">Cargando horarios...</p>}
              {!cargandoHorarios && errorHorarios && <p className="timeslot-error">{errorHorarios}</p>}
              {!cargandoHorarios && horarios.map((slot) => (
                <button
                  key={slot.id}
                  className={`timeslot-card ${!slot.available ? 'unavailable' : ''} ${selectedSlot === slot.id ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotClick(slot)}
                  disabled={!slot.available}
                >
                  <span className="timeslot-time">{slot.time}</span>
                  {!slot.available && <span className="timeslot-status">Ocupado</span>}
                </button>
              ))}
              {!cargandoHorarios && horarios.length === 0 && <p className="no-slots-message">No hay horarios disponibles para esta fecha.</p>}
            </div>
          </div>
        </div>

        <div className="modal-appointment-details">
          {selectedSlot && (
            <div className="appointment-summary">
              <h4 className="summary-title">Resumen de tu cita</h4>
              <div className="summary-content">
                <div className="summary-row">
                  <span className="summary-label">Doctor:</span>
                  <span className="summary-value">{doctor.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Especialidad:</span>
                  <span className="summary-value">{doctor.specialty}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Fecha:</span>
                  <span className="summary-value">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {horarios.find(h => h.id === selectedSlot) && (
                  <div className="summary-row">
                    <span className="summary-label">Hora:</span>
                    <span className="summary-value">
                      {horarios.find(h => h.id === selectedSlot).time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="motivo" className="form-label">
              Motivo de la cita <span className="required"></span>
            </label>
            <textarea
              id="motivo"
              className={`form-textarea ${mensajeError && !motivo.trim() ? 'error' : ''}`}
              placeholder="Describe brevemente el motivo de tu cita..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setMensajeError(null);
              }}
              disabled={cargandoReserva}
              rows={3}
              maxLength={255}
            />
            <div className="form-help">
              {motivo.length}/255 caracteres
              {motivo.trim().length < 5 && motivo.trim().length > 0 && (
                <span className="text-warning"> (mínimo 5 caracteres)</span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={cargandoReserva}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirmAppointment} 
            disabled={!selectedSlot || !motivo.trim() || cargandoReserva}
          >
            {cargandoReserva ? (
              <>
                <span className="spinner"></span> Confirmando...
              </>
            ) : (
              'Confirmar Cita'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
