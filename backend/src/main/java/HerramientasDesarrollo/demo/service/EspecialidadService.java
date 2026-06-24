package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.especialidad.EspecialidadResponse;
import HerramientasDesarrollo.demo.entity.Especialidad;
import HerramientasDesarrollo.demo.repository.EspecialidadRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * Servicio para la gestión del catálogo de especialidades médicas.
 */
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    /**
     * Obtiene todas las especialidades disponibles ordenadas por nombre.
     */
    @Transactional(readOnly = true)
    public List<EspecialidadResponse> getAllEspecialidades() {
        List<Especialidad> especialidades = especialidadRepository.findAllByOrderByNombreAsc();
        return especialidades.stream()
                .map(this::toEspecialidadResponse)
                .toList();
    }

    /**
     * Obtiene una especialidad por su ID.
     */
    @Transactional(readOnly = true)
    public EspecialidadResponse getEspecialidadById(Long id) {
        Especialidad especialidad = especialidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));
        return toEspecialidadResponse(especialidad);
    }

    private EspecialidadResponse toEspecialidadResponse(Especialidad especialidad) {
        return EspecialidadResponse.builder()
                .id(especialidad.getId())
                .nombre(especialidad.getNombre())
                .descripcion(especialidad.getDescripcion())
                .build();
    }
}
