import { apiFetch } from './apiClient.js'
const API_URL = '/api/stock'

async function request(url) {
  let response

  try {
    response = await apiFetch(url)
  } catch (_error) {
    throw new Error(
      'No se pudo conectar con la API de stock. Verifica que el backend este activo en http://localhost:3000 y que Vite use el proxy /api.'
    )
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de stock devolvio una respuesta no valida.')
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

  throw new Error('La respuesta de stock no contiene una lista valida.')
}

export async function getStock() {
  const response = await request(API_URL)
  return normalizeListResponse(response)
}

export async function getStockByProducto(idProducto) {
  const response = await request(`${API_URL}/producto/${idProducto}`)
  return normalizeListResponse(response)
}

export async function getStockByAlmacen(idAlmacen) {
  const response = await request(`${API_URL}/almacen/${idAlmacen}`)
  return normalizeListResponse(response)
}

export async function getLowStock() {
  const response = await request(`${API_URL}/stock-bajo`)
  return normalizeListResponse(response)
}
