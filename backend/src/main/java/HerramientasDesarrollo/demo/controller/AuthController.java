package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.auth.AuthResponse;
import HerramientasDesarrollo.demo.dto.auth.LoginRequest;
import HerramientasDesarrollo.demo.dto.auth.RegisterRequest;
import HerramientasDesarrollo.demo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticación y registro de usuarios")
/**
 * Controlador responsable del ciclo de vida de autenticación (alta e inicio de
 * sesión).
 */
public class AuthController {

    private final AuthService authService;

    /**
     * Registra usuarios nuevos. Si la solicitud intenta crear roles elevados,
     * exige que quien invoca ya tenga privilegios de administrador.
     */
    @PostMapping("/register")
    @Operation(summary = "Registrar usuario", description = "Registra usuario; por defecto PACIENTE. ADMIN puede crear ADMIN/MEDICO")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "403", description = "No autorizado para asignar rol"),
            @ApiResponse(responseCode = "409", description = "Email ya registrado")
    })
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request, authentication));
    }

    /**
     * Autentica credenciales y devuelve un JWT con claims de identidad y rol.
     */
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Valida credenciales y retorna token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "401", description = "Credenciales invalidas")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
