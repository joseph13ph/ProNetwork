CREATE DATABASE IF NOT EXISTS proconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proconnect_db;

CREATE TABLE usuarios (
  id_usuario BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) UNIQUE,
  ubicacion VARCHAR(100),
  foto_perfil VARCHAR(255),
  rol ENUM('usuario', 'reclutador', 'administrador') DEFAULT 'usuario',
  estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_rol (rol),
  INDEX idx_usuarios_ubicacion (ubicacion)
);

CREATE TABLE perfiles (
  id_perfil BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL UNIQUE,
  titular VARCHAR(120),
  biografia TEXT,
  banner_url VARCHAR(255),
  cv_url VARCHAR(255),
  enlaces_externos JSON,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_perfiles_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE experiencias (
  id_experiencia BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_perfil BIGINT NOT NULL,
  cargo VARCHAR(120) NOT NULL,
  empresa VARCHAR(120) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  actual BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_experiencias_perfil FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE
);

CREATE TABLE educacion (
  id_educacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_perfil BIGINT NOT NULL,
  institucion VARCHAR(120) NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  descripcion TEXT,
  CONSTRAINT fk_educacion_perfil FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE
);

CREATE TABLE habilidades (
  id_habilidad BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE perfil_habilidades (
  id_perfil BIGINT NOT NULL,
  id_habilidad BIGINT NOT NULL,
  PRIMARY KEY (id_perfil, id_habilidad),
  CONSTRAINT fk_ph_perfil FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
  CONSTRAINT fk_ph_habilidad FOREIGN KEY (id_habilidad) REFERENCES habilidades(id_habilidad) ON DELETE CASCADE
);

CREATE TABLE publicaciones (
  id_publicacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL,
  contenido TEXT NOT NULL,
  multimedia_url VARCHAR(255),
  tipo ENUM('texto', 'imagen', 'video', 'articulo') DEFAULT 'texto',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_publicaciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_publicaciones_fecha (fecha)
);

CREATE TABLE comentarios (
  id_comentario BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_publicacion BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  contenido TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comentarios_pub FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
  CONSTRAINT fk_comentarios_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE likes (
  id_like BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_publicacion BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_like_unico (id_publicacion, id_usuario),
  CONSTRAINT fk_likes_pub FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
  CONSTRAINT fk_likes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE conexiones (
  id_conexion BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_solicitante BIGINT NOT NULL,
  id_receptor BIGINT NOT NULL,
  estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conexion_unica (id_solicitante, id_receptor),
  CONSTRAINT fk_conex_sol FOREIGN KEY (id_solicitante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_conex_rec FOREIGN KEY (id_receptor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT chk_conexion_distinta CHECK (id_solicitante <> id_receptor)
);

CREATE TABLE conversaciones (
  id_conversacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('privada', 'grupo') DEFAULT 'privada',
  nombre VARCHAR(120),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversacion_participantes (
  id_conversacion BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  PRIMARY KEY (id_conversacion, id_usuario),
  CONSTRAINT fk_cp_conv FOREIGN KEY (id_conversacion) REFERENCES conversaciones(id_conversacion) ON DELETE CASCADE,
  CONSTRAINT fk_cp_user FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE mensajes (
  id_mensaje BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_conversacion BIGINT NOT NULL,
  id_emisor BIGINT NOT NULL,
  contenido TEXT NOT NULL,
  archivo_url VARCHAR(255),
  leido BOOLEAN DEFAULT FALSE,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mensajes_conv FOREIGN KEY (id_conversacion) REFERENCES conversaciones(id_conversacion) ON DELETE CASCADE,
  CONSTRAINT fk_mensajes_emisor FOREIGN KEY (id_emisor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_mensajes_fecha (fecha)
);

CREATE TABLE notificaciones (
  id_notificacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL,
  tipo ENUM('like', 'comentario', 'solicitud', 'mensaje', 'conexion', 'sistema') NOT NULL,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_notif_usuario_leido (id_usuario, leido)
);

CREATE TABLE empresas (
  id_empresa BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion TEXT,
  sitio_web VARCHAR(255),
  ubicacion VARCHAR(100)
);

CREATE TABLE empleos (
  id_empleo BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_reclutador BIGINT NOT NULL,
  id_empresa BIGINT,
  titulo VARCHAR(140) NOT NULL,
  salario VARCHAR(60),
  modalidad ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'hibrido',
  ubicacion VARCHAR(120),
  descripcion TEXT NOT NULL,
  habilidades TEXT,
  experiencia_requerida VARCHAR(120),
  estado ENUM('abierto', 'cerrado') DEFAULT 'abierto',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_empleo_reclutador FOREIGN KEY (id_reclutador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_empleo_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE SET NULL,
  INDEX idx_empleo_busqueda (titulo, ubicacion, modalidad)
);

CREATE TABLE aplicaciones (
  id_aplicacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_empleo BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  cv_url VARCHAR(255),
  estado ENUM('enviada', 'en_revision', 'rechazada', 'aceptada') DEFAULT 'enviada',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_aplicacion_unica (id_empleo, id_usuario),
  CONSTRAINT fk_aplicacion_empleo FOREIGN KEY (id_empleo) REFERENCES empleos(id_empleo) ON DELETE CASCADE,
  CONSTRAINT fk_aplicacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE administradores (
  id_admin BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL UNIQUE,
  nivel ENUM('moderador', 'superadmin') DEFAULT 'moderador',
  fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
