const ordenCompraService = require('../services/ordenCompraService');

const ESTADOS_VALIDOS = ['Pendiente', 'Aprobada', 'Recibida', 'Cancelada'];

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeEstado(estado = '') {
  const normalized = String(estado).trim().toLowerCase();
  const found = ESTADOS_VALIDOS.find((item) => item.toLowerCase() === normalized);

  return found || '';
}

function parsePayload(body) {
  return {
    idProveedor: Number(body.id_proveedor),
    fechaEmision: String(body.fecha_emision || new Date().toISOString().slice(0, 10)).trim(),
    fechaEntregaEsperada: String(body.fecha_entrega_esperada || '').trim() || null,
    estado: normalizeEstado(body.estado || 'Pendiente'),
    observaciones: String(body.observaciones || '').trim() || null,
    createdBy: body.created_by ? Number(body.created_by) : null,
    detalles: Array.isArray(body.detalles) ? body.detalles.map((detalle) => ({
      idProducto: Number(detalle.id_producto),
      cantidadSolicitada: Number(detalle.cantidad_solicitada),
      precioUnitario: detalle.precio_unitario === undefined || detalle.precio_unitario === ''
        ? null
        : Number(detalle.precio_unitario)
    })) : []
  };
}

function validatePayload(payload) {
  if (!Number.isInteger(payload.idProveedor) || payload.idProveedor <= 0) {
    return 'Selecciona un proveedor valido.';
  }

  if (!payload.fechaEmision) {
    return 'La fecha de emision es obligatoria.';
  }

  if (!payload.estado || !ESTADOS_VALIDOS.includes(payload.estado)) {
    return 'El estado seleccionado no es valido.';
  }

  if (!Array.isArray(payload.detalles) || payload.detalles.length === 0) {
    return 'Agrega al menos un producto a la orden.';
  }

  for (const detalle of payload.detalles) {
    if (!Number.isInteger(detalle.idProducto) || detalle.idProducto <= 0) {
      return 'Selecciona un producto valido en todos los detalles.';
    }

    if (!Number.isInteger(detalle.cantidadSolicitada) || detalle.cantidadSolicitada <= 0) {
      return 'La cantidad solicitada debe ser mayor a 0.';
    }

    if (detalle.precioUnitario !== null && (!Number.isFinite(detalle.precioUnitario) || detalle.precioUnitario < 0)) {
      return 'El precio unitario debe ser mayor o igual a 0.';
    }
  }

  return null;
}

async function getOrdenes(_req, res) {
  try {
    const ordenes = await ordenCompraService.findAll();

    return res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error al listar ordenes de compra:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar ordenes de compra.'
    });
  }
}

async function getOrdenById(req, res) {
  const idOrden = parseId(req.params.id);

  if (!idOrden) {
    return res.status(400).json({
      success: false,
      message: 'ID de orden invalido.'
    });
  }

  try {
    const orden = await ordenCompraService.findById(idOrden);

    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden de compra no encontrada.'
      });
    }

    return res.json({
      success: true,
      data: orden
    });
  } catch (error) {
    console.error('Error al obtener orden de compra:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener orden de compra.'
    });
  }
}

async function getOrdenesByProveedor(req, res) {
  const idProveedor = parseId(req.params.id);

  if (!idProveedor) {
    return res.status(400).json({
      success: false,
      message: 'ID de proveedor invalido.'
    });
  }

  try {
    const ordenes = await ordenCompraService.findByProveedor(idProveedor);

    return res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error al filtrar ordenes por proveedor:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar ordenes por proveedor.'
    });
  }
}

async function getOrdenesByEstado(req, res) {
  const estado = normalizeEstado(req.params.estado);

  if (!estado) {
    return res.status(400).json({
      success: false,
      message: 'Estado de orden invalido.'
    });
  }

  try {
    const ordenes = await ordenCompraService.findByEstado(estado);

    return res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error al filtrar ordenes por estado:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar ordenes por estado.'
    });
  }
}

async function createOrden(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    const orden = await ordenCompraService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Orden de compra creada correctamente.',
      data: orden
    });
  } catch (error) {
    console.error('Error al crear orden de compra:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Error al crear orden de compra.'
    });
  }
}

async function updateEstado(req, res) {
  const idOrden = parseId(req.params.id);
  const estado = normalizeEstado(req.body.estado);

  if (!idOrden) {
    return res.status(400).json({
      success: false,
      message: 'ID de orden invalido.'
    });
  }

  if (!estado) {
    return res.status(400).json({
      success: false,
      message: 'Estado de orden invalido.'
    });
  }

  try {
    const orden = await ordenCompraService.updateEstado(idOrden, estado);

    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden de compra no encontrada.'
      });
    }

    return res.json({
      success: true,
      message: 'Estado de orden actualizado correctamente.',
      data: orden
    });
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de orden.'
    });
  }
}

module.exports = {
  getOrdenes,
  getOrdenById,
  getOrdenesByProveedor,
  getOrdenesByEstado,
  createOrden,
  updateEstado
};
