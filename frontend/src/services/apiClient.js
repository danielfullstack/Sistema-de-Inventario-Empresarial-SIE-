import { clearUsuario, getToken } from './sessionService.js'

export async function apiFetch(url, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (response.status === 401) {
    clearUsuario()

    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/')
      window.location.reload()
    }
  }

  return response
}
