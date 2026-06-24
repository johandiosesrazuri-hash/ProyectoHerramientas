package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.user.CreateUserRequest;
import HerramientasDesarrollo.demo.dto.user.UserResponse;
import HerramientasDesarrollo.demo.entity.Usuario;
import HerramientasDesarrollo.demo.exception.EmailAlreadyExistsException;
import HerramientasDesarrollo.demo.repository.UsuarioRepository;
import HerramientasDesarrollo.demo.security.UserPrincipal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
/**
 * Capa de aplicación para administración de usuarios y proyección de perfil.
 */
public class UserService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> findAll() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse createByAdmin(CreateUserRequest request) {
        // El alta administrativa valida unicidad antes de persistir para devolver error de negocio claro.
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("El email ya está registrado");
        }

        Usuario user = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .build();

        Usuario saved = usuarioRepository.save(user);
        return toResponse(saved);
    }

    public UserResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        return toResponse(principal.getUsuario());
    }

    public UserResponse toResponse(Usuario user) {
        return UserResponse.builder()
                .id(user.getId())
                .nombre(user.getNombre())
                .email(user.getEmail())
                .rol(user.getRol())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserResponse updateUser(Long id, CreateUserRequest request) {
        Usuario user = usuarioRepository.findById(id)
                .orElseThrow(() -> new HerramientasDesarrollo.demo.exception.ResourceNotFoundException("Usuario no encontrado"));
        
        if (!user.getEmail().equals(request.getEmail()) && usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("El email ya está registrado");
        }

        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());
        user.setRol(request.getRol());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(usuarioRepository.save(user));
    }

    public void deleteUser(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new HerramientasDesarrollo.demo.exception.ResourceNotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
