import React, { useEffect, useMemo, useState } from 'react';
import { supportService } from '../services/supportService';
import '../styles/Dashboard.css';

const Soporte = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ asunto: '', mensaje: '' });
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(user?.rol === 'ADMIN');

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = isAdmin
        ? await supportService.listAllTickets(statusFilter)
        : await supportService.listMyTickets();
      setTickets(Array.isArray(data) ? data : []);
      if (data?.length) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const selectedTicket = useMemo(() => {
    return tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      const created = await supportService.createTicket(form);
      setForm({ asunto: '', mensaje: '' });
      setSuccess('Ticket creado correctamente.');
      setTickets((prev) => [created, ...prev]);
      setSelectedTicketId(created.id);
    } catch (err) {
      setError(err.message || 'No se pudo crear el ticket');
    }
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setError('');
      setSuccess('');
      const updated = await supportService.addMessage(selectedTicket.id, replyText);
      setReplyText('');
      setSuccess('Mensaje enviado correctamente.');
      setTickets((prev) => prev.map((ticket) => ticket.id === updated.id ? updated : ticket));
      setSelectedTicketId(updated.id);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el mensaje');
    }
  };

  const handleStatusChange = async (event) => {
    if (!selectedTicket) return;
    const nextStatus = event.target.value;
    try {
      setError('');
      setSuccess('');
      const updated = await supportService.changeStatus(selectedTicket.id, nextStatus);
      setTickets((prev) => prev.map((ticket) => ticket.id === updated.id ? updated : ticket));
      setSuccess('Estado actualizado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado');
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      setError('');
      setSuccess('');
      const updated = await supportService.closeTicket(selectedTicket.id);
      setTickets((prev) => prev.map((ticket) => ticket.id === updated.id ? updated : ticket));
      setSuccess('Ticket cerrado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo cerrar el ticket');
    }
  };

  return (
    <section className="content-section">
      <h2>{isAdmin ? 'Mensajes de Soporte' : 'Mis Mensajes'}</h2>

      {error && <p className="panel-state panel-error">{error}</p>}
      {success && <p className="panel-state panel-success">{success}</p>}

      <div className="help-card" style={{ display: 'block', minHeight: 'auto' }}>
        <div className="help-card-content">
          <div className="help-grid" style={{ gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(320px, 1.1fr)' }}>
            <div className="help-column">
              {!isAdmin && (
                <div className="help-section">
                  <h3>Crear nuevo ticket</h3>
                  <form className="help-form" onSubmit={handleCreateTicket}>
                    <div className="help-input-group">
                      <label htmlFor="ticketAsunto">Asunto</label>
                      <input
                        id="ticketAsunto"
                        value={form.asunto}
                        onChange={(event) => setForm({ ...form, asunto: event.target.value })}
                        placeholder="Describe brevemente tu solicitud"
                      />
                    </div>
                    <div className="help-input-group">
                      <label htmlFor="ticketMensaje">Mensaje inicial</label>
                      <textarea
                        id="ticketMensaje"
                        rows="4"
                        value={form.mensaje}
                        onChange={(event) => setForm({ ...form, mensaje: event.target.value })}
                        placeholder="Explica tu problema o consulta"
                      />
                    </div>
                    <button type="submit" className="primary-button">Crear ticket</button>
                  </form>
                </div>
              )}

              <div className="help-section">
                <h3>{isAdmin ? 'Filtros' : 'Tus tickets'}</h3>
                {isAdmin && (
                  <div className="help-input-group" style={{ marginBottom: '12px' }}>
                    <label htmlFor="statusFilter">Estado</label>
                    <select id="statusFilter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="">Todos</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="RESPONDIDO">Respondido</option>
                      <option value="CERRADO">Cerrado</option>
                    </select>
                  </div>
                )}

                {loading && <p className="panel-state">Cargando tickets...</p>}
                {!loading && tickets.length === 0 && <p className="panel-state">No hay tickets para mostrar.</p>}

                {!loading && tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    className="primary-button"
                    style={{ marginBottom: '8px', background: selectedTicket?.id === ticket.id ? '#2a7de1' : '#6b7280' }}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    type="button"
                  >
                    #{ticket.id} · {ticket.asunto} · {ticket.estado}
                  </button>
                ))}
              </div>
            </div>

            <div className="help-column">
              {selectedTicket ? (
                <div className="help-section">
                  <h3>{selectedTicket.asunto}</h3>
                  <p className="help-intro">Estado: {selectedTicket.estado} · Creado: {selectedTicket.createdAt?.slice(0, 10)}</p>

                  {isAdmin && (
                    <div className="help-input-group" style={{ margin: '12px 0' }}>
                      <label htmlFor="ticketStatus">Cambiar estado</label>
                      <select id="ticketStatus" value={selectedTicket.estado} onChange={handleStatusChange}>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="RESPONDIDO">Respondido</option>
                        <option value="CERRADO">Cerrado</option>
                      </select>
                    </div>
                  )}

                  <div className="help-section" style={{ background: 'white' }}>
                    {(selectedTicket.mensajes || []).map((mensaje) => (
                      <div key={mensaje.id} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        <strong>{mensaje.remitente?.nombre || 'Usuario'}</strong>
                        <div>{mensaje.mensaje}</div>
                        <small style={{ color: '#6b7280' }}>{mensaje.fecha?.slice(0, 16)}</small>
                      </div>
                    ))}
                  </div>

                  {!selectedTicket || selectedTicket.estado === 'CERRADO' ? null : (
                    <form className="help-form" onSubmit={handleReply}>
                      <div className="help-input-group">
                        <label htmlFor="replyText">Responder</label>
                        <textarea
                          id="replyText"
                          rows="4"
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder="Escribe tu respuesta"
                        />
                      </div>
                      <button type="submit" className="primary-button">Enviar respuesta</button>
                    </form>
                  )}

                  {isAdmin && selectedTicket?.estado !== 'CERRADO' && (
                    <button type="button" className="primary-button" style={{ marginTop: '8px', background: '#dc2626' }} onClick={handleCloseTicket}>
                      Cerrar ticket
                    </button>
                  )}
                </div>
              ) : (
                <div className="help-section"><p className="help-intro">Selecciona un ticket para ver su conversación.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Soporte;
