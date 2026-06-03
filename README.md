# ProNetwork

ProNetwork es una red social profesional moderna inspirada en LinkedIn para networking, empleos, publicaciones, conexiones y mensajeria.

## Estructura

- frontend: React + Vite + TailwindCSS + React Router + Axios + Context API + Framer Motion
- backend: Node.js + Express + JWT + bcrypt + Socket.io + Multer + Sequelize + MySQL
- database: scripts SQL
- uploads: archivos subidos
- docs: documentacion

## Requisitos

- Node.js 20+
- MySQL 8+

## Instalacion

1. Configura variables de entorno:
- Copia `backend/.env.example` a `backend/.env`
- Copia `frontend/.env.example` a `frontend/.env`

2. Instala dependencias:
```bash
cd backend
npm install
cd ../frontend
npm install
```

3. Configura credenciales MySQL en `backend/.env` (obligatorio):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=proconnect_db
```

4. Ejecuta semillas (esto crea la base y tablas automaticamente si no existen):
```bash
cd backend
npm run seed
```

5. Ejecuta backend y frontend (el backend tambien crea la base automaticamente):
```bash
cd backend
npm run dev
```
 - **Iniciar ambos (un solo comando desde la raíz del proyecto):**
```bash
# instalar dependencias raíz la primera vez
npm install
# luego ejecutar
npm run dev
```
```bash
cd frontend
npm run dev
```

## Modulos API

- /api/auth
- /api/users
- /api/profiles
- /api/posts
- /api/comments
- /api/connections
- /api/messages
- /api/jobs
- /api/applications
- /api/notifications
- /api/admin

## Seguridad implementada

- JWT para autenticacion
- bcrypt para hash de contrasenas
- validaciones con express-validator
- sanitizacion XSS
- helmet
- csurf
- rate limiting
- control de acceso por roles

## Usuarios demo

Ver `docs/usuarios-iniciales.md`.

## Mensaje sobre localhost

Si ves una URL como `http://localhost:5173` (frontend) o `http://localhost:5001` (backend), es normal.

- `localhost` significa "este mismo computador".
- Solo funciona en tu maquina mientras el proyecto este ejecutandose.
- Para compartir con otras personas, usa GitHub (codigo) o GitHub Pages (sitio publicado).

## Guia rapida: descargar y ejecutar en localhost

1. Clona el repositorio:
```bash
git clone https://github.com/joseph13ph/ProNetwork.git
cd ProNetwork
```

2. Instala dependencias de todo el proyecto:
```bash
npm install
```

3. Configura variables de entorno:
- Copia `backend/.env.example` a `backend/.env`.
- Copia `frontend/.env.example` a `frontend/.env`.

4. Configura tu base de datos MySQL en `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=proconnect_db
```

5. Crea tablas y datos iniciales:
```bash
npm run seed --workspace backend
```

6. Levanta backend y frontend juntos:
```bash
npm run dev
```

7. Abre la aplicacion en tu navegador:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
