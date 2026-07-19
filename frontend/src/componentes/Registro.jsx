import React, { useState } from 'react';
import '../styles/Registro.css';
import logoSkipline from '../assets/images/logo.png';

const Registro = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para registro
  const [registroForm, setRegistroForm] = useState({
    nombre: '',
    email: '',
    password: '',
    passwordConfirm: '',
    rol: 'PACIENTE'
  });

  // Validaciones
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarRegistro = () => {
    if (!registroForm.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (registroForm.nombre.length > 120) {
      setError('El nombre no puede superar 120 caracteres');
      return false;
    }
    if (!registroForm.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (!validarEmail(registroForm.email)) {
      setError('El email no tiene formato válido');
      return false;
    }
    if (!registroForm.password) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (registroForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (registroForm.password !== registroForm.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  // Manejador de cambio
  const handleRegistroChange = (e) => {
    const { name, value } = e.target;
    setRegistroForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Enviar formulario de registro
  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarRegistro()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: registroForm.nombre,
          email: registroForm.email,
          password: registroForm.password,
          rol: registroForm.rol
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      // Guardar token y usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('¡Registro exitoso! Bienvenido.');
      setRegistroForm({
        nombre: '',
        email: '',
        password: '',
        passwordConfirm: '',
        rol: 'PACIENTE'
      });

      // Notificar al padre y cambiar vista
      if (props.onAuthSuccess) {
        props.onAuthSuccess();
      }

    } catch (err) {
      setError(err.message || 'Error al registrarse. Intente nuevamente.');
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
          <h1>Empieza con Skipline</h1>
          <p>
            Crea tu cuenta para acceder a una gestion de salud moderna y organizada desde el
            primer dia.
          </p>
        </aside>

        <section className="auth-form-panel">
          <form onSubmit={handleRegistroSubmit} className="auth-form">
            <img src={logoSkipline} alt="Skipline Logo" className="form-logo" />
            <h2 className="animate-delay-1">Crear Cuenta</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group animate-delay-2">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={registroForm.nombre}
                onChange={handleRegistroChange}
                placeholder=""
                disabled={loading}
                required
              />
            </div>

            <div className="form-group animate-delay-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registroForm.email}
                onChange={handleRegistroChange}
                placeholder=""
                disabled={loading}
                required
              />
            </div>

            <div className="form-group animate-delay-4">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registroForm.password}
                onChange={handleRegistroChange}
                placeholder=""
                disabled={loading}
                required
              />
            </div>

            <div className="form-group animate-delay-5">
              <label htmlFor="passwordConfirm">Confirmar Contraseña</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={registroForm.passwordConfirm}
                onChange={handleRegistroChange}
                placeholder=""
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block animate-delay-6"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <p className="auth-switch-text animate-delay-6">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => props.onSwitchToLogin && props.onSwitchToLogin()}
              >
                Inicia sesión
              </button>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Registro;
