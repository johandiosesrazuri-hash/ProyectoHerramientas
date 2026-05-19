package HerramientasDesarrollo.demo.repository;

import HerramientasDesarrollo.demo.entity.Cita;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Persistencia de reservas y validación de unicidad por slot.
 */
public interface CitaRepository extends JpaRepository<Cita, Long> {
    boolean existsBySlotId(Long slotId);

    List<Cita> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    @Query("SELECT c FROM Cita c WHERE c.slot.doctor.id = :doctorId ORDER BY c.createdAt DESC")
    List<Cita> findByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId);
}
