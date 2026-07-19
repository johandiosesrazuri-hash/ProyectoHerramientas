package HerramientasDesarrollo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import HerramientasDesarrollo.demo.entity.Doctor;

/**
 * Provee consultas optimizadas para listado de doctores con filtros de catálogo.
 */
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("select distinct d from Doctor d left join fetch d.especialidades e where (:search is null or :search = '' or lower(concat(coalesce(d.nombre,''), ' ', coalesce(d.apellido,''), ' ', coalesce(d.consultorio,''))) like lower(concat('%', :search, '%'))) and (:especialidad is null or :especialidad = '' or lower(e.nombre) = lower(:especialidad))")
    List<Doctor> findForListing(
            @Param("search") String search,
            @Param("especialidad") String especialidad
    );

    java.util.Optional<Doctor> findByUsuarioId(Long usuarioId);
}
