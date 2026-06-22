const almacenService = require('../services/almacenService');
const ubicacionService = require('../services/ubicacionService');

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
    idAlmacen: parseId(body.id_almacen),
    codigo: String(body.codigo || '').trim(),
    pasillo: String(body.pasillo || '').trim() || null,
    estante: String(body.estante || '').trim() || null,
    nivel: String(body.nivel || '').trim() || null,
    capacidad: parseInteger(body.capacidad)
  };
}

function validatePayload(payload) {
  if (!payload.idAlmacen) {
    return 'El almacen es obligatorio.';
  }

  if (!payload.codigo) {
    return 'El codigo de la ubicacion es obligatorio.';
  }

  if (payload.capacidad === null || payload.capacidad < 0) {
    return 'La capacidad debe ser mayor o igual a 0.';
  }

  return null;
}

function parseEstadoQuery(value) {
  const estado = String(value || 'activo').trim().toLowerCase();
  return ['activo', 'inactivo', 'todos'].includes(estado) ? estado : 'activo';
}

async function validateAlmacenExists(idAlmacen) {
  const almacen = await almacenService.findById(idAlmacen);
  return Boolean(almacen);
}

async function getUbicaciones(req, res) {
  try {
    const ubicaciones = await ubicacionService.findAll(parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: ubicaciones
    });
  } catch (error) {
    console.error('Error al listar ubicaciones:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar ubicaciones.'
    });
  }
}

async function getUbicacionById(req, res) {
  const idUbicacion = parseId(req.params.id);

  if (!idUbicacion) {
    return res.status(400).json({
      success: false,
      message: 'ID de ubicacion invalido.'
    });
  }

  try {
    const ubicacion = await ubicacionService.findById(idUbicacion);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    return res.json({
      success: true,
      data: ubicacion
    });
  } catch (error) {
    console.error('Error al obtener ubicacion:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener ubicacion.'
    });
  }
}

async function getUbicacionesByAlmacen(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
    });
  }

  try {
    const ubicaciones = await ubicacionService.findByAlmacen(idAlmacen, parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: ubicaciones
    });
  } catch (error) {
    console.error('Error al filtrar ubicaciones por almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar ubicaciones por almacen.'
    });
  }
}

async function createUbicacion(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateAlmacenExists(payload.idAlmacen))) {
      return res.status(400).json({
        success: false,
        message: 'El almacen seleccionado no existe.'
      });
    }

    const ubicacion = await ubicacionService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Ubicacion creada correctamente.',
      data: ubicacion
    });
  } catch (error) {
    console.error('Error al crear ubicacion:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al crear ubicacion.'
    });
  }
}

async function updateUbicacion(req, res) {
  const idUbicacion = parseId(req.params.id);

  if (!idUbicacion) {
    return res.status(400).json({
      success: false,
      message: 'ID de ubicacion invalido.'
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
    if (!(await validateAlmacenExists(payload.idAlmacen))) {
      return res.status(400).json({
        success: false,
        message: 'El almacen seleccionado no existe.'
      });
    }

    const ubicacion = await ubicacionService.update(idUbicacion, payload);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    return res.json({
      success: true,
      message: 'Ubicacion actualizada correctamente.',
      data: ubicacion
    });
  } catch (error) {
    console.error('Error al actualizar ubicacion:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar ubicacion.'
    });
  }
}

async function deleteUbicacion(req, res) {
  const idUbicacion = parseId(req.params.id);

  if (!idUbicacion) {
    return res.status(400).json({
      success: false,
      message: 'ID de ubicacion invalido.'
    });
  }

  try {
    const ubicacion = await ubicacionService.findById(idUbicacion);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    const ubicacionDesactivada = await ubicacionService.remove(idUbicacion);

    return res.json({
      success: true,
      message: 'Ubicacion desactivada correctamente.',
      data: ubicacionDesactivada
    });
  } catch (error) {
    console.error('Error al eliminar ubicacion:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar una ubicacion relacionada con otros registros.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar ubicacion.'
    });
  }
}

async function reactivateUbicacion(req, res) {
  const idUbicacion = parseId(req.params.id);

  if (!idUbicacion) {
    return res.status(400).json({
      success: false,
      message: 'ID de ubicacion invalido.'
    });
  }

  try {
    const ubicacion = await ubicacionService.reactivate(idUbicacion);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    return res.json({
      success: true,
      message: 'Ubicacion reactivada correctamente.',
      data: ubicacion
    });
  } catch (error) {
    console.error('Error al reactivar ubicacion:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al reactivar ubicacion.'
    });
  }
}

module.exports = {
  getUbicaciones,
  getUbicacionById,
  getUbicacionesByAlmacen,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
  reactivateUbicacion
};
