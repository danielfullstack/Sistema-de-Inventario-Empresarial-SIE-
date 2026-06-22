const kardexService = require('../services/kardexService');
const { registrarAuditoria } = require('../services/auditoriaService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseFilters(req) {
  return {
    idProducto: parseId(req.params.id || req.query.idProducto || req.query.id_producto),
    idAlmacen: parseId(req.query.idAlmacen || req.query.id_almacen),
    fechaInicio: String(req.query.fechaInicio || '').trim() || null,
    fechaFin: String(req.query.fechaFin || '').trim() || null
  };
}

async function auditKardexQuery(req, filters) {
  await registrarAuditoria({
    id_usuario: req.user?.id,
    usuario_nombre: req.user?.nombre,
    modulo: 'Kardex',
    accion: 'CONSULTA',
    registro_id: filters.idProducto,
    descripcion: `${req.user?.nombre || 'Usuario'} consulto Kardex${filters.idProducto ? ` del producto ${filters.idProducto}` : ''}.`
  });
}

async function getKardex(req, res) {
  const filters = parseFilters(req);

  try {
    if (!filters.idProducto) {
      return res.json({
        success: true,
        message: 'Seleccione un producto para visualizar el Kardex.',
        data: [],
        summary: {
          stockActual: 0,
          entradasTotales: 0,
          salidasTotales: 0,
          movimientosTotales: 0
        }
      });
    }

    const kardex = await kardexService.findKardex(filters);
    await auditKardexQuery(req, filters);

    return res.json({
      success: true,
      data: kardex.rows,
      summary: kardex.summary
    });
  } catch (error) {
    console.error('Error al consultar Kardex:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al consultar Kardex.'
    });
  }
}

module.exports = {
  getKardex
};
