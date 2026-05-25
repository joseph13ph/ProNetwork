USE proconnect_db;

-- Passwords en texto para demo (las hashes se generan en backend/src/utils/seed.js):
-- 1) Ana: AnaPro#2026
-- 2) Carlos: CarlosDev#2026
-- 3) Laura: LauraHR#2026
-- 4) Diego: DiegoAdmin#2026

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, ubicacion, rol, estado)
VALUES
('Ana', 'Quintero', 'ana@proconnect.dev', '$2b$12$demo_hash_reemplazar', '584120000001', 'Caracas', 'usuario', 'activo'),
('Carlos', 'Mendez', 'carlos@proconnect.dev', '$2b$12$demo_hash_reemplazar', '584120000002', 'Bogota', 'usuario', 'activo'),
('Laura', 'Torres', 'laura@proconnect.dev', '$2b$12$demo_hash_reemplazar', '584120000003', 'Medellin', 'reclutador', 'activo'),
('Diego', 'Perez', 'diego@proconnect.dev', '$2b$12$demo_hash_reemplazar', '584120000004', 'Quito', 'administrador', 'activo');
