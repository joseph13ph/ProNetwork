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
