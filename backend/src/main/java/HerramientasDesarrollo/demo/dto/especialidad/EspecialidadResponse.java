package HerramientasDesarrollo.demo.dto.especialidad;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
/**
 * Proyección pública de una especialidad médica.
 */
public class EspecialidadResponse {
    private Long id;
    private String nombre;
    private String descripcion;
}
