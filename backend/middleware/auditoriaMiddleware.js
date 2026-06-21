const { registrarAuditoria } = require('../services/auditoriaService');

const ACTION_BY_METHOD = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE'
};

function getRecordId(responseBody, req, moduleName) {
  const fromParams = Number(req.params?.id);

  if (Number.isInteger(fromParams) && fromParams > 0) {
    return fromParams;
  }

  const data = responseBody?.data || {};
  const moduleKeys = {
    Categorias: ['id_categoria'],
    Productos: ['id_producto'],
    Almacenes: ['id_almacen'],
    Ubicaciones: ['id_ubicacion'],
    Movimientos: ['id_movimiento'],
    Proveedores: ['id_proveedor'],
    Usuarios: ['id'],
    Stock: ['id_stock'],
    'Ordenes de Compra': ['id_orden']
  };
  const possibleKeys = [...(moduleKeys[moduleName] || []), 'id'];

  for (const key of possibleKeys) {
    const id = Number(data[key]);

    if (Number.isInteger(id) && id > 0) {
      return id;
    }
  }

  return null;
}

function buildDescription(user, action, moduleName, recordId, responseBody, req) {
  const nombre = user?.nombre || 'Usuario';
  const actionText = {
    CREATE: 'creo',
    UPDATE: 'edito',
    DELETE: 'elimino'
  }[action] || action.toLowerCase();
  const detail = responseBody?.message || `${actionText} registro`;
  const target = recordId ? ` registro ${recordId}` : '';

  if (moduleName === 'Movimientos' && req.body?.tipo) {
    return `${nombre} registro movimiento ${req.body.tipo}${target}.`;
  }

  return `${nombre} ${actionText} en ${moduleName}${target}. ${detail}`;
}

function auditModule(moduleName) {
  return (req, res, next) => {
    const action = ACTION_BY_METHOD[req.method];

    if (!action) {
      return next();
    }

    const originalJson = res.json.bind(res);
    let responseBody = null;

    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };

    res.on('finish', () => {
      if (res.statusCode >= 400 || responseBody?.success === false) {
        return;
      }

      const recordId = getRecordId(responseBody, req, moduleName);

      registrarAuditoria({
        id_usuario: req.user?.id,
        usuario_nombre: req.user?.nombre,
        modulo: moduleName,
        accion: action,
        registro_id: recordId,
        descripcion: buildDescription(req.user, action, moduleName, recordId, responseBody, req)
      }).catch((error) => {
        console.error('Error al registrar auditoria:', error);
      });
    });

    return next();
  };
}

module.exports = {
  auditModule
};
