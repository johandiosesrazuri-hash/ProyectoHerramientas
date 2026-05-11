import { useState, useEffect } from 'react'
import Registro from './componentes/Registro'
import Dashboard from './componentes/Dashboard'
import Login from './componentes/Login'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('authToken'));
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    setIsLogin(true);

    const syncAuthState = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', syncAuthState);
    syncAuthState();

    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
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
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
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
  )
}

export default App
