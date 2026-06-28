package HerramientasDesarrollo.demo.controller;

import HerramientasDesarrollo.demo.dto.slot.GenerateSlotsRequest;
import HerramientasDesarrollo.demo.dto.slot.GenerateSlotsResponse;
import HerramientasDesarrollo.demo.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@Tag(name = "Slots", description = "Generación y administración de slots")
/**
 * Expone operaciones batch sobre slots derivados de horarios base.
 */
public class SlotController {

    private final SlotService slotService;
    private final HerramientasDesarrollo.demo.repository.SlotRepository slotRepository;

    /**
        * Materializa agenda en bloques de 30 minutos dentro de un rango de fechas,
        * evitando duplicar franjas ya existentes.
     */
    @PostMapping("/generar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generar slots", description = "Genera slots de 30 minutos en un rango de fechas evitando duplicados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Slots generados"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos"),
            @ApiResponse(responseCode = "404", description = "Doctor no encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflicto de negocio")
    })
    public ResponseEntity<GenerateSlotsResponse> generarSlots(@Valid @RequestBody GenerateSlotsRequest request) {
        return ResponseEntity.ok(slotService.generarSlots(request));
    }

    @org.springframework.web.bind.annotation.GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar slots", description = "Lista slots (opcionalmente filtrados por doctor y fecha)")
    public ResponseEntity<java.util.List<HerramientasDesarrollo.demo.dto.slot.DoctorSlotResponse>> getSlots(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long doctorId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fecha
    ) {
        java.util.List<HerramientasDesarrollo.demo.entity.Slot> slots;
        if (doctorId != null && fecha != null) {
            slots = slotRepository.findByDoctorIdAndFechaOrderByHoraInicioAsc(doctorId, fecha);
        } else {
            slots = slotRepository.findAll();
        }
        java.util.List<HerramientasDesarrollo.demo.dto.slot.DoctorSlotResponse> response = slots.stream()
                .map(slot -> HerramientasDesarrollo.demo.dto.slot.DoctorSlotResponse.builder()
                        .id(slot.getId())
                        .horaInicio(slot.getHoraInicio())
                        .horaFin(slot.getHoraFin())
                        .estado(slot.getEstado())
                        .build())
                .toList();
        return ResponseEntity.ok(response);
    }
}
