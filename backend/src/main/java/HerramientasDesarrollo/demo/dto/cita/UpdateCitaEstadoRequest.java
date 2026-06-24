package HerramientasDesarrollo.demo.dto.cita;

import jakarta.validation.constraints.NotNull;
import HerramientasDesarrollo.demo.entity.CitaEstado;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/**
 * Payload para cambiar el estado de una cita desde el panel administrativo.
 */
public class UpdateCitaEstadoRequest {

    @NotNull(message = "El estado es obligatorio")
    private CitaEstado estado;
}
