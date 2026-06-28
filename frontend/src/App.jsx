import { useState, useEffect } from 'react'
import Login from './componentes/Login'
import Registro from './componentes/Registro'
import Dashboard from './componentes/Dashboard'
import { ToastProvider } from './componentes/Toast'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    setIsLogin(true);

    // Verificar si hay token guardado al cargar
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsLogin(true);
  };

  if (isAuthenticated) {
    return (
      <ToastProvider>
        <Dashboard onLogout={handleLogout} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="app-container">
        {!isLogin ? (
          <Registro
            onAuthSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        ) : (
          <Login
            onAuthSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        )}
      </div>
    </ToastProvider>
  )
}

export default App
