package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.cita.CitaResponse;
import HerramientasDesarrollo.demo.dto.cita.CreateCitaRequest;
import HerramientasDesarrollo.demo.entity.Cita;
import HerramientasDesarrollo.demo.entity.CitaEstado;
import HerramientasDesarrollo.demo.entity.Doctor;
import HerramientasDesarrollo.demo.entity.Slot;
import HerramientasDesarrollo.demo.entity.SlotEstado;
import HerramientasDesarrollo.demo.entity.Usuario;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.exception.SlotNotAvailableException;
import HerramientasDesarrollo.demo.repository.CitaRepository;
import HerramientasDesarrollo.demo.repository.SlotRepository;
import HerramientasDesarrollo.demo.repository.UsuarioRepository;
import HerramientasDesarrollo.demo.security.UserPrincipal;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * Maneja la reserva transaccional de citas, garantizando consistencia entre Cita y Slot.
 */
public class CitaService {

    private final CitaRepository citaRepository;
    private final SlotRepository slotRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public CitaResponse createCita(CreateCitaRequest request, Authentication authentication) {
        Long usuarioId = getAuthenticatedUserId(authentication);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Bloqueo pesimista para evitar doble reserva cuando hay concurrencia alta.
        Slot slot = slotRepository.findWithLockingById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot no encontrado"));

        // Doble validación por estado + existencia de cita vinculada al slot.
        if (slot.getEstado() != SlotEstado.DISPONIBLE || citaRepository.existsBySlotId(slot.getId())) {
            throw new SlotNotAvailableException("El slot ya no está disponible");
        }

        Cita cita = new Cita();
        cita.setUsuario(usuario);
        cita.setSlot(slot);
        cita.setEstado(CitaEstado.RESERVADA);
        cita.setMotivo(request.getMotivo());

        slot.setEstado(SlotEstado.OCUPADO);
        slotRepository.save(slot);

        Cita saved = citaRepository.save(cita);

        return mapCitaToCitaResponse(saved);
    }

    public List<CitaResponse> getCitasByUsuarioId(Authentication authentication) {
        Long usuarioId = getAuthenticatedUserId(authentication);
        List<Cita> citas = citaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
        return citas.stream()
                .map(this::mapCitaToCitaResponse)
                .collect(Collectors.toList());
    }

    public List<CitaResponse> getCitasByDoctorId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Usuario no autenticado");
        }

        Usuario usuario = principal.getUsuario();
        if (!usuario.getRol().name().equals("DOCTOR")) {
            throw new IllegalStateException("Solo los doctores pueden ver su historial de citas");
        }

        // Asumimos que usuario_id = doctor_id para doctores
        Long doctorId = usuario.getId();
        List<Cita> citas = citaRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        return citas.stream()
                .map(this::mapCitaToCitaResponse)
                .collect(Collectors.toList());
    }

    private CitaResponse mapCitaToCitaResponse(Cita cita) {
        Doctor doctor = cita.getSlot().getDoctor();
        Usuario usuario = cita.getUsuario();
        
        return CitaResponse.builder()
                .id(cita.getId())
                .slotId(cita.getSlot().getId())
                .doctorId(doctor.getId())
                .usuarioId(usuario.getId())
                .fecha(cita.getSlot().getFecha())
                .horaInicio(cita.getSlot().getHoraInicio())
                .horaFin(cita.getSlot().getHoraFin())
                .estado(cita.getEstado())
                .motivo(cita.getMotivo())
                .pacienteNombre(usuario.getNombre())
                .pacienteEmail(usuario.getEmail())
                .doctorNombre(doctor.getNombre() + " " + doctor.getApellido())
                .createdAt(cita.getCreatedAt())
                .build();
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        return principal.getUsuario().getId();
    }
}
