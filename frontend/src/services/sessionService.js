const USER_STORAGE_KEY = 'usuario'
const TOKEN_STORAGE_KEY = 'token'
const LEGACY_USER_STORAGE_KEY = 'sie_usuario'
const ROLE_PERMISSIONS = {
  Administrador: [
    '/dashboard',
    '/categorias',
    '/productos',
    '/almacenes',
    '/ubicaciones',
    '/stock',
    '/kardex',
    '/movimientos',
    '/proveedores',
    '/ordenes-compra',
    '/usuarios',
    '/reportes',
    '/auditoria'
  ],
  Supervisor: [
    '/dashboard',
    '/categorias',
    '/productos',
    '/almacenes',
    '/ubicaciones',
    '/stock',
    '/kardex',
    '/movimientos',
    '/proveedores',
    '/ordenes-compra',
    '/reportes'
  ],
  Operador: [
    '/dashboard',
    '/stock',
    '/kardex',
    '/movimientos'
  ]
}

export function normalizeRole(role = '') {
  const normalized = String(role).trim().toLowerCase()

  if (normalized === 'admin' || normalized === 'administrador') {
    return 'Administrador'
  }

  if (normalized === 'supervisor') {
    return 'Supervisor'
  }

  if (normalized === 'operador') {
    return 'Operador'
  }

  return role
}

export function canAccessPath(usuario, path) {
  const role = normalizeRole(usuario?.rol)
  const allowedPaths = ROLE_PERMISSIONS[role] || []

  return allowedPaths.includes(path)
}

export function getUsuario() {
  const rawUsuario = localStorage.getItem(USER_STORAGE_KEY)

  if (!rawUsuario) {
    return null
  }

  try {
    return JSON.parse(rawUsuario)
  } catch (_error) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function saveUsuario(usuario, token = null) {
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY)

  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: normalizeRole(usuario.rol)
    })
  )

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }
}

export function clearUsuario() {
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
}
