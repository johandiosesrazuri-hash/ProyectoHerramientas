import React, { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHospital,
  faUserDoctor,
  faCalendarCheck,
  faHeartPulse,
  faChild,
  faHandDots,
  faStethoscope,
  faBrain,
  faEye,
  faBone,
  faPersonPregnant,
  faDroplet,
  faHeadSideMedical,
  faFlask,
  faLungs,
  faWind,
  faRibbon,
  faEarDeaf,
  faTooth,
  faSyringe,
  faNotesMedical,
  faShieldVirus,
  faVirusCovid,
  faBandage,
  faXRay,
  faPills,
  faDna,
  faHandHoldingMedical,
} from '@fortawesome/pro-solid-svg-icons';
import '../styles/Especialidades.css';

// FontAwesome icons mapped to specialty names (fallback: stethoscope)
const SPECIALTY_ICONS = {
  'cardiología': faHeartPulse,
  'pediatría': faChild,
  'dermatología': faHandDots,
  'medicina general': faStethoscope,
  'neurología': faBrain,
  'oftalmología': faEye,
  'traumatología': faBone,
  'ginecología': faPersonPregnant,
  'urología': faDroplet,
  'psiquiatría': faHeadSideMedical,
  'endocrinología': faFlask,
  'gastroenterología': faLungs,
  'neumología': faWind,
  'oncología': faRibbon,
  'otorrinolaringología': faEarDeaf,
  'odontología': faTooth,
  'inmunología': faShieldVirus,
  'infectología': faVirusCovid,
  'cirugía general': faSyringe,
  'medicina interna': faNotesMedical,
  'rehabilitación': faBandage,
  'radiología': faXRay,
  'farmacología': faPills,
  'genética': faDna,
  'geriatría': faHandHoldingMedical,
};

const ICON_GRADIENTS = [
  'esp-icon-gradient-1',
  'esp-icon-gradient-2',
  'esp-icon-gradient-3',
  'esp-icon-gradient-4',
  'esp-icon-gradient-5',
  'esp-icon-gradient-6',
];

const getSpecialtyIcon = (nombre) => {
  const key = nombre?.toLowerCase().trim();
  return SPECIALTY_ICONS[key] || faStethoscope;
};

const getInitials = (nombre) => {
  if (!nombre) return '?';
  const parts = nombre.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return parts[0].substring(0, 2);
};

const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const Especialidades = ({ onNavigateToDoctor }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [doctoresPorEsp, setDoctoresPorEsp] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch all specialties
      const espRes = await fetch(`${API_BASE_URL}/especialidades`, { headers: getHeaders() });
      if (!espRes.ok) throw new Error('No se pudieron cargar las especialidades');
      const espData = await espRes.json();
      setEspecialidades(espData);

      // 2. Fetch all doctors (includes their specialties as comma-separated string)
      const docRes = await fetch(`${API_BASE_URL}/doctores`, { headers: getHeaders() });
      if (!docRes.ok) throw new Error('No se pudieron cargar los doctores');
      const docData = await docRes.json();

      // 3. Build a map: especialidadId -> [doctor, doctor, ...]
      // Since the doctor response has "especialidad" as a comma-separated string (names),
      // we match by specialty name
      const map = {};
      espData.forEach((esp) => {
        map[esp.id] = [];
      });

      docData.forEach((doctor) => {
        const espNames = (doctor.especialidad || '')
          .split(',')
          .map((s) => s.trim().toLowerCase());

        espData.forEach((esp) => {
          if (espNames.includes(esp.nombre.toLowerCase())) {
            map[esp.id].push(doctor);
          }
        });
      });

      setDoctoresPorEsp(map);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const totalDoctores = useMemo(() => {
    const uniqueIds = new Set();
    Object.values(doctoresPorEsp).forEach((docs) => {
      docs.forEach((d) => uniqueIds.add(d.id));
    });
    return uniqueIds.size;
  }, [doctoresPorEsp]);

  const totalDisponibles = useMemo(() => {
    const uniqueIds = new Set();
    Object.values(doctoresPorEsp).forEach((docs) => {
      docs.forEach((d) => {
        if (d.estado === 'DISPONIBLE') uniqueIds.add(d.id);
      });
    });
    return uniqueIds.size;
  }, [doctoresPorEsp]);

  const renderSkeletons = () => (
    <div className="esp-cards-grid">
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton-esp-card">
          <div className="skeleton-esp-header">
            <div className="skeleton-esp-icon shimmer"></div>
            <div className="skeleton-esp-title-group">
              <div className="skeleton-esp-title shimmer"></div>
              <div className="skeleton-esp-desc shimmer"></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2].map((m) => (
              <div key={m} className="skeleton-esp-doctor">
                <div className="skeleton-esp-avatar shimmer"></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton-esp-name shimmer"></div>
                  <div className="skeleton-esp-meta shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="especialidades-section">
        <h2>Especialidades Médicas</h2>
        <p className="especialidades-subtitle">
          Explora nuestras áreas de atención y encuentra al especialista que necesitas
        </p>
        {renderSkeletons()}
      </section>
    );
  }

  if (error) {
    return (
      <section className="especialidades-section">
        <h2>Especialidades Médicas</h2>
        <div className="esp-cards-grid">
          <p className="esp-error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="especialidades-section">
      <h2>Especialidades Médicas</h2>
      <p className="especialidades-subtitle">
        Explora nuestras áreas de atención y encuentra al especialista que necesitas
      </p>

      {/* Stats strip */}
      <div className="esp-stats-strip">
        <div className="esp-stat-pill">
          <div className="esp-stat-icon primary">
            <FontAwesomeIcon icon={faHospital} />
          </div>
          <div className="esp-stat-info">
            <span className="esp-stat-value">{especialidades.length}</span>
            <span className="esp-stat-label">Especialidades</span>
          </div>
        </div>
        <div className="esp-stat-pill">
          <div className="esp-stat-icon success">
            <FontAwesomeIcon icon={faUserDoctor} />
          </div>
          <div className="esp-stat-info">
            <span className="esp-stat-value">{totalDoctores}</span>
            <span className="esp-stat-label">Doctores Totales</span>
          </div>
        </div>
        <div className="esp-stat-pill">
          <div className="esp-stat-icon purple">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className="esp-stat-info">
            <span className="esp-stat-value">{totalDisponibles}</span>
            <span className="esp-stat-label">Disponibles Ahora</span>
          </div>
        </div>
      </div>

      {/* Specialty cards */}
      <div className="esp-cards-grid">
        {especialidades.length === 0 && (
          <p className="esp-error">No hay especialidades registradas en el sistema.</p>
        )}

        {especialidades.map((esp, index) => {
          const doctors = doctoresPorEsp[esp.id] || [];
          const gradientClass = ICON_GRADIENTS[index % ICON_GRADIENTS.length];

          return (
            <article key={esp.id} className="esp-card">
              {/* Header */}
              <div className="esp-card-header">
                <div className={`esp-card-icon ${gradientClass}`}>
                  <FontAwesomeIcon icon={getSpecialtyIcon(esp.nombre)} />
                </div>
                <div className="esp-card-title-group">
                  <h3 className="esp-card-title">{esp.nombre}</h3>
                  {esp.descripcion && (
                    <p className="esp-card-desc">{esp.descripcion}</p>
                  )}
                </div>
                <span className="esp-doctor-count">
                  {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctores'}
                </span>
              </div>

              {/* Doctors list */}
              <div className="esp-card-doctors">
                <p className="esp-doctors-label">Doctores disponibles</p>

                {doctors.length === 0 ? (
                  <div className="esp-no-doctors">
                    No hay doctores asignados a esta especialidad por el momento
                  </div>
                ) : (
                  <div className="esp-doctors-list">
                    {doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="esp-doctor-item"
                        onClick={() => onNavigateToDoctor && onNavigateToDoctor(doc)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onNavigateToDoctor && onNavigateToDoctor(doc);
                          }
                        }}
                      >
                        <div className="esp-doctor-avatar">
                          {getInitials(doc.nombre)}
                        </div>
                        <div className="esp-doctor-info">
                          <p className="esp-doctor-name">{doc.nombre}</p>
                          <p className="esp-doctor-meta">
                            {doc.experiencia} años exp. · Consultorio {doc.consultorio || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`esp-doctor-status ${
                            doc.estado === 'DISPONIBLE' ? 'available' : 'unavailable'
                          }`}
                        >
                          {doc.estado === 'DISPONIBLE' ? 'Disponible' : 'Sin cupos'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Especialidades;
