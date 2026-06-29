package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.user.CreateUserRequest;
import HerramientasDesarrollo.demo.dto.user.UserResponse;
import HerramientasDesarrollo.demo.service.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestion de usuarios y perfil del autenticado")
/**
 * Endpoints de administración de cuentas y auto-consulta de perfil.
 */
public class UserController {

    private final UserService userService;

    /**
        * Devuelve el padrón completo de usuarios para pantallas administrativas.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar usuarios", description = "Retorna todos los usuarios (solo ADMIN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado obtenido"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos")
    })
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    /**
        * Permite alta asistida de usuarios desde backoffice, incluyendo personal médico y administradores.
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear usuario", description = "Crea un usuario con rol ADMIN/MEDICO/PACIENTE (solo ADMIN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario creado"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos"),
            @ApiResponse(responseCode = "409", description = "Email ya registrado")
    })
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createByAdmin(request));
    }

    /**
        * Endpoint de auto-perfil para mostrar datos de sesión y personalizar la interfaz.
     */
    @GetMapping("/me")
    @Operation(summary = "Perfil propio", description = "Retorna los datos del usuario autenticado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtenido"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar usuario", description = "Actualiza datos de un usuario (solo ADMIN)")
    public ResponseEntity<UserResponse> updateUser(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario (solo ADMIN)")
    public ResponseEntity<Void> deleteUser(@org.springframework.web.bind.annotation.PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
