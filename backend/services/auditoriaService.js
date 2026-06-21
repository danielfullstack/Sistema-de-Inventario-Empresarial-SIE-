const pool = require('../config/db');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id_auditoria SERIAL PRIMARY KEY,
      id_usuario INT NOT NULL,
      usuario_nombre VARCHAR(200),
      modulo VARCHAR(100),
      accion VARCHAR(100),
      registro_id INT,
      descripcion TEXT,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function registrarAuditoria({
  id_usuario,
  usuario_nombre,
  modulo,
  accion,
  registro_id = null,
  descripcion = null
}) {
  if (!id_usuario || !modulo || !accion) {
    return null;
  }

  const { rows } = await pool.query(
    `
      INSERT INTO auditoria (
        id_usuario,
        usuario_nombre,
        modulo,
        accion,
        registro_id,
        descripcion
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      id_usuario,
      usuario_nombre || null,
      modulo,
      accion,
      registro_id,
      descripcion
    ]
  );

  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(`
    SELECT *
    FROM auditoria
    ORDER BY fecha DESC, id_auditoria DESC
  `);

  return rows;
}

async function findById(idAuditoria) {
  const { rows } = await pool.query(
    'SELECT * FROM auditoria WHERE id_auditoria = $1',
    [idAuditoria]
  );

  return rows[0] || null;
}

async function findByUsuario(idUsuario) {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM auditoria
      WHERE id_usuario = $1
      ORDER BY fecha DESC, id_auditoria DESC
    `,
    [idUsuario]
  );

  return rows;
}

module.exports = {
  ensureTable,
  registrarAuditoria,
  findAll,
  findById,
  findByUsuario
};
