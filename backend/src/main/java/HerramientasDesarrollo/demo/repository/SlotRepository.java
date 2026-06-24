package HerramientasDesarrollo.demo.repository;

import HerramientasDesarrollo.demo.entity.Slot;
import HerramientasDesarrollo.demo.entity.SlotEstado;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

/**
 * Consultas de agenda por doctor/fecha y lectura con lock para reservas seguras.
 */
public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorIdAndFechaOrderByHoraInicioAsc(Long doctorId, LocalDate fecha);

    List<Slot> findByDoctorIdAndEstadoAndFechaGreaterThanEqualOrderByFechaAscHoraInicioAsc(
            Long doctorId,
            SlotEstado estado,
            LocalDate fecha
    );

    boolean existsByDoctorIdAndFechaAndHoraInicio(Long doctorId, LocalDate fecha, LocalTime horaInicio);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Slot> findWithLockingById(Long id);

    long countByEstado(SlotEstado estado);
}
