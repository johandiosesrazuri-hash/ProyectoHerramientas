import React, { useEffect, useMemo, useState } from 'react';
import { doctorService } from '../services/doctorService';
import CitaModal from './CitaModal';
import '../styles/Dashboard.css';

const Dashboard = (props) => {
  const [doctores, setDoctores] = useState([]);
  const [search, setSearch] = useState('');
  const [especialidad, setEspecialidad] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDoctores();
  }, [search, especialidad]);

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

  const getEspecialidadDemo = (doctor) => {
    const especialidadesDemo = {
      1: 'CARDIOLOGIA',
      2: 'PEDIATRIA',
      3: 'DERMATOLOGIA'
    };

    if (doctor?.especialidad && doctor.especialidad.trim() !== '') {
      return doctor.especialidad.toUpperCase();
    }

    return especialidadesDemo[Number(doctor?.id)] || 'MEDICINA GENERAL';
  };

  const tieneDisponibilidadDemo = (doctor) => {
    return Number(doctor?.id) === 1 || Number(doctor?.id) === 2;
  };

  const especialidades = useMemo(() => {
    const values = doctores.map((doctor) => getEspecialidadDemo(doctor));
    return ['Todas', ...new Set(values)];
  }, [doctores]);

  const doctoresFiltrados = useMemo(() => {
    return doctores.filter((doctor) => {
      const esp = getEspecialidadDemo(doctor);
      const texto = `${doctor.nombre || ''} ${esp}`.toLowerCase();

      const coincideBusqueda = texto.includes(search.toLowerCase());
      const coincideEspecialidad =
        especialidad === 'Todas' || esp.toLowerCase() === especialidad.toLowerCase();

      return coincideBusqueda && coincideEspecialidad;
    });
  }, [doctores, search, especialidad]);

  const doctoresDisponibles = useMemo(
    () => doctores.filter((doctor) => tieneDisponibilidadDemo(doctor)).length,
    [doctores]
  );

  const formatProximaCita = (doctor) => {
    if (!doctor.proximaFechaDisponible || !doctor.proximaHoraDisponible) {
      return 'Proxima cita: Sin disponibilidad';
    }

    return `Proxima cita: ${doctor.proximaFechaDisponible} ${doctor.proximaHoraDisponible.slice(0, 5)}`;
  };

  const abrirModalCita = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const cerrarModalCita = () => {
    setSelectedDoctor(null);
    setShowModal(false);
  };

  return (
    <>
      <main className="dashboard-page">
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo">SK</div>
            <div>
              <h1>Skipline</h1>
              <p>Sistema de Gestion de Doctores</p>
            </div>
          </div>

          <button className="logout-btn" type="button" onClick={props.onLogout}>
            Cerrar Sesion
          </button>
        </header>

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

          {!loading && !error && doctoresFiltrados.length === 0 && (
            <p className="panel-state">No hay doctores para mostrar.</p>
          )}

          {!loading &&
            !error &&
            doctoresFiltrados.map((doctor) => (
              <article key={doctor.id} className="doctor-card">
                <div className="doctor-card-top">
                  <div>
                    <h2>{doctor.nombre}</h2>
                    <p className="especialidad">{getEspecialidadDemo(doctor)}</p>
                  </div>

                  <span className="rating">#{doctor.id}</span>
                </div>

                <ul className="doctor-meta">
                  <li>{doctor.experiencia || doctor.experienciaAnios || 0} anos de experiencia</li>
                  <li>Consultorio {doctor.consultorio || 'Sin dato'}</li>
                  <li>{formatProximaCita(doctor)}</li>
                </ul>

                <p className={`estado ${tieneDisponibilidadDemo(doctor) ? 'ok' : 'off'}`}>
                  {tieneDisponibilidadDemo(doctor) ? 'Disponible para cita' : 'No disponible'}
                </p>

                <button
                  className="schedule-btn"
                  type="button"
                  onClick={() => abrirModalCita(doctor)}
                >
                  Agendar cita
                </button>
              </article>
            ))}
        </section>

        <section className="notice-box">
          <p>
            Solo se muestra informacion de doctores desde base de datos. Citas y horarios todavia no se gestionan desde esta vista.
          </p>
        </section>
      </main>

      {showModal && selectedDoctor && (
        <CitaModal
          doctor={selectedDoctor}
          onClose={cerrarModalCita}
          onSuccess={() => {
            cerrarModalCita();
            loadDoctores();
          }}
        />
      )}
    </>
  );
};

export default Dashboard;