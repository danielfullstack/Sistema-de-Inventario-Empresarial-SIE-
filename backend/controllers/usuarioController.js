const bcrypt = require('bcrypt');
const crypto = require('crypto');
const usuarioService = require('../services/usuarioService');

const ROLES_VALIDOS = ['Administrador', 'Supervisor', 'Operador'];
const ESTADOS_VALIDOS = ['activo', 'inactivo'];
const SALT_ROUNDS = 10;

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeRol(rol = '') {
  const normalized = String(rol).trim().toLowerCase();
  const found = ROLES_VALIDOS.find((item) => item.toLowerCase() === normalized);

  return found || '';
}

function normalizeEstado(estado = '') {
  const normalized = String(estado).trim().toLowerCase();
  return ESTADOS_VALIDOS.includes(normalized) ? normalized : '';
}

function parsePayload(body) {
  return {
    nombre: String(body.nombre || '').trim(),
    apellido: String(body.apellido || '').trim() || null,
    correo: String(body.correo || '').trim().toLowerCase(),
    rol: normalizeRol(body.rol),
    estado: normalizeEstado(body.estado || 'activo') || 'activo'
  };
}

function validatePayload(payload) {
  if (!payload.nombre) {
    return 'El nombre es obligatorio.';
  }

  if (!payload.correo) {
    return 'El correo es obligatorio.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.correo)) {
    return 'El correo ingresado no es valido.';
  }

  if (!payload.rol || !ROLES_VALIDOS.includes(payload.rol)) {
    return 'El rol seleccionado no es valido.';
  }

  return null;
}

async function validateUniqueCorreo(correo, idUsuarioActual = null) {
  const usuario = await usuarioService.findByCorreo(correo);

  if (!usuario) {
    return true;
  }

  return usuario.id === idUsuarioActual;
}

function generateTemporaryPassword() {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

async function getUsuarios(_req, res) {
  try {
    const usuarios = await usuarioService.findAll();

    return res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar usuarios.'
    });
  }
}

async function getUsuarioById(req, res) {
  const idUsuario = parseId(req.params.id);

  if (!idUsuario) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario invalido.'
    });
  }

  try {
    const usuario = await usuarioService.findById(idUsuario);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuario.'
    });
  }
}

async function createUsuario(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateUniqueCorreo(payload.correo))) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya esta registrado.'
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);
    const usuario = await usuarioService.create({
      ...payload,
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente.',
      data: usuario,
      temporaryPassword
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al crear usuario.'
    });
  }
}

async function updateUsuario(req, res) {
  const idUsuario = parseId(req.params.id);

  if (!idUsuario) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario invalido.'
    });
  }

  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateUniqueCorreo(payload.correo, idUsuario))) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya esta registrado.'
      });
    }

    const usuario = await usuarioService.update(idUsuario, payload);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Usuario actualizado correctamente.',
      data: usuario
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario.'
    });
  }
}

async function updateEstado(req, res) {
  const idUsuario = parseId(req.params.id);
  const estado = normalizeEstado(req.body.estado);

  if (!idUsuario) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario invalido.'
    });
  }

  if (!estado) {
    return res.status(400).json({
      success: false,
      message: 'Estado de usuario invalido.'
    });
  }

  try {
    const usuario = await usuarioService.updateEstado(idUsuario, estado);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Estado de usuario actualizado correctamente.',
      data: usuario
    });
  } catch (error) {
    console.error('Error al actualizar estado de usuario:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de usuario.'
    });
  }
}

async function deleteUsuario(req, res) {
  const idUsuario = parseId(req.params.id);

  if (!idUsuario) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario invalido.'
    });
  }

  try {
    const usuario = await usuarioService.softDelete(idUsuario);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Usuario desactivado correctamente.',
      data: usuario
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al desactivar usuario.'
    });
  }
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  updateEstado,
  deleteUsuario
};
