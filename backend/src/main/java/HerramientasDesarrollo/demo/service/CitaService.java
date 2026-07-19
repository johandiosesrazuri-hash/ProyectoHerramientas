package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.cita.CitaAdminResponse;
import HerramientasDesarrollo.demo.dto.cita.CitaHistoryResponse;
import HerramientasDesarrollo.demo.dto.cita.CitaResponse;
import HerramientasDesarrollo.demo.dto.cita.CreateCitaRequest;
import HerramientasDesarrollo.demo.entity.Cita;
import HerramientasDesarrollo.demo.entity.CitaEstado;
import HerramientasDesarrollo.demo.entity.Slot;
import HerramientasDesarrollo.demo.entity.SlotEstado;
import HerramientasDesarrollo.demo.entity.Usuario;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.exception.SlotNotAvailableException;
import HerramientasDesarrollo.demo.repository.CitaRepository;
import HerramientasDesarrollo.demo.repository.DoctorRepository;
import HerramientasDesarrollo.demo.repository.SlotRepository;
import HerramientasDesarrollo.demo.repository.UsuarioRepository;
import HerramientasDesarrollo.demo.security.UserPrincipal;
import java.util.List;
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
    private final DoctorRepository doctorRepository;

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

        return CitaResponse.builder()
                .id(saved.getId())
                .slotId(saved.getSlot().getId())
                .doctorId(saved.getSlot().getDoctor().getId())
                .fecha(saved.getSlot().getFecha())
                .horaInicio(saved.getSlot().getHoraInicio())
                .horaFin(saved.getSlot().getHoraFin())
                .estado(saved.getEstado())
                .motivo(saved.getMotivo())
                .build();
    }

    /**
     * Recupera el historial de citas visible para el usuario autenticado.
     * - ADMIN: todas las citas
     * - PACIENTE: sólo sus citas
     * - MEDICO: requiere doctorId como parámetro
     */
    @Transactional(readOnly = true)
    public List<CitaHistoryResponse> getHistorial(Authentication authentication, Long doctorId, String search, String estado) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Usuario no autenticado");
        }

        var usuario = principal.getUsuario();
        var rol = usuario.getRol();

        List<Cita> citas;

        switch (rol) {
            case ADMIN:
                citas = citaRepository.findAllWithDetails();
                break;
            case PACIENTE:
                citas = citaRepository.findByUsuarioIdWithDetails(usuario.getId());
                break;
            case MEDICO:
                Long docId = doctorId;
                if (docId == null) {
                    var doc = doctorRepository.findByUsuarioId(usuario.getId()).orElse(null);
                    if (doc != null) docId = doc.getId();
                }
                if (docId == null) {
                    throw new IllegalStateException("Rol no soportado para historial");
                }
                citas = citaRepository.findByDoctorIdWithDetails(docId);
                break;
            default:
                throw new IllegalStateException("Rol no soportado para historial");
        }

        final String searchLower = (search == null) ? null : search.trim().toLowerCase();
        final CitaEstado estadoEnum = (estado == null || estado.isBlank()) ? null : CitaEstado.valueOf(estado);

        return citas.stream()
                .filter(c -> {
                    if (estadoEnum != null && c.getEstado() != estadoEnum) return false;
                    if (searchLower == null || searchLower.isEmpty()) return true;
                    String doctorFull = c.getSlot().getDoctor().getNombre() + " " + c.getSlot().getDoctor().getApellido();
                    String especialidades = c.getSlot().getDoctor().getEspecialidades().stream().map(e -> e.getNombre()).reduce((a, b) -> a + ", " + b).orElse("");
                    String paciente = c.getUsuario().getNombre();
                    return doctorFull.toLowerCase().contains(searchLower)
                            || especialidades.toLowerCase().contains(searchLower)
                            || paciente.toLowerCase().contains(searchLower);
                })
                .map(c -> {
                    var s = c.getSlot();
                    var d = s.getDoctor();
                    String especial = d.getEspecialidades().stream().map(e -> e.getNombre()).reduce((a, b) -> a + ", " + b).orElse("");
                    return CitaHistoryResponse.builder()
                            .id(c.getId())
                            .fecha(s.getFecha())
                            .horaInicio(s.getHoraInicio())
                            .doctorNombre(d.getNombre() + " " + d.getApellido())
                            .especialidad(especial)
                            .consultorio(d.getConsultorio())
                            .estado(c.getEstado())
                            .motivo(c.getMotivo())
                            .pacienteNombre(c.getUsuario().getNombre())
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaAdminResponse> findAll() {
        return citaRepository.findAllWithDetails().stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional
    public CitaAdminResponse updateEstado(Long id, CitaEstado nuevoEstado, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        Usuario usuario = principal.getUsuario();

        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));

        if (usuario.getRol() == HerramientasDesarrollo.demo.entity.Role.MEDICO) {
            Long doctorId = doctorRepository.findByUsuarioId(usuario.getId())
                    .map(HerramientasDesarrollo.demo.entity.Doctor::getId)
                    .orElseThrow(() -> new IllegalStateException("No se encontró el doctor asociado al usuario médico"));
            if (!cita.getSlot().getDoctor().getId().equals(doctorId)) {
                throw new org.springframework.security.access.AccessDeniedException("No puedes modificar citas de otros doctores");
            }
        }

        cita.setEstado(nuevoEstado);

        // Si se cancela la cita, liberar el slot para que otro paciente lo reserve.
        if (nuevoEstado == CitaEstado.CANCELADA) {
            Slot slot = cita.getSlot();
            slot.setEstado(SlotEstado.DISPONIBLE);
            slotRepository.save(slot);
        }

        Cita saved = citaRepository.save(cita);
        return toAdminResponse(saved);
    }

    private CitaAdminResponse toAdminResponse(Cita cita) {
        return CitaAdminResponse.builder()
                .id(cita.getId())
                .slotId(cita.getSlot().getId())
                .doctorId(cita.getSlot().getDoctor().getId())
                .doctorNombre(cita.getSlot().getDoctor().getNombre() + " " + cita.getSlot().getDoctor().getApellido())
                .usuarioId(cita.getUsuario().getId())
                .pacienteNombre(cita.getUsuario().getNombre())
                .pacienteEmail(cita.getUsuario().getEmail())
                .fecha(cita.getSlot().getFecha())
                .horaInicio(cita.getSlot().getHoraInicio())
                .horaFin(cita.getSlot().getHoraFin())
                .estado(cita.getEstado())
                .motivo(cita.getMotivo())
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
