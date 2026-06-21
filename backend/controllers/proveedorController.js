const proveedorService = require('../services/proveedorService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePayload(body) {
  const estado = String(body.estado || 'Activo').trim();

  return {
    razonSocial: String(body.razon_social || '').trim(),
    ruc: String(body.ruc || '').trim(),
    telefono: String(body.telefono || '').trim() || null,
    email: String(body.email || '').trim() || null,
    direccion: String(body.direccion || '').trim() || null,
    estado: estado || 'Activo'
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

  if (!['Activo', 'Inactivo', 'activo', 'inactivo'].includes(payload.estado)) {
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

async function getProveedores(_req, res) {
  try {
    const proveedores = await proveedorService.findAll();

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

    await proveedorService.remove(idProveedor);

    return res.json({
      success: true,
      message: 'Proveedor eliminado correctamente.'
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

module.exports = {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
};
