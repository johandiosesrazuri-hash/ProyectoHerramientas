package HerramientasDesarrollo.demo.repository;

import HerramientasDesarrollo.demo.entity.Cita;
import HerramientasDesarrollo.demo.entity.CitaEstado;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Persistencia de reservas y validación de unicidad por slot.
 */
public interface CitaRepository extends JpaRepository<Cita, Long> {
    boolean existsBySlotId(Long slotId);

    long countByEstado(CitaEstado estado);

    @Query("select c from Cita c join fetch c.slot s join fetch s.doctor d join fetch c.usuario u order by c.createdAt desc")
    List<Cita> findAllWithDetails();

    @Query("select c from Cita c join fetch c.slot s join fetch s.doctor d join fetch c.usuario u where u.id = :usuarioId order by c.createdAt desc")
    List<Cita> findByUsuarioIdWithDetails(@Param("usuarioId") Long usuarioId);

    @Query("select c from Cita c join fetch c.slot s join fetch s.doctor d join fetch c.usuario u where d.id = :doctorId order by c.createdAt desc")
    List<Cita> findByDoctorIdWithDetails(@Param("doctorId") Long doctorId);
}
