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
 * Resumen de la cita creada con datos de agenda necesarios para confirmación visual.
 */
public class CitaResponse {
    private Long id;
    private Long slotId;
    private Long doctorId;
    private Long usuarioId;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private CitaEstado estado;
    private String motivo;
    private String pacienteNombre;
    private String pacienteEmail;
    private String doctorNombre;
    private LocalDateTime createdAt;
}
