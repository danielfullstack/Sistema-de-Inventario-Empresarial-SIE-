const express = require('express');
const cors = require('cors');

const auditoriaRoutes = require('./routes/auditoriaRoutes');
const authRoutes = require('./routes/auth');
const almacenRoutes = require('./routes/almacenRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const ordenCompraRoutes = require('./routes/ordenCompraRoutes');
const productoRoutes = require('./routes/productoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const stockRoutes = require('./routes/stockRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const { auditModule } = require('./middleware/auditoriaMiddleware');
const { authenticateToken, requireRoles } = require('./middleware/authMiddleware');
const { ensureTable } = require('./services/auditoriaService');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'API SIE funcionando correctamente.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/almacenes', authenticateToken, auditModule('Almacenes'), almacenRoutes);
app.use('/api/auditoria', authenticateToken, requireRoles('Administrador', 'Supervisor'), auditoriaRoutes);
app.use('/api/categorias', authenticateToken, auditModule('Categorias'), categoriaRoutes);
app.use('/api/dashboard', authenticateToken, requireRoles('Administrador', 'Supervisor', 'Operador'), dashboardRoutes);
app.use('/api/movimientos', authenticateToken, auditModule('Movimientos'), movimientoRoutes);
app.use('/api/ordenes-compra', authenticateToken, auditModule('Ordenes de Compra'), ordenCompraRoutes);
app.use('/api/productos', authenticateToken, auditModule('Productos'), productoRoutes);
app.use('/api/proveedores', authenticateToken, auditModule('Proveedores'), proveedorRoutes);
app.use('/api/reportes', authenticateToken, requireRoles('Administrador', 'Supervisor'), reporteRoutes);
app.use('/api/stock', authenticateToken, auditModule('Stock'), stockRoutes);
app.use('/api/ubicaciones', authenticateToken, auditModule('Ubicaciones'), ubicacionRoutes);
app.use('/api/usuarios', authenticateToken, requireRoles('Administrador'), auditModule('Usuarios'), usuarioRoutes);

ensureTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor SIE corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la tabla auditoria:', error);
    process.exit(1);
  });
