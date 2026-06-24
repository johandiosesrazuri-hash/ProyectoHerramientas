package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.especialidad.CreateEspecialidadRequest;
import HerramientasDesarrollo.demo.dto.especialidad.EspecialidadResponse;
import HerramientasDesarrollo.demo.service.EspecialidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/especialidades")
@RequiredArgsConstructor
@Tag(name = "Especialidades", description = "CRUD de especialidades médicas")
/**
 * Gestión administrativa del catálogo de especialidades.
 */
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    @GetMapping
    @Operation(summary = "Listar especialidades", description = "Retorna todas las especialidades")
    public ResponseEntity<List<EspecialidadResponse>> findAll() {
        return ResponseEntity.ok(especialidadService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear especialidad", description = "Crea una nueva especialidad (solo ADMIN)")
    public ResponseEntity<EspecialidadResponse> create(@Valid @RequestBody CreateEspecialidadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(especialidadService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar especialidad", description = "Actualiza una especialidad existente (solo ADMIN)")
    public ResponseEntity<EspecialidadResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateEspecialidadRequest request
    ) {
        return ResponseEntity.ok(especialidadService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar especialidad", description = "Elimina una especialidad (solo ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        especialidadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
