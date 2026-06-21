# SIE - Sistema de Inventario Empresarial

Proyecto con frontend en Vite + Vanilla JavaScript y backend en Node.js + Express conectado a PostgreSQL.

## Backend

```text
backend/
|-- server.js
|-- package.json
|-- package-lock.json
`-- config/
    `-- db.js
```

## Ejecucion Del Backend

```bash
cd backend
npm install
npm run dev
```

Luego abre:

```text
http://localhost:3000/
```

## Archivos Del Backend

- `backend/package.json`: define el proyecto backend, los scripts de ejecucion y las unicas dependencias necesarias: `express` y `pg`.
- `backend/config/db.js`: crea y exporta el pool de conexion a PostgreSQL usando la base de datos `sie_db`.
- `backend/server.js`: inicia Express, configura JSON y expone `GET /`, que ejecuta `SELECT * FROM usuarios` y devuelve los registros en JSON.

## Consulta Usada

```sql
SELECT * FROM usuarios;
```
