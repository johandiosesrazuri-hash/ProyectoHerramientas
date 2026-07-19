package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.support.CrearMensajeRequest;
import HerramientasDesarrollo.demo.dto.support.CrearTicketRequest;
import HerramientasDesarrollo.demo.dto.support.TicketResponse;
import HerramientasDesarrollo.demo.entity.EstadoTicket;
import HerramientasDesarrollo.demo.entity.MensajeSoporte;
import HerramientasDesarrollo.demo.entity.TicketSoporte;
import HerramientasDesarrollo.demo.entity.Usuario;
import java.util.List;
import org.springframework.security.core.Authentication;

public interface SoporteService {
    TicketResponse crearTicket(CrearTicketRequest request, Authentication authentication);

    List<TicketResponse> listarMisTickets(Authentication authentication);

    List<TicketResponse> listarTodosTickets(String estado);

    TicketResponse obtenerTicket(Long id, Authentication authentication);

    TicketResponse agregarMensaje(Long id, CrearMensajeRequest request, Authentication authentication);

    TicketResponse cambiarEstado(Long id, EstadoTicket estado, Authentication authentication);

    TicketResponse cerrarTicket(Long id, Authentication authentication);

    TicketSoporte obtenerEntidad(Long id);

    Usuario obtenerUsuarioAutenticado(Authentication authentication);

    MensajeSoporte crearMensaje(TicketSoporte ticket, Usuario remitente, String mensaje);
}
