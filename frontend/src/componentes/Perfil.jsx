import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Perfil.css';

const Perfil = () => {
    const [perfil, setPerfil] = useState(null);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Formularios
    const [formData, setFormData] = useState({
        nombre: '',
        dni: '',
        telefono: '',
        fechaNacimiento: '',
        tipoSangre: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [perfilRes, citasRes] = await Promise.all([
                api.get('/users/me'), // Fallback
                api.get('/citas/historial')
            ]);
            
            // Tratamos de obtener el perfil completo (si existe)
            let perfilData = perfilRes.data;
            try {
                const completoRes = await api.get('/perfil');
                perfilData = completoRes.data;
            } catch (err) {
                console.warn('Endpoint de perfil extendido aún no disponible');
            }

            setPerfil(perfilData);
            setFormData({
                nombre: perfilData.nombre || '',
                dni: perfilData.dni || '',
                telefono: perfilData.telefono || '',
                fechaNacimiento: perfilData.fechaNacimiento || '',
                tipoSangre: perfilData.tipoSangre || ''
            });

            // Filtrar solo las citas futuras
            const hoy = new Date();
            const proximas = citasRes.data.filter(c => {
                const fechaCita = new Date(c.fecha + 'T' + c.horaInicio);
                return fechaCita >= hoy && c.estado !== 'CANCELADA';
            });
            setCitas(proximas);
        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.put('/perfil', formData);
            alert('Perfil actualizado con éxito');
            cargarDatos();
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            alert('Error al guardar los datos.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="perfil-container view-fade-in">
                <div className="skeleton-perfil-header skeleton-shimmer"></div>
                <div className="skeleton-perfil-body skeleton-shimmer"></div>
            </div>
        );
    }

    return (
        <div className="perfil-container view-fade-in">
            <div className="perfil-header">
                <div className="avatar-circle">
                    {perfil?.nombre?.charAt(0).toUpperCase()}
                </div>
                <div className="perfil-info">
                    <h2>{perfil?.nombre}</h2>
                    <p>{perfil?.email}</p>
                    <span className={`rol-badge ${perfil?.rol?.toLowerCase()}`}>
                        {perfil?.rol}
                    </span>
                </div>
            </div>

            <div className="perfil-content">
                <div className="perfil-form-section">
                    <h3>Mis Datos Personales</h3>
                    <form onSubmit={handleSubmit} className="perfil-form">
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        
                        {perfil?.rol === 'PACIENTE' && (
                            <>
                                <div className="form-group row">
                                    <div className="col">
                                        <label>DNI</label>
                                        <input type="text" name="dni" value={formData.dni} onChange={handleChange} />
                                    </div>
                                    <div className="col">
                                        <label>Teléfono</label>
                                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col">
                                        <label>Fecha de Nacimiento</label>
                                        <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
                                    </div>
                                    <div className="col">
                                        <label>Tipo de Sangre</label>
                                        <select name="tipoSangre" value={formData.tipoSangre} onChange={handleChange}>
                                            <option value="">Seleccione...</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {perfil?.rol === 'MEDICO' && (
                            <div className="doctor-info-box">
                                <p><strong>Especialidad:</strong> {perfil.especialidad}</p>
                                <p><strong>Consultorio:</strong> {perfil.consultorio}</p>
                                <p><strong>Experiencia:</strong> {perfil.experienciaAnios} años</p>
                            </div>
                        )}

                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>

                {perfil?.rol === 'PACIENTE' && (
                    <div className="perfil-citas-section">
                        <h3>Próximas Citas</h3>
                        {citas.length === 0 ? (
                            <p className="no-citas">No tienes citas futuras programadas.</p>
                        ) : (
                            <ul className="citas-lista">
                                {citas.map(cita => (
                                    <li key={cita.id} className="cita-item">
                                        <div className="cita-fecha">
                                            <strong>{new Date(cita.fecha).toLocaleDateString()}</strong>
                                            <span>{cita.horaInicio.substring(0,5)}</span>
                                        </div>
                                        <div className="cita-doctor">
                                            <p>Dr. {cita.doctorNombre}</p>
                                            <small>{cita.especialidad}</small>
                                        </div>
                                        <div className="cita-estado">
                                            <span className={`estado-badge ${cita.estado.toLowerCase()}`}>
                                                {cita.estado}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Perfil;
