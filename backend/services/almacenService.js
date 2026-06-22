const pool = require('../config/db');

const baseSelect = `
  SELECT
    id_almacen,
    nombre,
    direccion,
    capacidad_total,
    tipo,
    estado,
    created_at,
    updated_at
  FROM almacen
`;

function buildEstadoFilter(estado) {
  if (estado === 'todos') {
    return { clause: '', params: [] };
  }

  const normalized = estado === 'inactivo' ? 'inactivo' : 'activo';
  return { clause: 'WHERE LOWER(estado) = $1', params: [normalized] };
}

async function findAll(estado = 'activo') {
  const filter = buildEstadoFilter(estado);
  const { rows } = await pool.query(`
    ${baseSelect}
    ${filter.clause}
    ORDER BY id_almacen ASC
  `, filter.params);

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

async function updateEstado(idAlmacen, estado) {
  const { rows } = await pool.query(
    `
      UPDATE almacen
      SET estado = $1, updated_at = NOW()
      WHERE id_almacen = $2
      RETURNING id_almacen
    `,
    [estado, idAlmacen]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_almacen);
}

async function remove(idAlmacen) {
  return updateEstado(idAlmacen, 'inactivo');
}

async function reactivate(idAlmacen) {
  return updateEstado(idAlmacen, 'activo');
}

async function hasStock(idAlmacen) {
  const { rows } = await pool.query(
    'SELECT 1 FROM stock WHERE id_almacen = $1 LIMIT 1',
    [idAlmacen]
  );

  return rows.length > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  updateEstado,
  remove,
  reactivate,
  hasStock
};
