import { apiFetch } from './apiClient.js'
const API_URL = '/api/almacenes'

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
      'No se pudo conectar con la API de almacenes. Verifica que el backend este activo y que la URL de API este configurada.'
    )
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de almacenes devolvio una respuesta no valida.')
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

  throw new Error('La respuesta de almacenes no contiene una lista valida.')
}

export async function getAlmacenes(estado = 'activo') {
  const response = await request(`${API_URL}?estado=${encodeURIComponent(estado)}`)
  return normalizeListResponse(response)
}

export async function createAlmacen(payload) {
  const response = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateAlmacen(idAlmacen, payload) {
  const response = await request(`${API_URL}/${idAlmacen}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function deleteAlmacen(idAlmacen) {
  return request(`${API_URL}/${idAlmacen}`, {
    method: 'DELETE'
  })
}

export async function reactivateAlmacen(idAlmacen) {
  const response = await request(`${API_URL}/${idAlmacen}/reactivar`, {
    method: 'PATCH'
  })

  return response.data
}
