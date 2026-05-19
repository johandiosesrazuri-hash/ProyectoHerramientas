package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.cita.CitaResponse;
import HerramientasDesarrollo.demo.dto.cita.CreateCitaRequest;
import HerramientasDesarrollo.demo.service.CitaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
@Tag(name = "Citas", description = "Reserva de turnos para pacientes")
/**
 * Gestiona la confirmación de reservas desde la perspectiva del paciente.
 */
public class CitaController {

    private final CitaService citaService;

    /**
        * Confirma una reserva sobre un slot concreto y delega en servicio la lógica anti doble reserva.
     */
    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    @Operation(summary = "Crear cita", description = "Reserva un slot disponible para el paciente autenticado y lo marca como ocupado")
        @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cita creada"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos"),
            @ApiResponse(responseCode = "404", description = "Slot o usuario no encontrado"),
            @ApiResponse(responseCode = "409", description = "Slot no disponible")
        })
    public ResponseEntity<CitaResponse> createCita(
            @Valid @RequestBody CreateCitaRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.createCita(request, authentication));
    }

    /**
        * Obtiene el historial de citas del usuario autenticado (paciente).
     */
    @GetMapping("/historial")
    @PreAuthorize("hasRole('PACIENTE') or hasRole('DOCTOR')")
    @Operation(summary = "Obtener historial de citas", description = "Retorna todas las citas del usuario autenticado ordenadas por fecha descendente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historial obtenido"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos")
    })
    public ResponseEntity<List<CitaResponse>> getHistorial(Authentication authentication) {
        return ResponseEntity.ok(citaService.getCitasByUsuarioId(authentication));
    }

    /**
        * Obtiene el historial de citas del doctor autenticado.
     */
    @GetMapping("/doctor/historial")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Obtener historial de citas del doctor", description = "Retorna todas las citas del doctor autenticado ordenadas por fecha descendente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historial obtenido"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Solo doctores pueden acceder")
    })
    public ResponseEntity<List<CitaResponse>> getHistorialDoctor(Authentication authentication) {
        return ResponseEntity.ok(citaService.getCitasByDoctorId(authentication));
    }
}
