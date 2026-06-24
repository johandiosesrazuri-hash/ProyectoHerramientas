package HerramientasDesarrollo.demo.dto.especialidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * DTO de respuesta para especialidades médicas.
 */
public class EspecialidadResponse {
    private Long id;
    private String nombre;
    private String descripcion;
}
