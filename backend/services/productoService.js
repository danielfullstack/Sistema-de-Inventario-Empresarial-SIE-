const pool = require('../config/db');

const baseSelect = `
  SELECT
    p.id_producto,
    p.codigo_producto,
    p.nombre,
    p.descripcion,
    p.precio_unitario,
    p.unidad_medida,
    p.stock_minimo,
    p.stock_maximo,
    p.estado,
    p.id_categoria,
    c.nombre AS categoria_nombre,
    p.created_at,
    p.updated_at
  FROM producto p
  INNER JOIN categoria c ON c.id_categoria = p.id_categoria
`;

function buildEstadoFilter(estado, prefix = 'WHERE', paramIndex = 1) {
  if (estado === 'todos') {
    return { clause: '', params: [] };
  }

  const normalized = estado === 'inactivo' ? 'inactivo' : 'activo';
  return { clause: `${prefix} LOWER(p.estado) = $${paramIndex}`, params: [normalized] };
}

async function findAll(estado = 'activo') {
  const filter = buildEstadoFilter(estado);
  const { rows } = await pool.query(`
    ${baseSelect}
    ${filter.clause}
    ORDER BY p.id_producto ASC
  `, filter.params);

  return rows;
}

async function findById(idProducto) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE p.id_producto = $1`,
    [idProducto]
  );

  return rows[0] || null;
}

async function findByCategoria(idCategoria, estado = 'activo') {
  const filter = buildEstadoFilter(estado, 'AND', 2);
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE p.id_categoria = $1
      ${filter.clause}
      ORDER BY p.id_producto ASC
    `,
    [idCategoria, ...filter.params]
  );

  return rows;
}

async function findByCodigo(codigoProducto) {
  const { rows } = await pool.query(
    'SELECT id_producto FROM producto WHERE LOWER(codigo_producto) = LOWER($1) LIMIT 1',
    [codigoProducto]
  );

  return rows[0] || null;
}

async function create(producto) {
  const { rows } = await pool.query(
    `
      INSERT INTO producto (
        codigo_producto,
        nombre,
        descripcion,
        precio_unitario,
        unidad_medida,
        stock_minimo,
        stock_maximo,
        estado,
        id_categoria
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id_producto
    `,
    [
      producto.codigoProducto,
      producto.nombre,
      producto.descripcion,
      producto.precioUnitario,
      producto.unidadMedida,
      producto.stockMinimo,
      producto.stockMaximo,
      producto.estado,
      producto.idCategoria
    ]
  );

  return findById(rows[0].id_producto);
}

async function update(idProducto, producto) {
  const { rows } = await pool.query(
    `
      UPDATE producto
      SET
        codigo_producto = $1,
        nombre = $2,
        descripcion = $3,
        precio_unitario = $4,
        unidad_medida = $5,
        stock_minimo = $6,
        stock_maximo = $7,
        estado = LOWER($8),
        id_categoria = $9,
        updated_at = NOW()
      WHERE id_producto = $10
      RETURNING id_producto
    `,
    [
      producto.codigoProducto,
      producto.nombre,
      producto.descripcion,
      producto.precioUnitario,
      producto.unidadMedida,
      producto.stockMinimo,
      producto.stockMaximo,
      producto.estado,
      producto.idCategoria,
      idProducto
    ]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_producto);
}

async function updateEstado(idProducto, estado) {
  const { rows } = await pool.query(
    `
      UPDATE producto
      SET estado = $1, updated_at = NOW()
      WHERE id_producto = $2
      RETURNING id_producto
    `,
    [estado, idProducto]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_producto);
}

async function remove(idProducto) {
  return updateEstado(idProducto, 'inactivo');
}

async function reactivate(idProducto) {
  return updateEstado(idProducto, 'activo');
}

async function hasStock(idProducto) {
  const { rows } = await pool.query(
    'SELECT 1 FROM stock WHERE id_producto = $1 LIMIT 1',
    [idProducto]
  );

  return rows.length > 0;
}

module.exports = {
  findAll,
  findById,
  findByCategoria,
  findByCodigo,
  create,
  update,
  updateEstado,
  remove,
  reactivate,
  hasStock
};
