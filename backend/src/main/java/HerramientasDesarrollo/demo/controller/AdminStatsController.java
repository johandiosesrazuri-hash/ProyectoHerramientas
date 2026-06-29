package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.admin.AdminStatsResponse;
import HerramientasDesarrollo.demo.entity.CitaEstado;
import HerramientasDesarrollo.demo.entity.SlotEstado;
import HerramientasDesarrollo.demo.repository.CitaRepository;
import HerramientasDesarrollo.demo.repository.DoctorRepository;
import HerramientasDesarrollo.demo.repository.EspecialidadRepository;
import HerramientasDesarrollo.demo.repository.SlotRepository;
import HerramientasDesarrollo.demo.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Endpoints exclusivos del panel de administración")
/**
 * Provee métricas agregadas para las tarjetas de resumen del dashboard.
 */
public class AdminStatsController {

    private final UsuarioRepository usuarioRepository;
    private final DoctorRepository doctorRepository;
    private final EspecialidadRepository especialidadRepository;
    private final CitaRepository citaRepository;
    private final SlotRepository slotRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Estadísticas del sistema", description = "Retorna conteos globales para el dashboard")
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse stats = AdminStatsResponse.builder()
                .totalUsuarios(usuarioRepository.count())
                .totalDoctores(doctorRepository.count())
                .totalEspecialidades(especialidadRepository.count())
                .totalCitas(citaRepository.count())
                .citasReservadas(citaRepository.countByEstado(CitaEstado.RESERVADA))
                .citasConfirmadas(citaRepository.countByEstado(CitaEstado.CONFIRMADA))
                .citasAtendidas(citaRepository.countByEstado(CitaEstado.ATENDIDA))
                .citasCanceladas(citaRepository.countByEstado(CitaEstado.CANCELADA))
                .slotsDisponibles(slotRepository.countByEstado(SlotEstado.DISPONIBLE))
                .slotsOcupados(slotRepository.countByEstado(SlotEstado.OCUPADO))
                .build();

        return ResponseEntity.ok(stats);
    }
}
