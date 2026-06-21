const pool = require('../config/db');

const baseSelect = `
  SELECT
    id_almacen,
    nombre,
    direccion,
    capacidad_total,
    tipo,
    created_at,
    updated_at
  FROM almacen
`;

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY id_almacen ASC
  `);

  return rows;
}

async function findById(idAlmacen) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE id_almacen = $1`,
    [idAlmacen]
  );

  return rows[0] || null;
}

async function create({ nombre, direccion, capacidadTotal, tipo }) {
  const { rows } = await pool.query(
    `
      INSERT INTO almacen (nombre, direccion, capacidad_total, tipo)
      VALUES ($1, $2, $3, $4)
      RETURNING id_almacen
    `,
    [nombre, direccion, capacidadTotal, tipo]
  );

  return findById(rows[0].id_almacen);
}

async function update(idAlmacen, { nombre, direccion, capacidadTotal, tipo }) {
  const { rows } = await pool.query(
    `
      UPDATE almacen
      SET
        nombre = $1,
        direccion = $2,
        capacidad_total = $3,
        tipo = $4,
        updated_at = NOW()
      WHERE id_almacen = $5
      RETURNING id_almacen
    `,
    [nombre, direccion, capacidadTotal, tipo, idAlmacen]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_almacen);
}

async function remove(idAlmacen) {
  const { rowCount } = await pool.query(
    'DELETE FROM almacen WHERE id_almacen = $1',
    [idAlmacen]
  );

  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
