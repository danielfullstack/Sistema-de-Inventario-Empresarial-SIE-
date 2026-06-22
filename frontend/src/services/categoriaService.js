import { apiFetch } from './apiClient.js'
const API_URL = '/api/categorias'

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

export async function getCategorias(estado = 'activo') {
  const response = await request(`${API_URL}?estado=${encodeURIComponent(estado)}`)
  return response.data
}

export async function createCategoria(payload) {
  const response = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateCategoria(idCategoria, payload) {
  const response = await request(`${API_URL}/${idCategoria}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function deleteCategoria(idCategoria) {
  return request(`${API_URL}/${idCategoria}`, {
    method: 'DELETE'
  })
}

export async function reactivateCategoria(idCategoria) {
  const response = await request(`${API_URL}/${idCategoria}/reactivar`, {
    method: 'PATCH'
  })

  return response.data
}
