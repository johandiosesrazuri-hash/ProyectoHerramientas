package HerramientasDesarrollo.demo.repository;

import HerramientasDesarrollo.demo.entity.EstadoTicket;
import HerramientasDesarrollo.demo.entity.TicketSoporte;
import HerramientasDesarrollo.demo.entity.Usuario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketSoporteRepository extends JpaRepository<TicketSoporte, Long> {
    List<TicketSoporte> findByUsuarioOrderByCreatedAtDesc(Usuario usuario);

    List<TicketSoporte> findAllByOrderByCreatedAtDesc();

    List<TicketSoporte> findByEstadoOrderByCreatedAtDesc(EstadoTicket estado);
}
