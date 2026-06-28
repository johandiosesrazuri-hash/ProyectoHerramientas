package HerramientasDesarrollo.demo.repository;

import HerramientasDesarrollo.demo.entity.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Persistencia de especialidades médicas con validación de unicidad por nombre.
 */
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {
    boolean existsByNombre(String nombre);
}
