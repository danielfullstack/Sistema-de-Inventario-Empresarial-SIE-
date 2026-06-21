const pool = require('../config/db');

const baseSelect = `
  SELECT
    id,
    nombre,
    apellido,
    correo,
    rol,
    estado,
    ultimo_login,
    created_at
  FROM usuarios
`;

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY id ASC
  `);

  return rows;
}

async function findById(idUsuario) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE id = $1`,
    [idUsuario]
  );

  return rows[0] || null;
}

async function findByCorreo(correo) {
  const { rows } = await pool.query(
    'SELECT id FROM usuarios WHERE LOWER(correo) = LOWER($1) LIMIT 1',
    [correo]
  );

  return rows[0] || null;
}

async function create(usuario) {
  const { rows } = await pool.query(
    `
      INSERT INTO usuarios (
        nombre,
        apellido,
        correo,
        password,
        rol,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [
      usuario.nombre,
      usuario.apellido,
      usuario.correo,
      usuario.passwordHash,
      usuario.rol,
      usuario.estado
    ]
  );

  return findById(rows[0].id);
}

async function update(idUsuario, usuario) {
  const { rows } = await pool.query(
    `
      UPDATE usuarios
      SET
        nombre = $1,
        apellido = $2,
        correo = $3,
        rol = $4
      WHERE id = $5
      RETURNING id
    `,
    [
      usuario.nombre,
      usuario.apellido,
      usuario.correo,
      usuario.rol,
      idUsuario
    ]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id);
}

async function updateEstado(idUsuario, estado) {
  const { rows } = await pool.query(
    `
      UPDATE usuarios
      SET estado = $1
      WHERE id = $2
      RETURNING id
    `,
    [estado, idUsuario]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id);
}

async function softDelete(idUsuario) {
  return updateEstado(idUsuario, 'inactivo');
}

module.exports = {
  findAll,
  findById,
  findByCorreo,
  create,
  update,
  updateEstado,
  softDelete
};
