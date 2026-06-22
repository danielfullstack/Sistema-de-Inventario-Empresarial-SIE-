const pool = require('../config/db');

const baseSelect = `
  SELECT
    c.id_categoria,
    c.nombre,
    c.descripcion,
    c.id_categoria_padre,
    padre.nombre AS categoria_padre,
    c.estado,
    c.created_at,
    c.updated_at
  FROM categoria c
  LEFT JOIN categoria padre ON padre.id_categoria = c.id_categoria_padre
`;

function buildEstadoFilter(estado, alias = 'c') {
  if (estado === 'todos') {
    return { clause: '', params: [] };
  }

  const normalized = estado === 'inactivo' ? 'inactivo' : 'activo';
  return { clause: `WHERE LOWER(${alias}.estado) = $1`, params: [normalized] };
}

async function findAll(estado = 'activo') {
  const filter = buildEstadoFilter(estado);
  const { rows } = await pool.query(`
    ${baseSelect}
    ${filter.clause}
    ORDER BY c.id_categoria ASC
  `, filter.params);

  return rows;
}

async function findById(idCategoria) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE c.id_categoria = $1`,
    [idCategoria]
  );

  return rows[0] || null;
}

async function create({ nombre, descripcion, idCategoriaPadre }) {
  const { rows } = await pool.query(
    `
      INSERT INTO categoria (nombre, descripcion, id_categoria_padre)
      VALUES ($1, $2, $3)
      RETURNING id_categoria
    `,
    [nombre, descripcion, idCategoriaPadre]
  );

  return findById(rows[0].id_categoria);
}

async function update(idCategoria, { nombre, descripcion, idCategoriaPadre }) {
  const { rows } = await pool.query(
    `
      UPDATE categoria
      SET
        nombre = $1,
        descripcion = $2,
        id_categoria_padre = $3,
        updated_at = NOW()
      WHERE id_categoria = $4
      RETURNING id_categoria
    `,
    [nombre, descripcion, idCategoriaPadre, idCategoria]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_categoria);
}

async function updateEstado(idCategoria, estado) {
  const { rows } = await pool.query(
    `
      UPDATE categoria
      SET estado = $1, updated_at = NOW()
      WHERE id_categoria = $2
      RETURNING id_categoria
    `,
    [estado, idCategoria]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_categoria);
}

async function remove(idCategoria) {
  return updateEstado(idCategoria, 'inactivo');
}

async function reactivate(idCategoria) {
  return updateEstado(idCategoria, 'activo');
}

async function hasChildren(idCategoria) {
  const { rows } = await pool.query(
    'SELECT 1 FROM categoria WHERE id_categoria_padre = $1 LIMIT 1',
    [idCategoria]
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
  hasChildren
};
