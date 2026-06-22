const exportService = require('../services/exportService');
const { registrarAuditoria } = require('../services/auditoriaService');

const FORMAT_CONFIG = {
  pdf: {
    contentType: 'application/pdf',
    extension: 'pdf',
    action: 'EXPORT_PDF'
  },
  excel: {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    action: 'EXPORT_EXCEL'
  }
};

const MODULE_PERMISSIONS = {
  productos: ['Administrador', 'Supervisor'],
  stock: ['Administrador', 'Supervisor', 'Operador'],
  movimientos: ['Administrador', 'Supervisor', 'Operador'],
  kardex: ['Administrador', 'Supervisor', 'Operador'],
  proveedores: ['Administrador', 'Supervisor'],
  ordenes: ['Administrador', 'Supervisor'],
  auditoria: ['Administrador'],
  reportes: ['Administrador', 'Supervisor']
};

function normalizeRole(role = '') {
  return String(role).trim().toLowerCase();
}

function ensurePermission(req, moduleName) {
  const allowedRoles = MODULE_PERMISSIONS[moduleName] || [];
  const userRole = normalizeRole(req.user?.rol);
  const isAllowed = allowedRoles.some((role) => normalizeRole(role) === userRole);

  if (!isAllowed) {
    const error = new Error('No tienes permisos para exportar este modulo.');
    error.status = 403;
    throw error;
  }
}

function safeFilename(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(' ', '_')
    .replace(/[^a-z0-9_-]/g, '');
}

async function exportModule(req, res) {
  const moduleName = String(req.params.module || '').trim().toLowerCase();
  const format = String(req.params.format || '').trim().toLowerCase();
  const formatConfig = FORMAT_CONFIG[format];

  if (!formatConfig) {
    return res.status(404).json({
      success: false,
      message: 'Formato de exportacion no valido.'
    });
  }

  try {
    ensurePermission(req, moduleName);

    const { config, rows } = await exportService.getRows(moduleName, req.query);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No existen registros para exportar.'
      });
    }

    const buffer = format === 'pdf'
      ? await exportService.buildPdf({
        title: config.title,
        columns: config.columns,
        rows,
        usuario: req.user
      })
      : exportService.buildExcel({
        title: config.title,
        columns: config.columns,
        rows
      });

    await registrarAuditoria({
      id_usuario: req.user?.id,
      usuario_nombre: req.user?.nombre,
      modulo: 'Exportaciones',
      accion: formatConfig.action,
      descripcion: `${req.user?.nombre || 'Usuario'} exporto ${config.title} ${format.toUpperCase()}.`
    });

    const filename = `${safeFilename(config.title)}_${new Date().toISOString().slice(0, 10)}.${formatConfig.extension}`;

    res.setHeader('Content-Type', formatConfig.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error('Error al exportar:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al exportar informacion.'
    });
  }
}

module.exports = {
  exportModule
};
