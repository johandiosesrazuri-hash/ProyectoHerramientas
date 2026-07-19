package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.cita.CitaAdminResponse;
import HerramientasDesarrollo.demo.dto.cita.CitaHistoryResponse;
import HerramientasDesarrollo.demo.dto.cita.CitaResponse;
import HerramientasDesarrollo.demo.dto.cita.CreateCitaRequest;
import HerramientasDesarrollo.demo.dto.cita.UpdateCitaEstadoRequest;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @Operation(summary = "Historial de citas", description = "Obtiene el historial de citas según rol (PACIENTE: solo las suyas, MEDICO: sus citas, ADMIN: todas).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de citas"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/historial")
    public ResponseEntity<List<CitaHistoryResponse>> getHistorial(
            Authentication authentication,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado
    ) {
        List<CitaHistoryResponse> result = citaService.getHistorial(authentication, doctorId, search, estado);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar citas", description = "Retorna todas las citas con detalles (solo ADMIN)")
    public ResponseEntity<List<CitaAdminResponse>> findAll() {
        return ResponseEntity.ok(citaService.findAll());
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    @Operation(summary = "Cambiar estado de cita", description = "Actualiza el estado de una cita (ADMIN o MEDICO)")
    public ResponseEntity<CitaAdminResponse> updateEstado(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCitaEstadoRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(citaService.updateEstado(id, request.getEstado(), authentication));
    }
}
