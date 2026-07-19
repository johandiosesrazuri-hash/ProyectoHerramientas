-- ============================================================
-- Script: Generar horarios base y slots para 14 doctores
-- Rango: 2026-07-19 al 2026-07-31
-- Slots de 30 minutos, estado DISPONIBLE
-- dia_semana: 1=Lunes, 2=Martes, ..., 5=Viernes, 6=Sábado, 7=Domingo
-- ============================================================

-- ============================================================
-- PASO 1: Horarios base para doctores 4-14
-- (Doctores 1-3 ya tienen horarios en bdactualizada.sql)
-- Se usan horarios variados y realistas
-- ============================================================

-- Doctor 4: Lunes a Viernes, 08:00-16:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(4, 1, '08:00:00', '16:00:00'),
(4, 2, '08:00:00', '16:00:00'),
(4, 3, '08:00:00', '16:00:00'),
(4, 4, '08:00:00', '16:00:00'),
(4, 5, '08:00:00', '16:00:00');

-- Doctor 5: Lunes, Miércoles, Viernes, 09:00-17:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(5, 1, '09:00:00', '17:00:00'),
(5, 3, '09:00:00', '17:00:00'),
(5, 5, '09:00:00', '17:00:00');

-- Doctor 6: Martes, Jueves, Sábado, 10:00-18:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(6, 2, '10:00:00', '18:00:00'),
(6, 4, '10:00:00', '18:00:00'),
(6, 6, '10:00:00', '18:00:00');

-- Doctor 7: Lunes a Viernes, 07:00-15:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(7, 1, '07:00:00', '15:00:00'),
(7, 2, '07:00:00', '15:00:00'),
(7, 3, '07:00:00', '15:00:00'),
(7, 4, '07:00:00', '15:00:00'),
(7, 5, '07:00:00', '15:00:00');

-- Doctor 8: Lunes, Martes, Jueves, 11:00-19:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(8, 1, '11:00:00', '19:00:00'),
(8, 2, '11:00:00', '19:00:00'),
(8, 4, '11:00:00', '19:00:00');

-- Doctor 9: Miércoles a Sábado, 08:30-16:30
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(9, 3, '08:30:00', '16:30:00'),
(9, 4, '08:30:00', '16:30:00'),
(9, 5, '08:30:00', '16:30:00'),
(9, 6, '08:30:00', '16:30:00');

-- Doctor 10: Lunes a Viernes, 10:00-18:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(10, 1, '10:00:00', '18:00:00'),
(10, 2, '10:00:00', '18:00:00'),
(10, 3, '10:00:00', '18:00:00'),
(10, 4, '10:00:00', '18:00:00'),
(10, 5, '10:00:00', '18:00:00');

-- Doctor 11: Lunes, Miércoles, Viernes, 07:30-15:30
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(11, 1, '07:30:00', '15:30:00'),
(11, 3, '07:30:00', '15:30:00'),
(11, 5, '07:30:00', '15:30:00');

-- Doctor 12: Martes, Jueves, 13:00-20:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(12, 2, '13:00:00', '20:00:00'),
(12, 4, '13:00:00', '20:00:00');

-- Doctor 13: Lunes a Viernes, 09:00-17:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(13, 1, '09:00:00', '17:00:00'),
(13, 2, '09:00:00', '17:00:00'),
(13, 3, '09:00:00', '17:00:00'),
(13, 4, '09:00:00', '17:00:00'),
(13, 5, '09:00:00', '17:00:00');

-- Doctor 14: Lunes, Miércoles, Viernes, Sábado, 08:00-14:00
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(14, 1, '08:00:00', '14:00:00'),
(14, 3, '08:00:00', '14:00:00'),
(14, 5, '08:00:00', '14:00:00'),
(14, 6, '08:00:00', '14:00:00');

-- También corregir el horario de Luis Fernández (doctor 3)
-- En bdactualizada.sql se insertó con doctor_id=2 por error
-- Si doctor 3 no tiene horarios, los agregamos:
INSERT IGNORE INTO horario_base (doctor_id, dia_semana, hora_inicio, hora_fin) VALUES
(3, 2, '14:00:00', '19:00:00'),
(3, 4, '14:00:00', '19:00:00');


-- ============================================================
-- PASO 2: Eliminar slots antiguos para evitar duplicados
-- (solo en el rango de fechas que vamos a generar)
-- ============================================================
DELETE FROM slot
WHERE fecha BETWEEN '2026-07-19' AND '2026-07-31'
  AND estado = 'DISPONIBLE';


-- ============================================================
-- PASO 3: Generar slots de 30 min para TODOS los doctores
-- basándose en su horario_base
-- Usa CTE recursivo para fechas y tabla de números para franjas
-- ============================================================

-- WEEKDAY() devuelve 0=Lunes, 1=Martes, ..., 6=Domingo
-- horario_base usa  1=Lunes, 2=Martes, ..., 7=Domingo
-- Entonces: WEEKDAY(fecha) + 1 = dia_semana

INSERT INTO slot (doctor_id, fecha, hora_inicio, hora_fin, estado)
WITH RECURSIVE fechas AS (
    -- Genera cada día del rango solicitado
    SELECT DATE('2026-07-19') AS fecha
    UNION ALL
    SELECT DATE_ADD(fecha, INTERVAL 1 DAY)
    FROM fechas
    WHERE fecha < '2026-07-31'
),
franjas AS (
    -- Genera números 0..39 (cubre hasta 20 horas en bloques de 30 min)
    SELECT (a.n + b.n * 10) AS num
    FROM (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) a
    CROSS JOIN (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
    ) b
)
SELECT
    hb.doctor_id,
    f.fecha,
    ADDTIME(hb.hora_inicio, SEC_TO_TIME(fr.num * 1800))   AS hora_inicio,
    ADDTIME(hb.hora_inicio, SEC_TO_TIME((fr.num + 1) * 1800)) AS hora_fin,
    'DISPONIBLE'
FROM horario_base hb
CROSS JOIN fechas f
CROSS JOIN franjas fr
WHERE (WEEKDAY(f.fecha) + 1) = hb.dia_semana                          -- día coincide
  AND ADDTIME(hb.hora_inicio, SEC_TO_TIME((fr.num + 1) * 1800)) <= hb.hora_fin  -- franja dentro del horario
ORDER BY hb.doctor_id, f.fecha, hora_inicio;


-- ============================================================
-- PASO 4: Verificación
-- ============================================================
SELECT
    d.id AS doctor_id,
    CONCAT(d.nombre, ' ', d.apellido) AS doctor,
    COUNT(s.id) AS total_slots,
    MIN(s.fecha) AS primera_fecha,
    MAX(s.fecha) AS ultima_fecha
FROM doctor d
LEFT JOIN slot s ON s.doctor_id = d.id
    AND s.fecha BETWEEN '2026-07-19' AND '2026-07-31'
GROUP BY d.id, d.nombre, d.apellido
ORDER BY d.id;
