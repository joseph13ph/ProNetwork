# Arquitectura de ProConnect

## Frontend

- src/components: componentes compartidos como la animacion de inicio.
- src/pages: pantallas principales (landing, login, registro, feed, empleos, mensajes, notificaciones, configuracion).
- src/layouts: estructura general de dashboard.
- src/routes: proteccion de rutas.
- src/context: estado global de autenticacion y personalizacion.
- src/services: cliente Axios para API.

## Backend

- src/controllers: logica por modulo.
- src/routes: rutas REST.
- src/middlewares: seguridad, validaciones, autenticacion y errores.
- src/services: reglas de negocio como login/registro.
- src/models: modelos Sequelize.
- src/config: variables de entorno y conexion a DB.
- src/utils: utilidades (password y seed).

## Base de Datos

- database/schema.sql: esquema completo, relaciones 1:1, 1:N y N:N.
- database/seed.sql: semilla SQL base.

## Seguridad

- JWT para sesion stateless.
- bcrypt con 12 rondas para hash.
- regex robusta para contrasenas fuertes.
- rate limit para prevenir abuso.
- Helmet y CSRF en API Express.
- sanitizacion XSS en payloads.
- control de permisos por rol.
