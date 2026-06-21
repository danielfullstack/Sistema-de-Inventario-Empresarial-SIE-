const pool = require('../config/db');

const baseSelect = `
  SELECT
    u.id_ubicacion,
    u.id_almacen,
    a.nombre AS almacen_nombre,
    u.codigo,
    u.pasillo,
    u.estante,
    u.nivel,
    u.capacidad,
    u.created_at,
    u.updated_at
  FROM ubicacion u
  INNER JOIN almacen a ON a.id_almacen = u.id_almacen
`;

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY u.id_ubicacion ASC
  `);

  return rows;
}

async function findById(idUbicacion) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE u.id_ubicacion = $1`,
    [idUbicacion]
  );

  return rows[0] || null;
}

async function findByAlmacen(idAlmacen) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE u.id_almacen = $1
      ORDER BY u.id_ubicacion ASC
    `,
    [idAlmacen]
  );

  return rows;
}

async function create({ idAlmacen, codigo, pasillo, estante, nivel, capacidad }) {
  const { rows } = await pool.query(
    `
      INSERT INTO ubicacion (id_almacen, codigo, pasillo, estante, nivel, capacidad)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_ubicacion
    `,
    [idAlmacen, codigo, pasillo, estante, nivel, capacidad]
  );

  return findById(rows[0].id_ubicacion);
}

async function update(idUbicacion, { idAlmacen, codigo, pasillo, estante, nivel, capacidad }) {
  const { rows } = await pool.query(
    `
      UPDATE ubicacion
      SET
        id_almacen = $1,
        codigo = $2,
        pasillo = $3,
        estante = $4,
        nivel = $5,
        capacidad = $6,
        updated_at = NOW()
      WHERE id_ubicacion = $7
      RETURNING id_ubicacion
    `,
    [idAlmacen, codigo, pasillo, estante, nivel, capacidad, idUbicacion]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_ubicacion);
}

async function remove(idUbicacion) {
  const { rowCount } = await pool.query(
    'DELETE FROM ubicacion WHERE id_ubicacion = $1',
    [idUbicacion]
  );

  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findByAlmacen,
  create,
  update,
  remove
};
