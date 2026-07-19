package HerramientasDesarrollo.demo.dto.user;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePerfilRequest {
    private String nombre;
    private String email;
    private String dni;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String tipoSangre;
}
