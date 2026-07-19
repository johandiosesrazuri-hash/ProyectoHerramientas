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
  faChevronRight
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
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      onLogout();
    }
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
    { id: 'admin-dashboard', label: 'Dashboard Admin', icon: '📊' },
    { id: 'admin-usuarios', label: 'Gestión Usuarios', icon: '👥' },
    { id: 'admin-doctores', label: 'Gestión Médicos', icon: '🩺' },
    { id: 'admin-horarios', label: 'Gestión Horarios', icon: '🕒' },
    { id: 'admin-citas', label: 'Monitor Citas', icon: '📅' },
    { id: 'admin-especialidades', label: 'Especialidades', icon: '🏥' }
  ];

  const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.rol;
  const optionsToRender = userRole === 'ADMIN' ? [...adminOptions, ...menuOptions] : menuOptions;

  return (
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
              {typeof option.icon === 'string' ? (
                option.icon
              ) : (
                <FontAwesomeIcon icon={option.icon} />
              )}
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
          <span className="menu-icon">🚪</span>
          <span className={`menu-label ${!isOpen && 'hidden'}`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
