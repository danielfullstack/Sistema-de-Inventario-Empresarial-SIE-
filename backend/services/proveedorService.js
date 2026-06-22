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
    ORDER BY id_proveedor ASC
  `, filter.params);

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
        estado = LOWER($6),
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

async function updateEstado(idProveedor, estado) {
  const { rows } = await pool.query(
    `
      UPDATE proveedor
      SET estado = $1, updated_at = NOW()
      WHERE id_proveedor = $2
      RETURNING id_proveedor
    `,
    [estado, idProveedor]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_proveedor);
}

async function remove(idProveedor) {
  return updateEstado(idProveedor, 'inactivo');
}

async function reactivate(idProveedor) {
  return updateEstado(idProveedor, 'activo');
}

async function hasOrdenes(idProveedor) {
  const { rows } = await pool.query(
    'SELECT 1 FROM orden_compra WHERE id_proveedor = $1 LIMIT 1',
    [idProveedor]
  );

  return rows.length > 0;
}

module.exports = {
  findAll,
  findById,
  findByRuc,
  create,
  update,
  updateEstado,
  remove,
  reactivate,
  hasOrdenes
};
