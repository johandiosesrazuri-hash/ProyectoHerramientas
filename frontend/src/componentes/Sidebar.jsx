import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faClipboardList,
  faHospital,
  faUserDoctor,
  faCircleQuestion,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faChartLine,
  faUsersGear,
  faStethoscope,
  faClock,
  faCalendarCheck,
  faHospitalUser
} from '@fortawesome/pro-solid-svg-icons';
import '../styles/Sidebar.css';
import '../styles/AppointmentModal.css';

const Sidebar = ({ onLogout, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeOption, setActiveOption] = useState('medicos');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleOptionClick = (option) => {
    setActiveOption(option);
    if (onNavigate) {
      onNavigate(option);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const menuOptions = [
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: faUser
    },
    {
      id: 'historial',
      label: 'Historial de Citas',
      icon: faClipboardList
    },
    {
      id: 'especialidades',
      label: 'Especialidades',
      icon: faHospital
    },
    {
      id: 'medicos',
      label: 'Médicos en General',
      icon: faUserDoctor
    },
    {
      id: 'ayuda',
      label: 'Centro de Ayuda',
      icon: faCircleQuestion
    }
  ];

  const adminOptions = [
    { id: 'admin-dashboard', label: 'Dashboard Admin', icon: faChartLine },
    { id: 'admin-usuarios', label: 'Gestión Usuarios', icon: faUsersGear },
    { id: 'admin-doctores', label: 'Gestión Médicos', icon: faStethoscope },
    { id: 'admin-horarios', label: 'Gestión Horarios', icon: faClock },
    { id: 'admin-citas', label: 'Monitor Citas', icon: faCalendarCheck },
    { id: 'admin-especialidades', label: 'Especialidades', icon: faHospitalUser }
  ];

  const medicoOptions = [
    { id: 'perfil', label: 'Mi Perfil', icon: faUser },
    { id: 'doctor-citas', label: 'Monitor de Citas', icon: faClipboardList }
  ];

  const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.rol;
  let optionsToRender = menuOptions;
  if (userRole === 'ADMIN') {
    optionsToRender = [...adminOptions, menuOptions.find(opt => opt.id === 'perfil')];
  } else if (userRole === 'MEDICO') {
    optionsToRender = medicoOptions;
  }

  return (
    <>
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2 className={`sidebar-title ${!isOpen && 'hidden'}`}>Menú</h2>
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {optionsToRender.map((option) => (
          <button
            key={option.id}
            className={`menu-item ${activeOption === option.id ? 'active' : ''}`}
            onClick={() => handleOptionClick(option.id)}
            title={option.label}
          >
            <span className="menu-icon">
              <FontAwesomeIcon icon={option.icon} />
            </span>
            <span className={`menu-label ${!isOpen && 'hidden'}`}>
              {option.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn-sidebar"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <span className="menu-icon"><FontAwesomeIcon icon={faRightFromBracket} /></span>
          <span className={`menu-label ${!isOpen && 'hidden'}`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
      
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="appointment-modal-overlay active" style={{ zIndex: 9999 }}>
          <div className="appointment-modal" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="modal-header" style={{ justifyContent: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--danger)', fontSize: '20px' }}>Cerrar Sesión</h3>
            </div>
            <div className="modal-content" style={{ display: 'block', textAlign: 'center', padding: '30px 20px' }}>
              <p style={{ fontSize: '16px', color: 'var(--neutral-700)', margin: 0 }}>¿Estás seguro de que deseas cerrar sesión?</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '15px' }}>
              <button className="btn btn-secondary" onClick={cancelLogout}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={confirmLogout} style={{ background: 'var(--danger)' }}>
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
