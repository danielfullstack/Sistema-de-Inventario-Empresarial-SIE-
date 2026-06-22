# SIE - Sistema de Inventario Empresarial

SIE es un ERP de inventario desarrollado con frontend Vite + Vanilla JavaScript, backend Node.js + Express y PostgreSQL.

## Arquitectura

- `frontend/`: SPA Vite, vistas ERP, autenticacion JWT en cliente y consumo de API.
- `backend/`: API REST Express, controladores, servicios, middleware JWT/roles/auditoria y exportaciones PDF/Excel.
- `database/migrations/`: migraciones SQL de integridad y borrado logico.

## Modulos Principales

- Login y roles: Administrador, Supervisor, Operador.
- Dashboard, Categorias, Productos, Almacenes, Ubicaciones.
- Stock, Movimientos, Kardex, Proveedores, Ordenes de Compra.
- Usuarios, Reportes, Auditoria y Exportacion PDF/Excel.

## Instalacion Local

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Variables De Entorno Backend

```env
PORT=3000
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sie_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=false
JWT_SECRET=cambiar_esto
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

En produccion se recomienda usar `DATABASE_URL` de Railway o Neon. Si `DATABASE_URL` existe, el backend no requiere `DB_HOST`, `DB_USER`, `DB_PASSWORD` ni `DB_NAME`.

## Variables De Entorno Frontend

```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_API_PROXY_TARGET=http://localhost:3000
```

En desarrollo puede dejarse `VITE_API_URL` vacio para usar el proxy `/api` de Vite.

## Despliegue Backend En Render

1. Crear un Web Service desde el repositorio.
2. Root directory: `backend`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Configurar variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=8h`
   - `CORS_ORIGIN=https://tu-frontend.netlify.app`

Tambien se incluye `render.yaml` como base de infraestructura.

## Despliegue Frontend En Netlify/Vercel

Netlify:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Variables:

```env
VITE_API_URL=https://tu-backend.onrender.com
```

La SPA incluye `frontend/public/_redirects` para que rutas como `/dashboard`, `/productos` o `/kardex` funcionen al recargar.

## Base De Datos Produccion

Opciones recomendadas:

- Railway PostgreSQL
- Neon PostgreSQL

Pasos:

1. Crear base PostgreSQL.
2. Copiar `DATABASE_URL`.
3. Configurar `DATABASE_URL` en el backend.
4. Ejecutar migraciones SQL desde `database/migrations/` en orden.
5. Crear usuario administrador inicial.

## Usuario Inicial

Crear un usuario administrador en la tabla `usuarios` con password hasheado con bcrypt. No usar passwords en texto plano en produccion.

## Verificacion

Antes de publicar:

```bash
cd frontend
npm run build
```

```bash
cd backend
npm start
```

Validar:

- Login
- Dashboard
- Productos
- Stock
- Movimientos
- Usuarios
- Auditoria
- Reportes
- Kardex
- Ordenes de Compra

## Seguridad

- No subir `.env`.
- Usar `JWT_SECRET` fuerte.
- Configurar `CORS_ORIGIN` con la URL real del frontend.
- Usar PostgreSQL administrado con SSL.
- Rotar credenciales si fueron expuestas durante desarrollo.
