package HerramientasDesarrollo.demo.dto.doctor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/**
 * Datos para crear un doctor desde el panel de administración.
 */
public class CreateDoctorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede superar 100 caracteres")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @jakarta.validation.constraints.Email(message = "Debe ser un email válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    private Integer experienciaAnios;

    @Size(max = 50, message = "El consultorio no puede superar 50 caracteres")
    private String consultorio;

    @Size(max = 255, message = "La URL de foto no puede superar 255 caracteres")
    private String fotoUrl;

    @NotNull(message = "El clinicaId es obligatorio")
    private Long clinicaId;

    private Set<Long> especialidadIds;
}
