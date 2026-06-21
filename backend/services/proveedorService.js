const pool = require('../config/db');

const baseSelect = `
  SELECT
    id_proveedor,
    razon_social,
    ruc,
    telefono,
    email,
    direccion,
    estado,
    created_at,
    updated_at
  FROM proveedor
`;

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY id_proveedor ASC
  `);

  return rows;
}

async function findById(idProveedor) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE id_proveedor = $1`,
    [idProveedor]
  );

  return rows[0] || null;
}

async function findByRuc(ruc) {
  const { rows } = await pool.query(
    'SELECT id_proveedor FROM proveedor WHERE ruc = $1 LIMIT 1',
    [ruc]
  );

  return rows[0] || null;
}

async function create(proveedor) {
  const { rows } = await pool.query(
    `
      INSERT INTO proveedor (razon_social, ruc, telefono, email, direccion, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_proveedor
    `,
    [
      proveedor.razonSocial,
      proveedor.ruc,
      proveedor.telefono,
      proveedor.email,
      proveedor.direccion,
      proveedor.estado
    ]
  );

  return findById(rows[0].id_proveedor);
}

async function update(idProveedor, proveedor) {
  const { rows } = await pool.query(
    `
      UPDATE proveedor
      SET
        razon_social = $1,
        ruc = $2,
        telefono = $3,
        email = $4,
        direccion = $5,
        estado = $6,
        updated_at = NOW()
      WHERE id_proveedor = $7
      RETURNING id_proveedor
    `,
    [
      proveedor.razonSocial,
      proveedor.ruc,
      proveedor.telefono,
      proveedor.email,
      proveedor.direccion,
      proveedor.estado,
      idProveedor
    ]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_proveedor);
}

async function remove(idProveedor) {
  const { rowCount } = await pool.query(
    'DELETE FROM proveedor WHERE id_proveedor = $1',
    [idProveedor]
  );

  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findByRuc,
  create,
  update,
  remove
};
