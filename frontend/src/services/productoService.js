import { apiFetch } from './apiClient.js'
const API_URL = '/api/productos'

async function request(url, options = {}) {
  const response = await apiFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })
  const data = await response.json()

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'No se pudo completar la operacion.')
  }

  return data
}

export async function getProductos(estado = 'activo') {
  const response = await request(`${API_URL}?estado=${encodeURIComponent(estado)}`)
  return response.data
}

export async function getProductosByCategoria(idCategoria, estado = 'activo') {
  const response = await request(`${API_URL}/categoria/${idCategoria}?estado=${encodeURIComponent(estado)}`)
  return response.data
}

export async function createProducto(payload) {
  const response = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateProducto(idProducto, payload) {
  const response = await request(`${API_URL}/${idProducto}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function deleteProducto(idProducto) {
  return request(`${API_URL}/${idProducto}`, {
    method: 'DELETE'
  })
}

export async function reactivateProducto(idProducto) {
  const response = await request(`${API_URL}/${idProducto}/reactivar`, {
    method: 'PATCH'
  })

  return response.data
}
