import React, { useState } from 'react';
import { authService, authUtils } from '../services/authService';
import '../styles/Registro.css';

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
      const data = await authService.register(
        registroForm.nombre,
        registroForm.email,
        registroForm.password
      );

      // Guardar token y usuario
      authUtils.setAuth(data.token, data.user);

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
      <div className="auth-card">
        <form onSubmit={handleRegistroSubmit} className="auth-form">
          <h2>Crear Cuenta</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={registroForm.nombre}
                onChange={handleRegistroChange}
                placeholder="Juan Pérez"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registroForm.email}
                onChange={handleRegistroChange}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registroForm.password}
                onChange={handleRegistroChange}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirmar Contraseña</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={registroForm.passwordConfirm}
                onChange={handleRegistroChange}
                placeholder="Repite tu contraseña"
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;
