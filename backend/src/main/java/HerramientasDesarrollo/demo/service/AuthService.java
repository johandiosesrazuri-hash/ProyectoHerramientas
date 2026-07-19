package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.auth.AuthResponse;
import HerramientasDesarrollo.demo.dto.auth.LoginRequest;
import HerramientasDesarrollo.demo.dto.auth.RegisterRequest;
import HerramientasDesarrollo.demo.dto.user.UserResponse;
import HerramientasDesarrollo.demo.entity.Role;
import HerramientasDesarrollo.demo.entity.Usuario;
import HerramientasDesarrollo.demo.exception.EmailAlreadyExistsException;
import HerramientasDesarrollo.demo.exception.UnauthorizedRoleAssignmentException;
import HerramientasDesarrollo.demo.repository.UsuarioRepository;
import HerramientasDesarrollo.demo.security.JwtService;
import HerramientasDesarrollo.demo.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
/**
 * Orquesta registro e inicio de sesión, incluyendo reglas de negocio de roles.
 */
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final HerramientasDesarrollo.demo.repository.PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthResponse register(RegisterRequest request, Authentication authentication) {
        // Primera barrera de integridad para evitar colisión de credenciales.
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("El email ya está registrado");
        }

        Role requestedRole = request.getRol() != null ? request.getRol() : Role.PACIENTE;
        boolean adminCreatingPrivilegedUser = requestedRole == Role.ADMIN || requestedRole == Role.MEDICO;

        // Solo un ADMIN autenticado puede provisionar cuentas de administración o médicas.
        if (adminCreatingPrivilegedUser && !isAuthenticatedAdmin(authentication)) {
            throw new UnauthorizedRoleAssignmentException(
                    "Solo ADMIN puede registrar usuarios con rol ADMIN o MEDICO"
            );
        }

        Usuario user = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(requestedRole)
                .build();

        Usuario saved = usuarioRepository.save(user);
        if (saved.getRol() == Role.PACIENTE) {
            pacienteRepository.save(HerramientasDesarrollo.demo.entity.Paciente.builder().usuario(saved).build());
        }
        
        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtService.generateToken(principal);
        UserResponse userResponse = userService.toResponse(saved);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            // Delega validación de credenciales al AuthenticationManager configurado en Security.
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userService.toResponse(principal.getUsuario()))
                .build();
    }

    private boolean isAuthenticatedAdmin(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }
        return principal.getUsuario().getRol() == Role.ADMIN;
    }
}
