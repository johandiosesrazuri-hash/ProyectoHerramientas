import React, { useEffect, useMemo, useState } from 'react';
import { doctorService } from '../services/doctorService';
import { especialidadService } from '../services/especialidadService';
import AppointmentModal from './AppointmentModal';
import Sidebar from './Sidebar';
import logoSkipline from '../assets/images/logo.png';
import '../styles/Dashboard.css';

const Dashboard = (props) => {
  const [doctores, setDoctores] = useState([]);
  const [search, setSearch] = useState('');
  const [especialidad, setEspecialidad] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentView, setCurrentView] = useState('medicos');
  const [especialidadesAPI, setEspecialidadesAPI] = useState([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  const [errorEspecialidades, setErrorEspecialidades] = useState('');

  useEffect(() => {
    loadDoctores();
  }, [search, especialidad]);

  useEffect(() => {
    if (currentView === 'especialidades') {
      loadEspecialidades();
    }
  }, [currentView]);

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

  const loadEspecialidades = async () => {
    try {
      setLoadingEspecialidades(true);
      setErrorEspecialidades('');
      const payload = await especialidadService.getAllEspecialidades();
      setEspecialidadesAPI(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setErrorEspecialidades(err.message || 'No se pudieron cargar las especialidades.');
      setEspecialidadesAPI([]);
    } finally {
      setLoadingEspecialidades(false);
    }
  };

  const especialidades = useMemo(() => {
    const values = doctores
      .flatMap((doctor) => (doctor.especialidad || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean);
    return ['Todas', ...new Set(values)];
  }, [doctores]);

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

  const renderMedicosView = () => (
    <>
      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Doctores Disponibles</p>
          <p className="stat-value">{doctoresDisponibles}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Especialidades</p>
          <p className="stat-value">{Math.max(especialidades.length - 1, 0)}</p>
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
            {especialidades.map((item) => (
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
      case 'perfil':
        return (
          <section className="content-section">
            <h2>Mi Perfil</h2>
            <div className="profile-modern-wrapper">
              {/* Tarjeta Principal - Profile Card */}
              <div className="profile-card-modern">
                <div className="profile-card-header">
                  <div className="profile-card-avatar">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZxcw7x7iYg7UQGBwvzZW8znYaH9V7zJzrl6JyXul1Fg&s" alt="Foto de perfil" />
                    <div className="status-indicator">
                      <span className="status-dot"></span>
                      <span className="status-text">Activo</span>
                    </div>
                  </div>
                  <div className="profile-card-info">
                    <h3>Jesus Benites</h3>
                    <p className="card-patient-id">ID: P-12345</p>
                    <p className="card-meta">26 años • Hombre • A+</p>
                    <button className="btn-edit-profile">Editar Perfil</button>
                  </div>
                </div>
              </div>

              {/* Grid de Secciones */}
              <div className="profile-sections-grid">
                {/* Datos de Contacto */}
                <div className="profile-section">
                  <div className="section-header">
                    <h4>Datos de Contacto</h4>
                  </div>
                  <div className="section-content">
                    <div className="info-field">
                      <span className="field-icon">📧</span>
                      <div>
                        <p className="field-label">Correo Electrónico</p>
                        <p className="field-value">jesus.benites@email.com</p>
                      </div>
                    </div>
                    <div className="info-field">
                      <span className="field-icon">📱</span>
                      <div>
                        <p className="field-label">Teléfono Principal</p>
                        <p className="field-value">+51 926 380 584</p>
                      </div>
                    </div>
                    <div className="info-field">
                      <span className="field-icon">☎️</span>
                      <div>
                        <p className="field-label">Contacto Emergencia</p>
                        <p className="field-value">+51 92 345 678</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos Médicos */}
                <div className="profile-section">
                  <div className="section-header">
                    <h4>Información Médica</h4>
                  </div>
                  <div className="section-content">
                    <div className="info-group">
                      <p className="group-label">Alergias</p>
                      <div className="badges-container">
                        <span className="badge-red">Penicilina</span>
                        <span className="badge-red">Polen</span>
                      </div>
                    </div>
                    <div className="info-group">
                      <p className="group-label">Condiciones</p>
                      <div className="badges-container">
                        <span className="badge-info">Asma Controlado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seguro Médico */}
                <div className="profile-section">
                  <div className="section-header">
                    <h4>Seguro Médico</h4>
                  </div>
                  <div className="section-content">
                    <div className="info-field">
                      <span className="field-icon">🏥</span>
                      <div>
                        <p className="field-label">Proveedor</p>
                        <p className="field-value">EsSalud</p>
                      </div>
                    </div>
                    <div className="info-field">
                      <span className="field-icon">📋</span>
                      <div>
                        <p className="field-label">Número de Póliza</p>
                        <p className="field-value">ESS-98765-A</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="profile-actions">
                <button className="btn-action-secondary">Cambiar Contraseña</button>
                <button className="btn-action-primary">Reservar Cita</button>
              </div>
            </div>
          </section>
        );

      case 'historial':
        return (
          <section className="content-section">
            <h2>Historial de Citas</h2>
            <div className="history-card">
              <p className="placeholder-text">Tu historial de citas aparecerá aquí</p>
            </div>
          </section>
        );

      case 'especialidades':
        return (
          <section className="content-section">
            <h2>Especialidades</h2>
            <p className="subtitle">Catálogo de especialidades disponibles</p>
            
            {loadingEspecialidades && <p className="panel-state">Cargando especialidades...</p>}
            {!loadingEspecialidades && errorEspecialidades && (
              <p className="panel-state panel-error">{errorEspecialidades}</p>
            )}
            {!loadingEspecialidades && !errorEspecialidades && especialidadesAPI.length === 0 && (
              <p className="panel-state">No hay especialidades para mostrar.</p>
            )}

            {!loadingEspecialidades && !errorEspecialidades && especialidadesAPI.length > 0 && (
              <div className="especialidades-grid">
                {especialidadesAPI.map((esp) => (
                  <article key={esp.id} className="especialidad-card">
                    <div className="especialidad-header">
                      <h3>{esp.nombre}</h3>
                    </div>
                    <p className="especialidad-description">{esp.descripcion}</p>
                    <div className="especialidad-footer">
                      <span className="especialidad-id">ID: {esp.id}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );

      case 'ayuda':
        return (
          <section className="content-section">
            <h2>Centro de Ayuda</h2>
            <div className="help-card">
              <p className="placeholder-text">Centro de ayuda y soporte técnico</p>
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
