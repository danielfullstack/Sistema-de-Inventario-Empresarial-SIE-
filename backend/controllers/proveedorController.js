const proveedorService = require('../services/proveedorService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePayload(body) {
  const estado = String(body.estado || 'activo').trim().toLowerCase();

  return {
    razonSocial: String(body.razon_social || '').trim(),
    ruc: String(body.ruc || '').trim(),
    telefono: String(body.telefono || '').trim() || null,
    email: String(body.email || '').trim() || null,
    direccion: String(body.direccion || '').trim() || null,
    estado: estado || 'activo'
  };
}

function validatePayload(payload) {
  if (!payload.razonSocial) {
    return 'La razon social es obligatoria.';
  }

  if (!/^\d{11}$/.test(payload.ruc)) {
    return 'El RUC debe tener exactamente 11 digitos.';
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'El email ingresado no es valido.';
  }

  if (!['activo', 'inactivo'].includes(payload.estado)) {
    return 'El estado seleccionado no es valido.';
  }

  return null;
}

async function validateUniqueRuc(ruc, idProveedorActual = null) {
  const proveedor = await proveedorService.findByRuc(ruc);

  if (!proveedor) {
    return true;
  }

  return proveedor.id_proveedor === idProveedorActual;
}

function parseEstadoQuery(value) {
  const estado = String(value || 'activo').trim().toLowerCase();
  return ['activo', 'inactivo', 'todos'].includes(estado) ? estado : 'activo';
}

async function getProveedores(req, res) {
  try {
    const proveedores = await proveedorService.findAll(parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    console.error('Error al listar proveedores:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar proveedores.'
    });
  }
}

async function getProveedorById(req, res) {
  const idProveedor = parseId(req.params.id);

  if (!idProveedor) {
    return res.status(400).json({
      success: false,
      message: 'ID de proveedor invalido.'
    });
  }

  try {
    const proveedor = await proveedorService.findById(idProveedor);

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: proveedor
    });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener proveedor.'
    });
  }
}

async function createProveedor(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateUniqueRuc(payload.ruc))) {
      return res.status(400).json({
        success: false,
        message: 'El RUC ya esta registrado.'
      });
    }

    const proveedor = await proveedorService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Proveedor creado correctamente.',
      data: proveedor
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al crear proveedor.'
    });
  }
}

async function updateProveedor(req, res) {
  const idProveedor = parseId(req.params.id);

  if (!idProveedor) {
    return res.status(400).json({
      success: false,
      message: 'ID de proveedor invalido.'
    });
  }

  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateUniqueRuc(payload.ruc, idProveedor))) {
      return res.status(400).json({
        success: false,
        message: 'El RUC ya esta registrado.'
      });
    }

    const proveedor = await proveedorService.update(idProveedor, payload);

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Proveedor actualizado correctamente.',
      data: proveedor
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar proveedor.'
    });
  }
}

async function deleteProveedor(req, res) {
  const idProveedor = parseId(req.params.id);

  if (!idProveedor) {
    return res.status(400).json({
      success: false,
      message: 'ID de proveedor invalido.'
    });
  }

  try {
    const proveedor = await proveedorService.findById(idProveedor);

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado.'
      });
    }

    const proveedorDesactivado = await proveedorService.remove(idProveedor);

    return res.json({
      success: true,
      message: 'Proveedor desactivado correctamente.',
      data: proveedorDesactivado
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar un proveedor relacionado con otros registros.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar proveedor.'
    });
  }
}

async function reactivateProveedor(req, res) {
  const idProveedor = parseId(req.params.id);

  if (!idProveedor) {
    return res.status(400).json({
      success: false,
      message: 'ID de proveedor invalido.'
    });
  }

  try {
    const proveedor = await proveedorService.reactivate(idProveedor);

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Proveedor reactivado correctamente.',
      data: proveedor
    });
  } catch (error) {
    console.error('Error al reactivar proveedor:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al reactivar proveedor.'
    });
  }
}

module.exports = {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  reactivateProveedor
};
