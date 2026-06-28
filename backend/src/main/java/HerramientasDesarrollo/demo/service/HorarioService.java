package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.horario.CreateHorarioRequest;
import HerramientasDesarrollo.demo.dto.horario.HorarioResponse;
import HerramientasDesarrollo.demo.entity.Doctor;
import HerramientasDesarrollo.demo.entity.HorarioBase;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.exception.ScheduleOverlapException;
import HerramientasDesarrollo.demo.repository.DoctorRepository;
import HerramientasDesarrollo.demo.repository.HorarioBaseRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * Administra la plantilla semanal de atención de cada médico.
 */
public class HorarioService {

    private final HorarioBaseRepository horarioBaseRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public HorarioBase createHorario(CreateHorarioRequest request) {
        if (!request.getHoraInicio().isBefore(request.getHoraFin())) {
            throw new IllegalArgumentException("horaInicio debe ser menor que horaFin");
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor no encontrado"));

        boolean overlap = horarioBaseRepository.existsByDoctorIdAndDiaSemanaAndHoraInicioLessThanAndHoraFinGreaterThan(
                request.getDoctorId(),
                request.getDiaSemana(),
                request.getHoraFin(),
                request.getHoraInicio()
        );

        // Regla de negocio clave: un médico no puede tener dos bloques que se crucen.
        if (overlap) {
            throw new ScheduleOverlapException("El horario se superpone con otro horario base del doctor");
        }

        HorarioBase horarioBase = new HorarioBase();
        horarioBase.setDoctor(doctor);
        horarioBase.setDiaSemana(request.getDiaSemana());
        horarioBase.setHoraInicio(request.getHoraInicio());
        horarioBase.setHoraFin(request.getHoraFin());

        return horarioBaseRepository.save(horarioBase);
    }

    @Transactional(readOnly = true)
    public List<HorarioResponse> findByDoctorId(Long doctorId) {
        return horarioBaseRepository.findByDoctorId(doctorId).stream()
                .map(h -> HorarioResponse.builder()
                        .id(h.getId())
                        .doctorId(h.getDoctor().getId())
                        .diaSemana(h.getDiaSemana())
                        .horaInicio(h.getHoraInicio())
                        .horaFin(h.getHoraFin())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioResponse> findAll() {
        return horarioBaseRepository.findAll().stream()
                .map(h -> HorarioResponse.builder()
                        .id(h.getId())
                        .doctorId(h.getDoctor().getId())
                        .diaSemana(h.getDiaSemana())
                        .horaInicio(h.getHoraInicio())
                        .horaFin(h.getHoraFin())
                        .build())
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        if (!horarioBaseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Horario no encontrado");
        }
        horarioBaseRepository.deleteById(id);
    }
}
