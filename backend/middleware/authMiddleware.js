const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

function normalizeRole(role = '') {
  const normalized = String(role).trim().toLowerCase();

  if (normalized === 'admin') {
    return 'Administrador';
  }

  if (normalized === 'administrador') {
    return 'Administrador';
  }

  if (normalized === 'supervisor') {
    return 'Supervisor';
  }

  if (normalized === 'operador') {
    return 'Operador';
  }

  return role;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticacion requerido.'
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: payload.id,
      nombre: payload.nombre,
      correo: payload.correo,
      rol: normalizeRole(payload.rol)
    };

    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalido o expirado.'
    });
  }
}

function authorizeRoles(...roles) {
  const allowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.rol);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta accion.'
      });
    }

    return next();
  };
}

const requireRoles = authorizeRoles;

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireRoles,
  normalizeRole
};
