import { apiFetch } from './apiClient.js'
const API_URL = '/api/proveedores'

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
      'No se pudo conectar con la API de proveedores. Verifica que el backend este activo en http://localhost:3000 y que Vite use el proxy /api.'
    )
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de proveedores devolvio una respuesta no valida.')
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

  throw new Error('La respuesta de proveedores no contiene una lista valida.')
}

export async function getProveedores() {
  const response = await request(API_URL)
  return normalizeListResponse(response)
}

export async function createProveedor(payload) {
  const response = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateProveedor(idProveedor, payload) {
  const response = await request(`${API_URL}/${idProveedor}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function deleteProveedor(idProveedor) {
  return request(`${API_URL}/${idProveedor}`, {
    method: 'DELETE'
  })
}
