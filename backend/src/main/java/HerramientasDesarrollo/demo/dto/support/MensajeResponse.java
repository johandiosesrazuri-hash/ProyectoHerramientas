package HerramientasDesarrollo.demo.dto.support;

import HerramientasDesarrollo.demo.entity.Usuario;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MensajeResponse {
    private Long id;
    private Usuario remitente;
    private String mensaje;
    private LocalDateTime fecha;
    private boolean leido;
}
