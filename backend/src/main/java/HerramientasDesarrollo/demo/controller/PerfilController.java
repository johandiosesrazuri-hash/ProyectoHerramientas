package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.user.PerfilResponse;
import HerramientasDesarrollo.demo.dto.user.UpdatePerfilRequest;
import HerramientasDesarrollo.demo.service.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
@Tag(name = "Perfil", description = "Manejo del perfil del usuario (Paciente o Médico)")
public class PerfilController {

    private final PerfilService perfilService;

    @GetMapping
    @Operation(summary = "Obtener Perfil", description = "Retorna todos los datos personales del usuario autenticado.")
    public ResponseEntity<PerfilResponse> getPerfil(Authentication authentication) {
        return ResponseEntity.ok(perfilService.getPerfilCompleto(authentication));
    }

    @PutMapping
    @Operation(summary = "Actualizar Perfil", description = "Actualiza los datos personales del usuario autenticado.")
    public ResponseEntity<PerfilResponse> updatePerfil(Authentication authentication, @RequestBody UpdatePerfilRequest request) {
        return ResponseEntity.ok(perfilService.updatePerfil(authentication, request));
    }
}
