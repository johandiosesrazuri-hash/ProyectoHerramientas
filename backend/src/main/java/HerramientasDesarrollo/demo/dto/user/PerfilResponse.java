package HerramientasDesarrollo.demo.dto.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PerfilResponse {
    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private LocalDateTime createdAt;
    
    // Datos de Paciente
    private String dni;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String tipoSangre;
    
    // Datos de Doctor
    private Long doctorId;
    private String especialidad;
    private String consultorio;
    private Integer experienciaAnios;
}
