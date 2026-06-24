package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.especialidad.EspecialidadResponse;
import HerramientasDesarrollo.demo.service.EspecialidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/especialidades")
@RequiredArgsConstructor
@Tag(name = "Especialidades", description = "Catálogo de especialidades médicas")
/**
 * Endpoints para consultar las especialidades médicas disponibles.
 */
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    /**
     * Obtiene todas las especialidades disponibles ordenadas por nombre.
     */
    @GetMapping
    @Operation(summary = "Listar especialidades", description = "Devuelve todas las especialidades médicas disponibles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de especialidades obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<List<EspecialidadResponse>> getAllEspecialidades() {
        return ResponseEntity.ok(especialidadService.getAllEspecialidades());
    }

    /**
     * Obtiene una especialidad específica por su ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener especialidad por ID", description = "Devuelve los detalles de una especialidad específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Especialidad encontrada"),
            @ApiResponse(responseCode = "404", description = "Especialidad no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<EspecialidadResponse> getEspecialidadById(@PathVariable Long id) {
        return ResponseEntity.ok(especialidadService.getEspecialidadById(id));
    }
}
