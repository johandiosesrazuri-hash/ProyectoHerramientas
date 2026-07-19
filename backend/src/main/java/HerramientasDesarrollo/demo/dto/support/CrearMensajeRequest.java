package HerramientasDesarrollo.demo.dto.support;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearMensajeRequest {

    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;
}
