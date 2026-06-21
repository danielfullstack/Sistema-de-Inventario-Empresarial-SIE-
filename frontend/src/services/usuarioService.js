import { apiFetch } from './apiClient.js'
const API_URL = '/api/usuarios'

async function request(url, options = {}) {
  let response

  try {
    response = await apiFetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    })
  } catch (_error) {
    throw new Error('No se pudo conectar con la API de usuarios.')
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de usuarios devolvio una respuesta no valida.')
  })

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'No se pudo completar la operacion.')
  }

  return data
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data
  }

  throw new Error('La respuesta de usuarios no contiene una lista valida.')
}

export async function getUsuarios() {
  const response = await request(API_URL)
  return normalizeListResponse(response)
}

export async function createUsuario(payload) {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function updateUsuario(idUsuario, payload) {
  const response = await request(`${API_URL}/${idUsuario}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateUsuarioEstado(idUsuario, estado) {
  const response = await request(`${API_URL}/${idUsuario}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado })
  })

  return response.data
}

export async function deleteUsuario(idUsuario) {
  const response = await request(`${API_URL}/${idUsuario}`, {
    method: 'DELETE'
  })

  return response.data
}
