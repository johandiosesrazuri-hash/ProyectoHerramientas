package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.support.CrearMensajeRequest;
import HerramientasDesarrollo.demo.dto.support.CrearTicketRequest;
import HerramientasDesarrollo.demo.dto.support.TicketResponse;
import HerramientasDesarrollo.demo.entity.EstadoTicket;
import HerramientasDesarrollo.demo.service.SoporteService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Soporte", description = "Gestión de tickets de soporte")
public class SoporteController {

    private final SoporteService soporteService;

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    @Operation(summary = "Crear ticket de soporte", description = "Crea un ticket y el primer mensaje asociado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Ticket creado"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos")
    })
    public ResponseEntity<TicketResponse> crearTicket(@Valid @RequestBody CrearTicketRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(soporteService.crearTicket(request, authentication));
    }

    @GetMapping("/mis-tickets")
    @PreAuthorize("hasRole('PACIENTE')")
    @Operation(summary = "Listar tickets del paciente", description = "Muestra solo los tickets del usuario autenticado")
    public ResponseEntity<List<TicketResponse>> misTickets(Authentication authentication) {
        return ResponseEntity.ok(soporteService.listarMisTickets(authentication));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los tickets", description = "Muestra todos los tickets para administración")
    public ResponseEntity<List<TicketResponse>> listarTodos(@RequestParam(required = false) String estado) {
        return ResponseEntity.ok(soporteService.listarTodosTickets(estado));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener ticket", description = "Permite ver un ticket si el usuario tiene permisos")
    public ResponseEntity<TicketResponse> obtenerTicket(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(soporteService.obtenerTicket(id, authentication));
    }

    @PostMapping("/{id}/mensajes")
    @Operation(summary = "Agregar mensaje", description = "Agrega un mensaje a un ticket abierto")
    public ResponseEntity<TicketResponse> agregarMensaje(@PathVariable Long id, @Valid @RequestBody CrearMensajeRequest request, Authentication authentication) {
        return ResponseEntity.ok(soporteService.agregarMensaje(id, request, authentication));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cambiar estado", description = "Cambia el estado de un ticket")
    public ResponseEntity<TicketResponse> cambiarEstado(@PathVariable Long id, @RequestBody EstadoTicket estado, Authentication authentication) {
        return ResponseEntity.ok(soporteService.cambiarEstado(id, estado, authentication));
    }

    @PatchMapping("/{id}/cerrar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cerrar ticket", description = "Cierra un ticket")
    public ResponseEntity<TicketResponse> cerrarTicket(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(soporteService.cerrarTicket(id, authentication));
    }
}
