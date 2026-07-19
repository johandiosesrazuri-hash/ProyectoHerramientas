import React, { useState } from 'react';
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

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const menuOptions = [
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: '👤'
    },
    {
      id: 'historial',
      label: 'Historial de Citas',
      icon: '📋'
    },
    {
      id: 'medicos',
      label: 'Médicos en General',
      icon: '👨‍⚕️'
    },
    {
      id: 'ayuda',
      label: 'Centro de Ayuda',
      icon: '❓'
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
  const optionsToRender = userRole === 'ADMIN'
    ? [...adminOptions, ...menuOptions]
    : [...menuOptions];

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
              <span className="menu-icon">{option.icon}</span>
              <span className={`menu-label ${!isOpen && 'hidden'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn-sidebar"
            onClick={handleLogoutClick}
            title="Cerrar sesión"
          >
            <span className="menu-icon">🚪</span>
            <span className={`menu-label ${!isOpen && 'hidden'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Custom Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="appointment-modal-overlay" onClick={() => setIsLogoutModalOpen(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="modal-close-btn" onClick={() => setIsLogoutModalOpen(false)}>✕</button>
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <h2 className="doctor-name" style={{ margin: 0, fontSize: '18px' }}>Cerrar Sesión</h2>
            </div>
            <div style={{ padding: '24px', fontSize: '14px', color: 'var(--neutral-700)', fontWeight: '500' }}>
              ¿Estás seguro de que deseas cerrar sesión?
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setIsLogoutModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { setIsLogoutModalOpen(false); onLogout(); }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
