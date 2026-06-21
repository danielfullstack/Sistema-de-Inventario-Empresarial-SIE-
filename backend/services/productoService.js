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

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY p.id_producto ASC
  `);

  return rows;
}

async function findById(idProducto) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE p.id_producto = $1`,
    [idProducto]
  );

  return rows[0] || null;
}

async function findByCategoria(idCategoria) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE p.id_categoria = $1
      ORDER BY p.id_producto ASC
    `,
    [idCategoria]
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
        estado = $8,
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

async function remove(idProducto) {
  const { rowCount } = await pool.query(
    'DELETE FROM producto WHERE id_producto = $1',
    [idProducto]
  );

  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findByCategoria,
  findByCodigo,
  create,
  update,
  remove
};
