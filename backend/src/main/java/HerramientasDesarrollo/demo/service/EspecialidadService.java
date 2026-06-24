package HerramientasDesarrollo.demo.service;

import HerramientasDesarrollo.demo.dto.especialidad.CreateEspecialidadRequest;
import HerramientasDesarrollo.demo.dto.especialidad.EspecialidadResponse;
import HerramientasDesarrollo.demo.entity.Especialidad;
import HerramientasDesarrollo.demo.exception.EmailAlreadyExistsException;
import HerramientasDesarrollo.demo.exception.ResourceNotFoundException;
import HerramientasDesarrollo.demo.repository.EspecialidadRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * CRUD completo de especialidades con validaciones de unicidad.
 */
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    @Transactional(readOnly = true)
    public List<EspecialidadResponse> findAll() {
        return especialidadRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EspecialidadResponse create(CreateEspecialidadRequest request) {
        if (especialidadRepository.existsByNombre(request.getNombre())) {
            throw new EmailAlreadyExistsException("Ya existe una especialidad con ese nombre");
        }
        Especialidad entity = new Especialidad();
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        return toResponse(especialidadRepository.save(entity));
    }

    @Transactional
    public EspecialidadResponse update(Long id, CreateEspecialidadRequest request) {
        Especialidad entity = especialidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada"));
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        return toResponse(especialidadRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!especialidadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Especialidad no encontrada");
        }
        especialidadRepository.deleteById(id);
    }

    private EspecialidadResponse toResponse(Especialidad entity) {
        return EspecialidadResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .build();
    }
}
