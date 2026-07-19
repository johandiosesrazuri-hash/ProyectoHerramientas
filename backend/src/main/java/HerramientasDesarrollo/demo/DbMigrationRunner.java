package HerramientasDesarrollo.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class DbMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(DbMigrationRunner.class);

    public DbMigrationRunner(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("--- INICIANDO MIGRACION DE BASE DE DATOS ---");
        try {
            // 1. Añadir usuario_id a doctor si no existe
            jdbcTemplate.execute("ALTER TABLE doctor ADD COLUMN usuario_id BIGINT UNIQUE");
            jdbcTemplate.execute("ALTER TABLE doctor ADD CONSTRAINT fk_doctor_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL");
            logger.info("Columna usuario_id añadida a doctor");
        } catch (Exception e) {
            logger.warn("Columna usuario_id ya existe o error: " + e.getMessage());
        }

        try {
            // 2. Crear tabla paciente
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS paciente (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "usuario_id BIGINT UNIQUE NOT NULL, " +
                    "dni VARCHAR(20), " +
                    "telefono VARCHAR(20), " +
                    "fecha_nacimiento DATE, " +
                    "tipo_sangre VARCHAR(10), " +
                    "CONSTRAINT fk_paciente_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE" +
                    ")");
            logger.info("Tabla paciente creada");
        } catch (Exception e) {
            logger.warn("Error creando tabla paciente: " + e.getMessage());
        }

        // 3. Migrar Doctores
        List<Map<String, Object>> doctores = jdbcTemplate.queryForList("SELECT id, nombre, apellido FROM doctor WHERE usuario_id IS NULL");
        for (Map<String, Object> doctor : doctores) {
            Long doctorId = ((Number) doctor.get("id")).longValue();
            String nombre = (String) doctor.get("nombre");
            String apellido = (String) doctor.get("apellido");
            String emailBase = nombre.toLowerCase().replaceAll("\\s+", "") + "." + apellido.toLowerCase().replaceAll("\\s+", "") + "@clinica.com";
            String email = Normalizer.normalize(emailBase, Normalizer.Form.NFD).replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
            
            // Generate password
            String hash = passwordEncoder.encode("123456");
            
            // Insert user
            jdbcTemplate.update("INSERT INTO usuario (nombre, email, password, rol, created_at) VALUES (?, ?, ?, 'MEDICO', ?)",
                    nombre + " " + apellido, email, hash, LocalDateTime.now());
            
            // Get new user ID
            Long userId = jdbcTemplate.queryForObject("SELECT id FROM usuario WHERE email = ?", Long.class, email);
            
            // Update doctor
            jdbcTemplate.update("UPDATE doctor SET usuario_id = ? WHERE id = ?", userId, doctorId);
            logger.info("Migrado doctor ID " + doctorId + " con email " + email);
        }

        // 4. Migrar Pacientes (crear registro en tabla paciente para usuarios con rol PACIENTE)
        List<Map<String, Object>> pacientes = jdbcTemplate.queryForList(
            "SELECT u.id FROM usuario u LEFT JOIN paciente p ON u.id = p.usuario_id WHERE u.rol = 'PACIENTE' AND p.id IS NULL"
        );
        for (Map<String, Object> p : pacientes) {
            Long userId = ((Number) p.get("id")).longValue();
            jdbcTemplate.update("INSERT INTO paciente (usuario_id) VALUES (?)", userId);
            logger.info("Creado perfil de paciente vacío para usuario ID " + userId);
        }

        // 5. Corregir correos con tildes (ya existentes en la base de datos)
        List<Map<String, Object>> usuariosMedico = jdbcTemplate.queryForList("SELECT id, email FROM usuario WHERE rol = 'MEDICO'");
        for (Map<String, Object> u : usuariosMedico) {
            Long uId = ((Number) u.get("id")).longValue();
            String emailOriginal = (String) u.get("email");
            if (emailOriginal != null) {
                String normalized = Normalizer.normalize(emailOriginal, Normalizer.Form.NFD)
                        .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
                if (!normalized.equals(emailOriginal)) {
                    jdbcTemplate.update("UPDATE usuario SET email = ? WHERE id = ?", normalized, uId);
                    logger.info("Email corregido para usuario " + uId + ": " + normalized);
                }
            }
        }

        logger.info("--- MIGRACION FINALIZADA ---");
    }
}
