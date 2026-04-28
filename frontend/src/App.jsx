import { useState } from 'react';
import { authService } from './services/authService';
import Registro from './componentes/Registro';
import Login from './componentes/Login';
import Dashboard from './componentes/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('token'));
  });

  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setIsLogin(true);
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      <div className="auth-toggle-container">
        <button
          className={`toggle-btn ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Registro
        </button>

        <button
          className={`toggle-btn ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Iniciar Sesión
        </button>
      </div>

      {!isLogin ? (
        <Registro onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Login onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;