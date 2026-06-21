const USER_STORAGE_KEY = 'usuario'
const TOKEN_STORAGE_KEY = 'token'
const LEGACY_USER_STORAGE_KEY = 'sie_usuario'

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
      rol: usuario.rol
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
