import { clearUsuario, getToken } from './sessionService.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function resolveApiUrl(url) {
  if (!API_BASE_URL || /^https?:\/\//.test(url)) {
    return url
  }

  return `${API_BASE_URL.replace(/\/$/, '')}${url}`
}

export async function apiFetch(url, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(resolveApiUrl(url), {
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
