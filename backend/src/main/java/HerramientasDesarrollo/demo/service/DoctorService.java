package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.doctor.CreateDoctorRequest;
import HerramientasDesarrollo.demo.dto.doctor.DoctorListResponse;
import HerramientasDesarrollo.demo.dto.slot.DoctorSlotResponse;
import HerramientasDesarrollo.demo.entity.Doctor;
import HerramientasDesarrollo.demo.entity.Especialidad;
import HerramientasDesarrollo.demo.entity.Slot;
import HerramientasDesarrollo.demo.entity.SlotEstado;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.repository.DoctorRepository;
import HerramientasDesarrollo.demo.repository.EspecialidadRepository;
import HerramientasDesarrollo.demo.repository.SlotRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * Expone proyecciones de doctores orientadas a consulta pública y agenda diaria.
 */
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final SlotRepository slotRepository;
    private final EspecialidadRepository especialidadRepository;
    private final HerramientasDesarrollo.demo.repository.UsuarioRepository usuarioRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<DoctorListResponse> listDoctors(String search, String especialidad) {
        List<Doctor> doctors = doctorRepository.findForListing(search, especialidad);

        return doctors.stream()
                .map(this::toDoctorListResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorSlotResponse> getDoctorSlotsByDate(Long doctorId, LocalDate date) {
        List<Slot> slots = slotRepository.findByDoctorIdAndFechaOrderByHoraInicioAsc(doctorId, date);
        return slots.stream()
                .map(slot -> DoctorSlotResponse.builder()
                        .id(slot.getId())
                        .horaInicio(slot.getHoraInicio())
                        .horaFin(slot.getHoraFin())
                        .estado(slot.getEstado())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getDoctorAvailableDates(Long doctorId, LocalDate desde) {
        List<Slot> slots = slotRepository.findByDoctorIdAndEstadoAndFechaGreaterThanEqualOrderByFechaAscHoraInicioAsc(
                doctorId,
                SlotEstado.DISPONIBLE,
                desde
        );
        return slots.stream()
                .map(Slot::getFecha)
                .distinct()
                .toList();
    }

    @Transactional
    public DoctorListResponse createDoctor(CreateDoctorRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new HerramientasDesarrollo.demo.exception.EmailAlreadyExistsException("El email ya está registrado");
        }

        HerramientasDesarrollo.demo.entity.Usuario usuario = HerramientasDesarrollo.demo.entity.Usuario.builder()
                .nombre(request.getNombre() + " " + request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(HerramientasDesarrollo.demo.entity.Role.MEDICO)
                .build();
        usuario = usuarioRepository.save(usuario);

        Doctor doctor = new Doctor();
        doctor.setNombre(request.getNombre());
        doctor.setApellido(request.getApellido());
        doctor.setExperienciaAnios(request.getExperienciaAnios());
        doctor.setConsultorio(request.getConsultorio());
        doctor.setFotoUrl(request.getFotoUrl());
        doctor.setClinicaId(request.getClinicaId());
        doctor.setUsuario(usuario);

        if (request.getEspecialidadIds() != null && !request.getEspecialidadIds().isEmpty()) {
            Set<Especialidad> especialidades = new HashSet<>(
                    especialidadRepository.findAllById(request.getEspecialidadIds()));
            doctor.setEspecialidades(especialidades);
        }

        Doctor saved = doctorRepository.save(doctor);
        return toDoctorListResponse(saved);
    }

    @Transactional
    public DoctorListResponse updateDoctor(Long id, CreateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor no encontrado"));

        doctor.setNombre(request.getNombre());
        doctor.setApellido(request.getApellido());
        doctor.setExperienciaAnios(request.getExperienciaAnios());
        doctor.setConsultorio(request.getConsultorio());
        doctor.setFotoUrl(request.getFotoUrl());
        doctor.setClinicaId(request.getClinicaId());

        if (request.getEspecialidadIds() != null) {
            Set<Especialidad> especialidades = new HashSet<>(
                    especialidadRepository.findAllById(request.getEspecialidadIds()));
            doctor.setEspecialidades(especialidades);
        }

        Doctor saved = doctorRepository.save(doctor);
        return toDoctorListResponse(saved);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor no encontrado");
        }
        doctorRepository.deleteById(id);
    }

    private DoctorListResponse toDoctorListResponse(Doctor doctor) {
        Slot nextSlot = findNextAvailableSlot(doctor.getId());
                // Se concatena en una cadena única para simplificar renderizado en tarjetas de listado.
        String especialidadTexto = doctor.getEspecialidades().stream()
                .map(Especialidad::getNombre)
                .sorted()
                .collect(Collectors.joining(", "));

        return DoctorListResponse.builder()
                .id(doctor.getId())
                .nombre(doctor.getNombre() + " " + doctor.getApellido())
                .especialidad(especialidadTexto)
                .experiencia(doctor.getExperienciaAnios())
                .consultorio(doctor.getConsultorio())
                .foto(doctor.getFotoUrl())
                .proximaFechaDisponible(nextSlot != null ? nextSlot.getFecha() : null)
                .proximaHoraDisponible(nextSlot != null ? nextSlot.getHoraInicio() : null)
                .estado(nextSlot != null ? "DISPONIBLE" : "SIN_DISPONIBILIDAD")
                .build();
    }

    private Slot findNextAvailableSlot(Long doctorId) {
        List<Slot> available = slotRepository.findByDoctorIdAndEstadoAndFechaGreaterThanEqualOrderByFechaAscHoraInicioAsc(
                doctorId,
                SlotEstado.DISPONIBLE,
                LocalDate.now()
        );

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Si no hay slots futuros estrictos, se devuelve el primero disponible como fallback funcional.
        return available.stream()
                .filter(s -> s.getFecha().isAfter(today) || !s.getHoraInicio().isBefore(now))
                .findFirst()
                .orElse(available.isEmpty() ? null : available.getFirst());
    }
}
