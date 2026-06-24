package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.horario.CreateHorarioRequest;
import HerramientasDesarrollo.demo.dto.horario.HorarioResponse;
import HerramientasDesarrollo.demo.entity.HorarioBase;
import HerramientasDesarrollo.demo.service.HorarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@Tag(name = "Horarios", description = "Configuración de horarios base por doctor")
/**
 * Administración de disponibilidad estructural del médico (plantilla semanal).
 */
public class HorarioController {

    private final HorarioService horarioService;

    /**
        * Registra un bloque base de atención y protege contra superposición horaria por doctor y día.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear horario base", description = "Asigna horario base al doctor validando que no se superponga")
        @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Horario creado"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos"),
            @ApiResponse(responseCode = "404", description = "Doctor no encontrado"),
            @ApiResponse(responseCode = "409", description = "Horario superpuesto")
        })
    public ResponseEntity<HorarioResponse> createHorario(@Valid @RequestBody CreateHorarioRequest request) {
        HorarioBase saved = horarioService.createHorario(request);
        HorarioResponse response = HorarioResponse.builder()
                .id(saved.getId())
                .doctorId(saved.getDoctor().getId())
                .diaSemana(saved.getDiaSemana())
                .horaInicio(saved.getHoraInicio())
                .horaFin(saved.getHoraFin())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @org.springframework.web.bind.annotation.GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar horarios base", description = "Retorna horarios base, opcionalmente por doctorId")
    public ResponseEntity<java.util.List<HorarioResponse>> getHorarios(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long doctorId
    ) {
        if (doctorId != null) {
            return ResponseEntity.ok(horarioService.findByDoctorId(doctorId));
        }
        return ResponseEntity.ok(horarioService.findAll());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar horario base", description = "Elimina un bloque de horario base (solo ADMIN)")
    public ResponseEntity<Void> deleteHorario(@org.springframework.web.bind.annotation.PathVariable Long id) {
        horarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
