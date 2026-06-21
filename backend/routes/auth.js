const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_EXPIRES_IN, JWT_SECRET } = require('../config/jwt');
const { authenticateToken, normalizeRole } = require('../middleware/authMiddleware');
const { registrarAuditoria } = require('../services/auditoriaService');

const router = express.Router();

function isBcryptHash(value = '') {
  return String(value).startsWith('$2');
}

router.post('/login', async (req, res) => {
  const correo = String(req.body.correo || '').trim();
  const password = String(req.body.password || '').trim();

  if (!correo || !password) {
    return res.status(400).json({
      success: false,
      message: 'Correo y password son obligatorios.'
    });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    const usuario = rows[0];

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    if (String(usuario.estado || 'activo').toLowerCase() !== 'activo') {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    const passwordOk = isBcryptHash(usuario.password)
      ? await bcrypt.compare(password, usuario.password)
      : usuario.password === password;

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Contrasena incorrecta.'
      });
    }

    if (!isBcryptHash(usuario.password)) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE usuarios SET password = $1 WHERE id = $2',
        [passwordHash, usuario.id]
      );
    }

    await pool.query(
      'UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1',
      [usuario.id]
    );

    const rol = normalizeRole(usuario.rol);
    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await registrarAuditoria({
      id_usuario: usuario.id,
      usuario_nombre: usuario.nombre,
      modulo: 'Auth',
      accion: 'LOGIN',
      registro_id: usuario.id,
      descripcion: `${usuario.nombre} inicio sesion.`
    });

    return res.json({
      success: true,
      message: 'Login exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.'
    });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await registrarAuditoria({
      id_usuario: req.user.id,
      usuario_nombre: req.user.nombre,
      modulo: 'Auth',
      accion: 'LOGOUT',
      registro_id: req.user.id,
      descripcion: `${req.user.nombre} cerro sesion.`
    });

    return res.json({
      success: true,
      message: 'Logout registrado correctamente.'
    });
  } catch (error) {
    console.error('Error en logout:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al registrar logout.'
    });
  }
});

module.exports = router;
