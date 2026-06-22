import { apiFetch } from './apiClient.js'
const API_URL = '/api/ubicaciones'

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
    throw new Error(
      'No se pudo conectar con la API de ubicaciones. Verifica que el backend este activo y que la URL de API este configurada.'
    )
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de ubicaciones devolvio una respuesta no valida.')
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

  throw new Error('La respuesta de ubicaciones no contiene una lista valida.')
}

export async function getUbicaciones(estado = 'activo') {
  const response = await request(`${API_URL}?estado=${encodeURIComponent(estado)}`)
  return normalizeListResponse(response)
}

export async function getUbicacionesByAlmacen(idAlmacen, estado = 'activo') {
  const response = await request(`${API_URL}/almacen/${idAlmacen}?estado=${encodeURIComponent(estado)}`)
  return normalizeListResponse(response)
}

export async function createUbicacion(payload) {
  const response = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateUbicacion(idUbicacion, payload) {
  const response = await request(`${API_URL}/${idUbicacion}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function deleteUbicacion(idUbicacion) {
  return request(`${API_URL}/${idUbicacion}`, {
    method: 'DELETE'
  })
}

export async function reactivateUbicacion(idUbicacion) {
  const response = await request(`${API_URL}/${idUbicacion}/reactivar`, {
    method: 'PATCH'
  })

  return response.data
}
