const movimientoService = require('../services/movimientoService');

const TIPOS_VALIDOS = ['ENTRADA', 'SALIDA', 'AJUSTE'];

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parsePayload(body) {
  return {
    idProducto: parseId(body.id_producto),
    idAlmacen: parseId(body.id_almacen),
    idUsuario: parseId(body.id_usuario),
    tipo: String(body.tipo || '').trim().toUpperCase(),
    cantidad: parsePositiveInteger(body.cantidad),
    referencia: String(body.referencia || '').trim() || null,
    motivo: String(body.motivo || '').trim() || null,
    ajusteOperacion: String(body.ajuste_operacion || 'SUMA').trim().toUpperCase()
  };
}

function validatePayload(payload) {
  if (!payload.idProducto) {
    return 'El producto es obligatorio.';
  }

  if (!payload.idAlmacen) {
    return 'El almacen es obligatorio.';
  }

  if (!payload.idUsuario) {
    return 'El usuario es obligatorio.';
  }

  if (!TIPOS_VALIDOS.includes(payload.tipo)) {
    return 'El tipo de movimiento no es valido.';
  }

  if (!payload.cantidad) {
    return 'La cantidad debe ser mayor a 0.';
  }

  if (payload.tipo === 'AJUSTE' && !['SUMA', 'RESTA'].includes(payload.ajusteOperacion)) {
    return 'La operacion de ajuste no es valida.';
  }

  return null;
}

async function getMovimientos(_req, res) {
  try {
    const movimientos = await movimientoService.findAll();

    return res.json({
      success: true,
      data: movimientos
    });
  } catch (error) {
    console.error('Error al listar movimientos:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar movimientos.'
    });
  }
}

async function getMovimientoById(req, res) {
  const idMovimiento = parseId(req.params.id);

  if (!idMovimiento) {
    return res.status(400).json({
      success: false,
      message: 'ID de movimiento invalido.'
    });
  }

  try {
    const movimiento = await movimientoService.findById(idMovimiento);

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: movimiento
    });
  } catch (error) {
    console.error('Error al obtener movimiento:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener movimiento.'
    });
  }
}

async function getMovimientosByProducto(req, res) {
  const idProducto = parseId(req.params.id);

  if (!idProducto) {
    return res.status(400).json({
      success: false,
      message: 'ID de producto invalido.'
    });
  }

  try {
    const movimientos = await movimientoService.findByProducto(idProducto);

    return res.json({
      success: true,
      data: movimientos
    });
  } catch (error) {
    console.error('Error al filtrar movimientos por producto:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar movimientos por producto.'
    });
  }
}

async function getMovimientosByAlmacen(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
    });
  }

  try {
    const movimientos = await movimientoService.findByAlmacen(idAlmacen);

    return res.json({
      success: true,
      data: movimientos
    });
  } catch (error) {
    console.error('Error al filtrar movimientos por almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar movimientos por almacen.'
    });
  }
}

async function createMovimiento(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    const movimiento = await movimientoService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Movimiento registrado correctamente.',
      data: movimiento
    });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al registrar movimiento.'
    });
  }
}

module.exports = {
  getMovimientos,
  getMovimientoById,
  getMovimientosByProducto,
  getMovimientosByAlmacen,
  createMovimiento
};
