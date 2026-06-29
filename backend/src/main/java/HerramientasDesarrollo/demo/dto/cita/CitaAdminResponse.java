package HerramientasDesarrollo.demo.dto.cita;

import HerramientasDesarrollo.demo.entity.CitaEstado;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
/**
 * Vista administrativa completa de una cita con datos de paciente y doctor.
 */
public class CitaAdminResponse {
    private Long id;
    private Long slotId;
    private Long doctorId;
    private String doctorNombre;
    private Long usuarioId;
    private String pacienteNombre;
    private String pacienteEmail;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private CitaEstado estado;
    private String motivo;
    private LocalDateTime createdAt;
}
