const pool = require('../config/db');

function buildDateFilter(alias, params, fechaInicio, fechaFin) {
  const conditions = [];

  if (fechaInicio) {
    params.push(fechaInicio);
    conditions.push(`${alias}::date >= $${params.length}`);
  }

  if (fechaFin) {
    params.push(fechaFin);
    conditions.push(`${alias}::date <= $${params.length}`);
  }

  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

async function getStockActual() {
  const { rows } = await pool.query(`
    SELECT
      p.codigo_producto,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre,
      COALESCE(s.cantidad_actual, 0) AS cantidad_actual,
      COALESCE(s.cantidad_reservada, 0) AS cantidad_reservada,
      COALESCE(s.cantidad_actual, 0) - COALESCE(s.cantidad_reservada, 0) AS stock_disponible,
      COALESCE(p.stock_minimo, 0) AS stock_minimo
    FROM stock s
    INNER JOIN producto p ON p.id_producto = s.id_producto
    INNER JOIN almacen a ON a.id_almacen = s.id_almacen
    ORDER BY p.nombre ASC, a.nombre ASC
  `);

  return rows;
}

async function getStockBajo() {
  const { rows } = await pool.query(`
    SELECT
      p.codigo_producto,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre,
      COALESCE(s.cantidad_actual, 0) AS cantidad_actual,
      COALESCE(p.stock_minimo, 0) AS stock_minimo
    FROM stock s
    INNER JOIN producto p ON p.id_producto = s.id_producto
    INNER JOIN almacen a ON a.id_almacen = s.id_almacen
    WHERE COALESCE(s.cantidad_actual, 0) <= COALESCE(p.stock_minimo, 0)
    ORDER BY p.nombre ASC, a.nombre ASC
  `);

  return rows;
}

async function getMovimientosPorFecha(fechaInicio, fechaFin) {
  const params = [];
  const where = buildDateFilter('m.fecha', params, fechaInicio, fechaFin);
  const { rows } = await pool.query(`
    SELECT
      m.fecha::date AS fecha,
      m.tipo,
      COUNT(*)::int AS total_movimientos,
      COALESCE(SUM(m.cantidad), 0)::int AS cantidad_total
    FROM movimiento_inventario m
    ${where}
    GROUP BY m.fecha::date, m.tipo
    ORDER BY m.fecha::date DESC, m.tipo ASC
  `, params);

  return rows;
}

async function getProductosMasUsados(fechaInicio, fechaFin) {
  const params = [];
  const where = buildDateFilter('m.fecha', params, fechaInicio, fechaFin);
  const { rows } = await pool.query(`
    SELECT
      p.codigo_producto,
      p.nombre AS producto_nombre,
      COUNT(m.id_movimiento)::int AS total_movimientos,
      COALESCE(SUM(m.cantidad), 0)::int AS cantidad_total
    FROM movimiento_inventario m
    INNER JOIN producto p ON p.id_producto = m.id_producto
    ${where}
    GROUP BY p.codigo_producto, p.nombre
    ORDER BY cantidad_total DESC, total_movimientos DESC, p.nombre ASC
    LIMIT 10
  `, params);

  return rows;
}

async function getComprasPorProveedor(fechaInicio, fechaFin) {
  const params = [];
  const where = buildDateFilter('oc.fecha_emision', params, fechaInicio, fechaFin);
  const { rows } = await pool.query(`
    SELECT
      pr.id_proveedor,
      pr.razon_social AS proveedor_nombre,
      pr.ruc,
      COUNT(oc.id_orden)::int AS total_ordenes,
      COALESCE(SUM(oc.total), 0)::numeric AS total_compras
    FROM proveedor pr
    LEFT JOIN orden_compra oc ON oc.id_proveedor = pr.id_proveedor
    ${where ? where.replace('WHERE', 'WHERE oc.id_orden IS NOT NULL AND') : ''}
    GROUP BY pr.id_proveedor, pr.razon_social, pr.ruc
    ORDER BY total_compras DESC, total_ordenes DESC, pr.razon_social ASC
  `, params);

  return rows;
}

async function getReportes(filters = {}) {
  const fechaInicio = filters.fechaInicio || null;
  const fechaFin = filters.fechaFin || null;
  const [stockActual, stockBajo, movimientosPorFecha, productosMasUsados, comprasPorProveedor] = await Promise.all([
    getStockActual(),
    getStockBajo(),
    getMovimientosPorFecha(fechaInicio, fechaFin),
    getProductosMasUsados(fechaInicio, fechaFin),
    getComprasPorProveedor(fechaInicio, fechaFin)
  ]);

  return {
    stockActual,
    stockBajo,
    movimientosPorFecha,
    productosMasUsados,
    comprasPorProveedor
  };
}

module.exports = {
  getReportes
};
