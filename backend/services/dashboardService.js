const pool = require('../config/db');

async function getSummary() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM producto) AS total_productos,
      (SELECT COUNT(*)::int FROM almacen) AS total_almacenes,
      (SELECT COUNT(*)::int FROM proveedor WHERE LOWER(COALESCE(estado, 'activo')) = 'activo') AS proveedores_activos,
      (SELECT COUNT(*)::int FROM orden_compra WHERE LOWER(COALESCE(estado, 'pendiente')) = 'pendiente') AS ordenes_pendientes,
      (
        SELECT COALESCE(SUM(COALESCE(cantidad_actual, 0)), 0)::int
        FROM stock
      ) AS stock_total,
      (
        SELECT COUNT(*)::int
        FROM stock s
        INNER JOIN producto p ON p.id_producto = s.id_producto
        WHERE COALESCE(s.cantidad_actual, 0) <= COALESCE(p.stock_minimo, 0)
      ) AS productos_stock_bajo,
      (
        SELECT COUNT(*)::int
        FROM movimiento_inventario
        WHERE fecha::date = CURRENT_DATE
      ) AS movimientos_hoy
  `);

  return rows[0];
}

async function getRecentMovements() {
  const { rows } = await pool.query(`
    SELECT
      m.id_movimiento,
      m.fecha,
      m.tipo,
      m.cantidad,
      p.codigo_producto,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre,
      u.nombre AS usuario_nombre
    FROM movimiento_inventario m
    INNER JOIN producto p ON p.id_producto = m.id_producto
    INNER JOIN almacen a ON a.id_almacen = m.id_almacen
    INNER JOIN usuarios u ON u.id = m.id_usuario
    ORDER BY m.fecha DESC, m.id_movimiento DESC
    LIMIT 8
  `);

  return rows;
}

async function getRecentOrders() {
  const { rows } = await pool.query(`
    SELECT
      oc.id_orden,
      oc.fecha_emision,
      oc.estado,
      oc.total,
      p.razon_social AS proveedor_nombre
    FROM orden_compra oc
    INNER JOIN proveedor p ON p.id_proveedor = oc.id_proveedor
    ORDER BY oc.fecha_emision DESC, oc.id_orden DESC
    LIMIT 6
  `);

  return rows;
}

async function getLowStock() {
  const { rows } = await pool.query(`
    SELECT
      s.id_stock,
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
    LIMIT 6
  `);

  return rows;
}

async function getDashboard() {
  const [summary, recentMovements, recentOrders, lowStock] = await Promise.all([
    getSummary(),
    getRecentMovements(),
    getRecentOrders(),
    getLowStock()
  ]);

  return {
    summary,
    recentMovements,
    recentOrders,
    lowStock
  };
}

module.exports = {
  getDashboard
};
