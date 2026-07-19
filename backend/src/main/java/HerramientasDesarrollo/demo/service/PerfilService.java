package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.user.PerfilResponse;
import HerramientasDesarrollo.demo.dto.user.UpdatePerfilRequest;
import HerramientasDesarrollo.demo.entity.Especialidad;
import HerramientasDesarrollo.demo.entity.Paciente;
import HerramientasDesarrollo.demo.entity.Role;
import HerramientasDesarrollo.demo.entity.Usuario;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.repository.DoctorRepository;
import HerramientasDesarrollo.demo.repository.PacienteRepository;
import HerramientasDesarrollo.demo.repository.UsuarioRepository;
import HerramientasDesarrollo.demo.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public PerfilResponse getPerfilCompleto(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Usuario usuario = principal.getUsuario();

        PerfilResponse.PerfilResponseBuilder builder = PerfilResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .createdAt(usuario.getCreatedAt());

        if (usuario.getRol() == Role.PACIENTE) {
            pacienteRepository.findByUsuarioId(usuario.getId()).ifPresent(paciente -> {
                builder.dni(paciente.getDni())
                       .telefono(paciente.getTelefono())
                       .fechaNacimiento(paciente.getFechaNacimiento())
                       .tipoSangre(paciente.getTipoSangre());
            });
        } else if (usuario.getRol() == Role.MEDICO) {
            doctorRepository.findByUsuarioId(usuario.getId()).ifPresent(doctor -> {
                String especialidades = doctor.getEspecialidades().stream()
                        .map(Especialidad::getNombre)
                        .collect(Collectors.joining(", "));
                builder.doctorId(doctor.getId())
                       .especialidad(especialidades)
                       .consultorio(doctor.getConsultorio())
                       .experienciaAnios(doctor.getExperienciaAnios());
            });
        }

        return builder.build();
    }

    @Transactional
    public PerfilResponse updatePerfil(Authentication authentication, UpdatePerfilRequest request) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            usuario.setNombre(request.getNombre());
        }

        final Usuario usuarioGuardado = usuarioRepository.save(usuario);

        if (usuarioGuardado.getRol() == Role.PACIENTE) {
            Paciente paciente = pacienteRepository.findByUsuarioId(usuarioGuardado.getId())
                    .orElseGet(() -> Paciente.builder().usuario(usuarioGuardado).build());
            
            paciente.setDni(request.getDni());
            paciente.setTelefono(request.getTelefono());
            paciente.setFechaNacimiento(request.getFechaNacimiento());
            paciente.setTipoSangre(request.getTipoSangre());
            pacienteRepository.save(paciente);
        }

        return getPerfilCompleto(authentication);
    }
}
