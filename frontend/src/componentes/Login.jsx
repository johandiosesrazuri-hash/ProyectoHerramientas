import React, { useState } from 'react';
import '../styles/Registro.css';
import logoSkipline from '../assets/images/logo.png';

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
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      // Guardar token y usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

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
      <div className="auth-card auth-split-card">
        <aside className="auth-visual-panel">
          <div className="visual-glow visual-glow-top" aria-hidden="true" />
          <div className="visual-glow visual-glow-bottom" aria-hidden="true" />
          <h1>Bienvenido de nuevo</h1>
          <p>
            Gestiona citas y horarios en una sola plataforma con una experiencia
            rapida y clara.
          </p>
        </aside>

        <section className="auth-form-panel">
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <img src={logoSkipline} alt="Skipline Logo" className="form-logo" />
            <h2 className="animate-delay-1">Iniciar sesión</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group animate-delay-2">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder=""
                disabled={loading}
                required
              />
            </div>

            <div className="form-group animate-delay-3">
              <label htmlFor="login-password">Contraseña</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder=""
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block animate-delay-4"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <p className="auth-switch-text animate-delay-5">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => props.onSwitchToRegister && props.onSwitchToRegister()}
              >
                Regístrate
              </button>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
