const almacenService = require('../services/almacenService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseInteger(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function parsePayload(body) {
  return {
    nombre: String(body.nombre || '').trim(),
    direccion: String(body.direccion || '').trim() || null,
    capacidadTotal: parseInteger(body.capacidad_total),
    tipo: String(body.tipo || '').trim() || null
  };
}

function validatePayload(payload) {
  if (!payload.nombre) {
    return 'El nombre del almacen es obligatorio.';
  }

  if (payload.capacidadTotal === null || payload.capacidadTotal < 0) {
    return 'La capacidad total debe ser mayor o igual a 0.';
  }

  return null;
}

function parseEstadoQuery(value) {
  const estado = String(value || 'activo').trim().toLowerCase();
  return ['activo', 'inactivo', 'todos'].includes(estado) ? estado : 'activo';
}

async function getAlmacenes(req, res) {
  try {
    const almacenes = await almacenService.findAll(parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: almacenes
    });
  } catch (error) {
    console.error('Error al listar almacenes:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar almacenes.'
    });
  }
}

async function getAlmacenById(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
    });
  }

  try {
    const almacen = await almacenService.findById(idAlmacen);

    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacen no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: almacen
    });
  } catch (error) {
    console.error('Error al obtener almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener almacen.'
    });
  }
}

async function createAlmacen(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    const almacen = await almacenService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Almacen creado correctamente.',
      data: almacen
    });
  } catch (error) {
    console.error('Error al crear almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al crear almacen.'
    });
  }
}

async function updateAlmacen(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
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
    const almacen = await almacenService.update(idAlmacen, payload);

    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacen no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Almacen actualizado correctamente.',
      data: almacen
    });
  } catch (error) {
    console.error('Error al actualizar almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar almacen.'
    });
  }
}

async function deleteAlmacen(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
    });
  }

  try {
    const almacen = await almacenService.findById(idAlmacen);

    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacen no encontrado.'
      });
    }

    const almacenDesactivado = await almacenService.remove(idAlmacen);

    return res.json({
      success: true,
      message: 'Almacen desactivado correctamente.',
      data: almacenDesactivado
    });
  } catch (error) {
    console.error('Error al eliminar almacen:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar un almacen relacionado con otros registros.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar almacen.'
    });
  }
}

async function reactivateAlmacen(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
    });
  }

  try {
    const almacen = await almacenService.reactivate(idAlmacen);

    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacen no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Almacen reactivado correctamente.',
      data: almacen
    });
  } catch (error) {
    console.error('Error al reactivar almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al reactivar almacen.'
    });
  }
}

module.exports = {
  getAlmacenes,
  getAlmacenById,
  createAlmacen,
  updateAlmacen,
  deleteAlmacen,
  reactivateAlmacen
};
