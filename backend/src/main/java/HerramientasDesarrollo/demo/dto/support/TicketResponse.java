package HerramientasDesarrollo.demo.dto.support;

import HerramientasDesarrollo.demo.entity.EstadoTicket;
import HerramientasDesarrollo.demo.entity.Usuario;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TicketResponse {
    private Long id;
    private String asunto;
    private EstadoTicket estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Usuario usuario;
    private List<MensajeResponse> mensajes;
}
