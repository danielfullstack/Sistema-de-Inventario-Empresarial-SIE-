const pool = require('../config/db');

const baseSelect = `
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
    m.motivo,
    m.created_at
  FROM movimiento_inventario m
  INNER JOIN producto p ON p.id_producto = m.id_producto
  INNER JOIN almacen a ON a.id_almacen = m.id_almacen
  INNER JOIN usuarios u ON u.id = m.id_usuario
`;

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY m.fecha DESC, m.id_movimiento DESC
  `);

  return rows;
}

async function findById(idMovimiento) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE m.id_movimiento = $1`,
    [idMovimiento]
  );

  return rows[0] || null;
}

async function findByProducto(idProducto) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE m.id_producto = $1
      ORDER BY m.fecha DESC, m.id_movimiento DESC
    `,
    [idProducto]
  );

  return rows;
}

async function findByAlmacen(idAlmacen) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE m.id_almacen = $1
      ORDER BY m.fecha DESC, m.id_movimiento DESC
    `,
    [idAlmacen]
  );

  return rows;
}

async function create(movimiento) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const product = await client.query(
      'SELECT id_producto FROM producto WHERE id_producto = $1',
      [movimiento.idProducto]
    );

    if (product.rows.length === 0) {
      const error = new Error('El producto seleccionado no existe.');
      error.status = 400;
      throw error;
    }

    const warehouse = await client.query(
      'SELECT id_almacen FROM almacen WHERE id_almacen = $1',
      [movimiento.idAlmacen]
    );

    if (warehouse.rows.length === 0) {
      const error = new Error('El almacen seleccionado no existe.');
      error.status = 400;
      throw error;
    }

    const user = await client.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [movimiento.idUsuario]
    );

    if (user.rows.length === 0) {
      const error = new Error('El usuario seleccionado no existe.');
      error.status = 400;
      throw error;
    }

    let stock = await client.query(
      `
        SELECT id_stock, COALESCE(cantidad_actual, 0) AS cantidad_actual, COALESCE(cantidad_reservada, 0) AS cantidad_reservada
        FROM stock
        WHERE id_producto = $1 AND id_almacen = $2
        FOR UPDATE
      `,
      [movimiento.idProducto, movimiento.idAlmacen]
    );

    if (stock.rows.length === 0) {
      if (movimiento.tipo === 'SALIDA') {
        const error = new Error('No existe stock para realizar una salida.');
        error.status = 400;
        throw error;
      }

      const insertedStock = await client.query(
        `
          INSERT INTO stock (id_producto, id_almacen, cantidad_actual, cantidad_reservada, fecha_actualizacion)
          VALUES ($1, $2, 0, 0, NOW())
          RETURNING id_stock, cantidad_actual, cantidad_reservada
        `,
        [movimiento.idProducto, movimiento.idAlmacen]
      );

      stock = insertedStock;
    }

    const currentStock = Number(stock.rows[0].cantidad_actual || 0);
    const delta = getStockDelta(movimiento);
    const nextStock = currentStock + delta;

    if (nextStock < 0) {
      const error = new Error('No se puede registrar el movimiento porque el stock quedaria negativo.');
      error.status = 400;
      throw error;
    }

    const insertedMovement = await client.query(
      `
        INSERT INTO movimiento_inventario (
          id_producto,
          id_almacen,
          id_usuario,
          tipo,
          cantidad,
          fecha,
          referencia,
          motivo
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
        RETURNING id_movimiento
      `,
      [
        movimiento.idProducto,
        movimiento.idAlmacen,
        movimiento.idUsuario,
        movimiento.tipo,
        movimiento.cantidad,
        movimiento.referencia,
        movimiento.motivo
      ]
    );

    await client.query(
      `
        UPDATE stock
        SET
          cantidad_actual = $1,
          fecha_actualizacion = NOW(),
          updated_at = NOW()
        WHERE id_stock = $2
      `,
      [nextStock, stock.rows[0].id_stock]
    );

    await client.query('COMMIT');

    return findById(insertedMovement.rows[0].id_movimiento);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function getStockDelta(movimiento) {
  if (movimiento.tipo === 'ENTRADA') {
    return movimiento.cantidad;
  }

  if (movimiento.tipo === 'SALIDA') {
    return movimiento.cantidad * -1;
  }

  if (movimiento.tipo === 'AJUSTE' && movimiento.ajusteOperacion === 'RESTA') {
    return movimiento.cantidad * -1;
  }

  return movimiento.cantidad;
}

module.exports = {
  findAll,
  findById,
  findByProducto,
  findByAlmacen,
  create
};
