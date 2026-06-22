const pool = require('../config/db');

function parseDateFilter(value) {
  return value ? String(value).trim() : null;
}

function toDateKey(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function getMovimientoDelta(movimiento) {
  const cantidad = Number(movimiento.cantidad || 0);

  if (movimiento.tipo === 'ENTRADA') {
    return cantidad;
  }

  if (movimiento.tipo === 'SALIDA') {
    return cantidad * -1;
  }

  const detail = `${movimiento.referencia || ''} ${movimiento.motivo || ''}`.toLowerCase();
  const isNegativeAdjustment = ['resta', 'dismin', 'baja', 'negativ', '-'].some((keyword) =>
    detail.includes(keyword)
  );

  return isNegativeAdjustment ? cantidad * -1 : cantidad;
}

function mapKardexRows(rows) {
  let saldo = 0;

  return rows.map((row) => {
    const delta = getMovimientoDelta(row);
    saldo += delta;

    return {
      ...row,
      entrada: delta > 0 ? Math.abs(delta) : 0,
      salida: delta < 0 ? Math.abs(delta) : 0,
      saldo
    };
  });
}

function getSummary(rows, stockActual) {
  return {
    stockActual,
    entradasTotales: rows.reduce((sum, row) => sum + Number(row.entrada || 0), 0),
    salidasTotales: rows.reduce((sum, row) => sum + Number(row.salida || 0), 0),
    movimientosTotales: rows.length
  };
}

async function findKardex({ idProducto = null, idAlmacen = null, fechaInicio = null, fechaFin = null } = {}) {
  const params = [];
  const where = [];

  if (idProducto) {
    params.push(idProducto);
    where.push(`m.id_producto = $${params.length}`);
  }

  if (idAlmacen) {
    params.push(idAlmacen);
    where.push(`m.id_almacen = $${params.length}`);
  }

  const baseWhere = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const allRowsResult = await pool.query(
    `
      SELECT
        m.id_movimiento,
        m.id_producto,
        p.codigo_producto,
        p.nombre AS producto_nombre,
        m.id_almacen,
        a.nombre AS almacen_nombre,
        m.id_usuario,
        u.nombre AS usuario_nombre,
        m.tipo,
        m.cantidad,
        m.fecha,
        m.referencia,
        m.motivo
      FROM movimiento_inventario m
      INNER JOIN producto p ON p.id_producto = m.id_producto
      INNER JOIN almacen a ON a.id_almacen = m.id_almacen
      INNER JOIN usuarios u ON u.id = m.id_usuario
      ${baseWhere}
      ORDER BY m.fecha ASC, m.id_movimiento ASC
    `,
    params
  );

  const withSaldo = mapKardexRows(allRowsResult.rows);
  const filteredRows = withSaldo.filter((row) => {
    const fecha = toDateKey(row.fecha);
    const start = parseDateFilter(fechaInicio);
    const end = parseDateFilter(fechaFin);

    return (!start || fecha >= start) && (!end || fecha <= end);
  });

  const stockParams = [];
  const stockWhere = [];

  if (idProducto) {
    stockParams.push(idProducto);
    stockWhere.push(`id_producto = $${stockParams.length}`);
  }

  if (idAlmacen) {
    stockParams.push(idAlmacen);
    stockWhere.push(`id_almacen = $${stockParams.length}`);
  }

  const stockResult = stockWhere.length > 0
    ? await pool.query(
      `
        SELECT COALESCE(SUM(cantidad_actual), 0)::int AS stock_actual
        FROM stock
        WHERE ${stockWhere.join(' AND ')}
      `,
      stockParams
    )
    : { rows: [{ stock_actual: 0 }] };

  return {
    rows: filteredRows,
    summary: getSummary(filteredRows, Number(stockResult.rows[0]?.stock_actual || 0))
  };
}

module.exports = {
  findKardex
};
