const pool = require('../config/db');

const baseSelect = `
  SELECT
    s.id_stock,
    s.id_producto,
    p.codigo_producto,
    p.nombre AS producto_nombre,
    p.stock_minimo,
    s.id_almacen,
    a.nombre AS almacen_nombre,
    COALESCE(s.cantidad_actual, 0) AS cantidad_actual,
    COALESCE(s.cantidad_reservada, 0) AS cantidad_reservada,
    COALESCE(s.cantidad_actual, 0) - COALESCE(s.cantidad_reservada, 0) AS stock_disponible,
    CASE
      WHEN COALESCE(s.cantidad_actual, 0) <= COALESCE(p.stock_minimo, 0)
      THEN 'Stock Bajo'
      ELSE 'Stock Normal'
    END AS estado_stock,
    s.fecha_actualizacion,
    s.created_at,
    s.updated_at
  FROM stock s
  INNER JOIN producto p ON p.id_producto = s.id_producto
  INNER JOIN almacen a ON a.id_almacen = s.id_almacen
`;

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY p.nombre ASC, a.nombre ASC
  `);

  return rows;
}

async function findById(idStock) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE s.id_stock = $1`,
    [idStock]
  );

  return rows[0] || null;
}

async function findByProducto(idProducto) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE s.id_producto = $1
      ORDER BY a.nombre ASC
    `,
    [idProducto]
  );

  return rows;
}

async function findByAlmacen(idAlmacen) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE s.id_almacen = $1
      ORDER BY p.nombre ASC
    `,
    [idAlmacen]
  );

  return rows;
}

async function findLowStock() {
  const { rows } = await pool.query(`
    ${baseSelect}
    WHERE COALESCE(s.cantidad_actual, 0) <= COALESCE(p.stock_minimo, 0)
    ORDER BY p.nombre ASC, a.nombre ASC
  `);

  return rows;
}

module.exports = {
  findAll,
  findById,
  findByProducto,
  findByAlmacen,
  findLowStock
};
