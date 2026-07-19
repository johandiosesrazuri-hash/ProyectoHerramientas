package HerramientasDesarrollo.demo.repository;

import HerramientasDesarrollo.demo.entity.MensajeSoporte;
import HerramientasDesarrollo.demo.entity.TicketSoporte;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeSoporteRepository extends JpaRepository<MensajeSoporte, Long> {
    List<MensajeSoporte> findByTicketOrderByFechaAsc(TicketSoporte ticket);
}
