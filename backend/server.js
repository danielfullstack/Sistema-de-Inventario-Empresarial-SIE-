require('dotenv').config();

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];

if (!process.env.DATABASE_URL) {
  requiredEnvVars.push('DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME');
}

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Faltan variables de entorno requeridas: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

const auditoriaRoutes = require('./routes/auditoriaRoutes');
const authRoutes = require('./routes/auth');
const almacenRoutes = require('./routes/almacenRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const exportRoutes = require('./routes/exportRoutes');
const kardexRoutes = require('./routes/kardexRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const ordenCompraRoutes = require('./routes/ordenCompraRoutes');
const productoRoutes = require('./routes/productoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const stockRoutes = require('./routes/stockRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const { auditModule } = require('./middleware/auditoriaMiddleware');
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');
const { ensureTable } = require('./services/auditoriaService');

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = process.env.CORS_ORIGIN
  ? {
    origin: process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true
  }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'API SIE funcionando correctamente.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/almacenes', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), auditModule('Almacenes'), almacenRoutes);
app.use('/api/auditoria', authenticateToken, authorizeRoles('Administrador'), auditoriaRoutes);
app.use('/api/categorias', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), auditModule('Categorias'), categoriaRoutes);
app.use('/api/dashboard', authenticateToken, authorizeRoles('Administrador', 'Supervisor', 'Operador'), dashboardRoutes);
app.use('/api/export', authenticateToken, authorizeRoles('Administrador', 'Supervisor', 'Operador'), exportRoutes);
app.use('/api/kardex', authenticateToken, authorizeRoles('Administrador', 'Supervisor', 'Operador'), kardexRoutes);
app.use('/api/movimientos', authenticateToken, authorizeRoles('Administrador', 'Supervisor', 'Operador'), auditModule('Movimientos'), movimientoRoutes);
app.use('/api/ordenes-compra', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), auditModule('Ordenes de Compra'), ordenCompraRoutes);
app.use('/api/productos', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), auditModule('Productos'), productoRoutes);
app.use('/api/proveedores', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), auditModule('Proveedores'), proveedorRoutes);
app.use('/api/reportes', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), reporteRoutes);
app.use('/api/stock', authenticateToken, authorizeRoles('Administrador', 'Supervisor', 'Operador'), auditModule('Stock'), stockRoutes);
app.use('/api/ubicaciones', authenticateToken, authorizeRoles('Administrador', 'Supervisor'), auditModule('Ubicaciones'), ubicacionRoutes);
app.use('/api/usuarios', authenticateToken, authorizeRoles('Administrador'), auditModule('Usuarios'), usuarioRoutes);

ensureTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor SIE corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la tabla auditoria:', error);
    process.exit(1);
  });
