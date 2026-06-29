package HerramientasDesarrollo.demo.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
/**
 * Contadores globales para las tarjetas de resumen del dashboard administrativo.
 */
public class AdminStatsResponse {
    private long totalUsuarios;
    private long totalDoctores;
    private long totalEspecialidades;
    private long totalCitas;
    private long citasReservadas;
    private long citasConfirmadas;
    private long citasAtendidas;
    private long citasCanceladas;
    private long slotsDisponibles;
    private long slotsOcupados;
}
