import React, { useState } from 'react';
import { authService, authUtils } from '../services/authService';
import '../styles/Registro.css';
import '../styles/Login.css';

const Login = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Validaciones
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarLogin = () => {
    if (!loginForm.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (!validarEmail(loginForm.email)) {
      setError('El email no tiene formato válido');
      return false;
    }
    if (!loginForm.password) {
      setError('La contraseña es obligatoria');
      return false;
    }
    return true;
  };

  // Manejador de cambio
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Enviar formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarLogin()) {
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login(loginForm.email, loginForm.password);

      // Guardar token y usuario
      authUtils.setAuth(data.token, data.user);

      setSuccess('¡Login exitoso! Bienvenido.');
      setLoginForm({
        email: '',
        password: ''
      });

      // Notificar al padre y cambiar vista
      if (props.onAuthSuccess) {
        props.onAuthSuccess();
      }

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleLoginSubmit} className="auth-form login-form">
          <div className="login-brand">
            <div className="login-brand-logo">SK</div>
            <h1>Skipline</h1>
            <p>Sistema de Gestión de Doctores</p>
          </div>

          <h2>Iniciar Sesión</h2>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <span className="input-icon">&#x2709;</span>
            <input
              type="email"
              id="login-email"
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="correo@ejemplo.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contraseña</label>
            <span className="input-icon">&#x1F512;</span>
            <input
              type="password"
              id="login-password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Tu contraseña"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="login-footer">
            <p>¿Olvidaste tu contraseña? <a href="#recuperar">Recupérala</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
