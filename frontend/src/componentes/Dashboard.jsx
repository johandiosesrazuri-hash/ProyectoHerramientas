import React, { useEffect, useMemo, useState } from 'react';
import { doctorService } from '../services/doctorService';
import AppointmentModal from './AppointmentModal';
import HistorialCitas from './HistorialCitas';
import Sidebar from './Sidebar';
import logoSkipline from '../assets/images/logo.png';
import '../styles/Dashboard.css';

import AdminDashboard from './admin/AdminDashboard';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminDoctores from './admin/AdminDoctores';
import AdminCitas from './admin/AdminCitas';
import AdminEspecialidades from './admin/AdminEspecialidades';
import AdminHorarios from './admin/AdminHorarios';
import Soporte from './Soporte';
import { supportService } from '../services/supportService';

const Dashboard = (props) => {
  const [doctores, setDoctores] = useState([]);
  const [search, setSearch] = useState('');
  const [especialidad, setEspecialidad] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentView, setCurrentView] = useState('medicos');
  const [ayudaNombre, setAyudaNombre] = useState('');
  const [ayudaEmail, setAyudaEmail] = useState('');
  const [ayudaTipo, setAyudaTipo] = useState('cita');
  const [ayudaMensaje, setAyudaMensaje] = useState('');
  const [ayudaSuccess, setAyudaSuccess] = useState('');
  const [ayudaError, setAyudaError] = useState('');

  const [especialidadesList, setEspecialidadesList] = useState(['Todas']);

  useEffect(() => {
    loadDoctores();
  }, [search, especialidad]);

  useEffect(() => {
    loadEspecialidades();
  }, []);

  const loadEspecialidades = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/especialidades', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        const names = data.map(item => item.nombre);
        setEspecialidadesList(['Todas', ...names]);
      }
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
    }
  };

  const loadDoctores = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await doctorService.listDoctors({
        search: search.trim() || undefined,
        especialidad: especialidad === 'Todas' ? undefined : especialidad
      });
      setDoctores(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los doctores.');
      setDoctores([]);
    } finally {
      setLoading(false);
    }
  };

  const doctoresDisponibles = useMemo(
    () => doctores.filter((doctor) => doctor.estado === 'DISPONIBLE').length,
    [doctores]
  );

  const formatProximaCita = (doctor) => {
    if (!doctor.proximaFechaDisponible || !doctor.proximaHoraDisponible) {
      return 'Proxima cita: Sin disponibilidad';
    }

    return `Proxima cita: ${doctor.proximaFechaDisponible} ${doctor.proximaHoraDisponible.slice(0, 5)}`;
  };

  const handleOpenModal = (doctor) => {
    setSelectedDoctor({
      id: doctor.id,
      name: doctor.nombre,
      specialty: doctor.especialidad,
      office: `Consultorio ${doctor.consultorio || 'N/A'}`,
      image: 'https://via.placeholder.com/80',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleAyudaSubmit = async (event) => {
    event.preventDefault();
    setAyudaSuccess('');
    setAyudaError('');

    if (!ayudaNombre.trim() || !ayudaEmail.trim() || !ayudaMensaje.trim()) {
      setAyudaError('Completa todos los campos para enviar tu solicitud de soporte.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const asunto = `${ayudaTipo === 'cita' ? 'Cita' : ayudaTipo === 'acceso' ? 'Acceso' : ayudaTipo === 'pago' ? 'Pago' : 'Consulta'}: ${ayudaNombre}`;
      await supportService.createTicket({
        asunto,
        mensaje: `${ayudaMensaje}\n\nCorreo: ${ayudaEmail}\nTipo: ${ayudaTipo}\nUsuario: ${user.nombre || 'Paciente'}`
      });
      setAyudaSuccess('Tu mensaje ha sido enviado y se creó un ticket de soporte.');
      setAyudaNombre('');
      setAyudaEmail('');
      setAyudaTipo('cita');
      setAyudaMensaje('');
    } catch (err) {
      setAyudaError(err.message || 'No se pudo crear el ticket de soporte.');
    }
  };

  const isSupportActive = currentView === 'soporte';

  const renderMedicosView = () => (
    <>
      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Doctores Disponibles</p>
          <p className="stat-value">{doctoresDisponibles}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Especialidades</p>
          <p className="stat-value">{Math.max(especialidadesList.length - 1, 0)}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Total de Doctores</p>
          <p className="stat-value">{doctores.length}</p>
        </article>
      </section>

      <section className="filters-box">
        <div className="filter-group">
          <label htmlFor="doctorSearch">Buscar Doctor</label>
          <input
            id="doctorSearch"
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="especialidad">Especialidad</label>
          <select
            id="especialidad"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
          >
            {especialidadesList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="doctores-grid">
        {loading && <p className="panel-state">Cargando doctores...</p>}
        {!loading && error && <p className="panel-state panel-error">{error}</p>}
        {!loading && !error && doctores.length === 0 && (
          <p className="panel-state">No hay doctores para mostrar.</p>
        )}

        {doctores.map((doctor) => (
          <article
            key={doctor.id}
            className="doctor-card"
            onClick={() => handleOpenModal(doctor)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOpenModal(doctor);
              }
            }}
          >
            <div className="doctor-card-top">
              <div>
                <h2>{doctor.nombre}</h2>
                <p className="especialidad">{doctor.especialidad}</p>
              </div>
              <span className="rating">#{doctor.id}</span>
            </div>

            <ul className="doctor-meta">
              <li>{doctor.experiencia} años de experiencia</li>
              <li>Consultorio {doctor.consultorio || 'Sin dato'}</li>
              <li>{formatProximaCita(doctor)}</li>
            </ul>

            <p className={`estado ${doctor.estado === 'DISPONIBLE' ? 'ok' : 'off'}`}>
              {doctor.estado === 'DISPONIBLE' ? 'Disponible' : 'Sin cupos por ahora'}
            </p>
          </article>
        ))}
      </section>

      <section className="notice-box">
        <p>
          Solo se muestra informacion de doctores desde base de datos. Citas y horarios todavia no se gestionan desde esta vista.
        </p>
      </section>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-usuarios':
        return <AdminUsuarios />;
      case 'admin-doctores':
        return <AdminDoctores onNavigate={handleNavigate} />;
      case 'admin-horarios':
        return <AdminHorarios />;
      case 'admin-citas':
        return <AdminCitas />;
      case 'admin-especialidades':
        return <AdminEspecialidades />;
        
      case 'perfil':
        return (
          <section className="content-section">
            <h2>Mi Perfil</h2>
            <div className="profile-card">
              <p className="placeholder-text">Tu información de perfil aparecerá aquí</p>
            </div>
          </section>
        );

      case 'historial':
        return (
          <section className="content-section">
            <h2>Historial de Citas</h2>
            <div className="history-card">
              <HistorialCitas />
            </div>
          </section>
        );

      case 'soporte':
        return <Soporte />;

      case 'ayuda':
        return (
          <section className="content-section">
            <h2>Centro de Ayuda</h2>
            <div className="help-card">
              <div className="help-card-content">
                <div className="help-grid">
                  <div className="help-column">
                    <div className="help-section">
                      <h3>¿Cómo podemos ayudarte?</h3>
                      <p className="help-intro">
                        Encuentra respuestas rápidas sobre citas, pagos, horarios, cambios de turno o accesos.
                        Si no logras resolver tu duda, envíanos un mensaje y nuestro equipo de soporte te atenderá.
                      </p>
                    </div>

                    <div className="help-section">
                      <h4><strong>Temas frecuentes</strong></h4>
                      <ul className="help-list">
                        <li>Confirmación y reprogramación de citas</li>
                        <li>Consultas sobre disponibilidad de doctores</li>
                        <li>Problemas de acceso a la plataforma</li>
                        <li>Soporte para cambios de horario o cancelaciones</li>
                      </ul>
                    </div>

                    <div className="help-section">
                      <h4>Ubicación</h4>
                      <p className="help-intro">
                        Puedes encontrarnos en la Universidad Tecnológica del Perú para atención presencial o consultas rápidas.
                      </p>
                      <a
                        className="help-location-link"
                        href="https://maps.google.com/?q=Universidad+Tecnol%C3%B3gica+del+Per%C3%BA"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver en Google Maps
                      </a>
                      <div className="help-map-wrapper">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.508630346021!2d-80.6428643899005!3d-5.182412494773362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x904a1bdf91d8b825%3A0xa4bfa3480b1255ea!2sUniversidad%20Tecnol%C3%B3gica%20Del%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1782584006501!5m2!1ses!2spe"
                          title="Ubicación de soporte"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    <div className="help-section">
                      <h4>Canales de atención</h4>
                      <div className="help-info-grid">
                        <div className="help-info-card">
                          <strong>Teléfono</strong>
                          <span>+51 978 704 402</span>
                        </div>
                        <div className="help-info-card">
                          <strong>Correo</strong>
                          <span>soporte@skipline.mx</span>
                        </div>
                        <div className="help-info-card">
                          <strong>Horario</strong>
                          <span>Lunes a Viernes · 08:00 AM - 7:00 PM</span>
                        </div>
                      </div>
                    </div>

                    
                  </div>

                  <aside className="help-form-card">
                    <h3>¿No encontraste solución?</h3>
                    <p className="help-form-description">
                      Completa este formulario y nuestro equipo responderá lo antes posible.
                    </p>

                    {ayudaSuccess && <p className="panel-state panel-success">{ayudaSuccess}</p>}
                    {ayudaError && <p className="panel-state panel-error">{ayudaError}</p>}

                    <form className="help-form" onSubmit={handleAyudaSubmit}>
                      <div className="help-input-group">
                        <label htmlFor="helpNombre">Nombre</label>
                        <input
                          id="helpNombre"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={ayudaNombre}
                          onChange={(event) => setAyudaNombre(event.target.value)}
                        />
                      </div>

                      <div className="help-input-group">
                        <label htmlFor="helpEmail">Correo electrónico</label>
                        <input
                          id="helpEmail"
                          type="email"
                          placeholder="tu@correo.com"
                          value={ayudaEmail}
                          onChange={(event) => setAyudaEmail(event.target.value)}
                        />
                      </div>

                      <div className="help-input-group">
                        <label htmlFor="helpTipo">Tipo de consulta</label>
                        <select
                          id="helpTipo"
                          value={ayudaTipo}
                          onChange={(event) => setAyudaTipo(event.target.value)}
                        >
                          <option value="cita">Cita o reprogramación</option>
                          <option value="acceso">Acceso a la plataforma</option>
                          <option value="pago">Pago o factura</option>
                          <option value="pago">Tiempo de espera o disponibilidad</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>

                      <div className="help-input-group">
                        <label htmlFor="helpMensaje">Mensaje</label>
                        <textarea
                          id="helpMensaje"
                          rows="5"
                          placeholder="Describe tu problema o pregunta..."
                          value={ayudaMensaje}
                          onChange={(event) => setAyudaMensaje(event.target.value)}
                        />
                      </div>

                      <button type="submit" className="primary-button">
                        Enviar solicitud
                      </button>
                    </form>
                  </aside>
                </div>
              </div>
            </div>
          </section>
        );

      case 'medicos':
      default:
        return renderMedicosView();
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={props.onLogout} onNavigate={handleNavigate} />
      <main className="dashboard-page">
        <header className="topbar">
          <div className="brand">
            <img src={logoSkipline} alt="Skipline Logo" className="brand-logo" />
            <div className="brand-text">
              <p>Sistema de Gestion de Citas Médicas</p>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className={`support-action-btn ${isSupportActive ? 'active' : ''}`}
              onClick={() => handleNavigate('soporte')}
              aria-label="Abrir mensajes de soporte"
            >
              <span className="support-icon">💬</span>
              <span className="support-label">Mensajes</span>
            </button>
          </div>
        </header>

        {renderContent()}

        {/* Modal de Citas */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          doctor={selectedDoctor}
        />
      </main>
    </div>
  );
};

export default Dashboard;
