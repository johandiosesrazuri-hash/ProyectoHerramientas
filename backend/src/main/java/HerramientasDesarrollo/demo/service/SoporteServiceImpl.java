package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.support.CrearMensajeRequest;
import HerramientasDesarrollo.demo.dto.support.CrearTicketRequest;
import HerramientasDesarrollo.demo.dto.support.MensajeResponse;
import HerramientasDesarrollo.demo.dto.support.TicketResponse;
import HerramientasDesarrollo.demo.entity.EstadoTicket;
import HerramientasDesarrollo.demo.entity.MensajeSoporte;
import HerramientasDesarrollo.demo.entity.Role;
import HerramientasDesarrollo.demo.entity.TicketSoporte;
import HerramientasDesarrollo.demo.entity.Usuario;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.repository.MensajeSoporteRepository;
import HerramientasDesarrollo.demo.repository.TicketSoporteRepository;
import HerramientasDesarrollo.demo.security.UserPrincipal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SoporteServiceImpl implements SoporteService {

    private final TicketSoporteRepository ticketRepository;
    private final MensajeSoporteRepository mensajeRepository;

    @Override
    @Transactional
    public TicketResponse crearTicket(CrearTicketRequest request, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        if (usuario.getRol() != Role.PACIENTE) {
            throw new AccessDeniedException("Solo los pacientes pueden crear tickets");
        }

        TicketSoporte ticket = TicketSoporte.builder()
                .usuario(usuario)
                .asunto(request.getAsunto())
                .estado(EstadoTicket.PENDIENTE)
                .build();

        TicketSoporte savedTicket = ticketRepository.save(ticket);
        crearMensaje(savedTicket, usuario, request.getMensaje());

        return toResponse(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> listarMisTickets(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return ticketRepository.findByUsuarioOrderByCreatedAtDesc(usuario).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> listarTodosTickets(String estado) {
        if (estado == null || estado.isBlank()) {
            return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(this::toResponse)
                    .toList();
        }

        EstadoTicket estadoTicket = EstadoTicket.valueOf(estado.toUpperCase());
        return ticketRepository.findByEstadoOrderByCreatedAtDesc(estadoTicket).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse obtenerTicket(Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        TicketSoporte ticket = obtenerEntidad(id);

        if (usuario.getRol() == Role.PACIENTE && !ticket.getUsuario().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("No tienes permisos para ver este ticket");
        }

        return toResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse agregarMensaje(Long id, CrearMensajeRequest request, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        TicketSoporte ticket = obtenerEntidad(id);

        if (usuario.getRol() == Role.PACIENTE && !ticket.getUsuario().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("No tienes permisos para responder este ticket");
        }

        if (usuario.getRol() == Role.MEDICO) {
            throw new AccessDeniedException("Los médicos no tienen acceso a soporte");
        }

        if (ticket.getEstado() == EstadoTicket.CERRADO) {
            throw new IllegalStateException("No se puede responder a un ticket cerrado");
        }

        crearMensaje(ticket, usuario, request.getMensaje());
        ticket.setEstado(EstadoTicket.RESPONDIDO);
        ticketRepository.save(ticket);

        return toResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse cambiarEstado(Long id, EstadoTicket estado, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        if (usuario.getRol() != Role.ADMIN) {
            throw new AccessDeniedException("Solo los administradores pueden cambiar el estado");
        }

        TicketSoporte ticket = obtenerEntidad(id);
        ticket.setEstado(estado);
        ticket.setUpdatedAt(LocalDateTime.now());
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse cerrarTicket(Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        if (usuario.getRol() != Role.ADMIN) {
            throw new AccessDeniedException("Solo los administradores pueden cerrar tickets");
        }

        TicketSoporte ticket = obtenerEntidad(id);
        ticket.setEstado(EstadoTicket.CERRADO);
        ticket.setUpdatedAt(LocalDateTime.now());
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketSoporte obtenerEntidad(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
    }

    @Override
    public Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        return principal.getUsuario();
    }

    @Override
    @Transactional
    public MensajeSoporte crearMensaje(TicketSoporte ticket, Usuario remitente, String mensaje) {
        MensajeSoporte nuevoMensaje = MensajeSoporte.builder()
                .ticket(ticket)
                .remitente(remitente)
                .mensaje(mensaje)
                .leido(false)
                .build();
        return mensajeRepository.save(nuevoMensaje);
    }

    private TicketResponse toResponse(TicketSoporte ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .asunto(ticket.getAsunto())
                .estado(ticket.getEstado())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .usuario(ticket.getUsuario())
                .mensajes(mensajeRepository.findByTicketOrderByFechaAsc(ticket).stream()
                        .map(this::toMensajeResponse)
                        .toList())
                .build();
    }

    private MensajeResponse toMensajeResponse(MensajeSoporte mensaje) {
        return MensajeResponse.builder()
                .id(mensaje.getId())
                .remitente(mensaje.getRemitente())
                .mensaje(mensaje.getMensaje())
                .fecha(mensaje.getFecha())
                .leido(mensaje.isLeido())
                .build();
    }
}
