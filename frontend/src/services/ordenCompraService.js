import { apiFetch } from './apiClient.js'
const API_URL = '/api/ordenes-compra'

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
    throw new Error('No se pudo conectar con la API de ordenes de compra.')
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de ordenes de compra devolvio una respuesta no valida.')
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

  throw new Error('La respuesta de ordenes de compra no contiene una lista valida.')
}

export async function getOrdenesCompra() {
  const response = await request(API_URL)
  return normalizeListResponse(response)
}

export async function getOrdenCompra(idOrden) {
  const response = await request(`${API_URL}/${idOrden}`)
  return response.data
}

export async function getOrdenesCompraByProveedor(idProveedor) {
  const response = await request(`${API_URL}/proveedor/${idProveedor}`)
  return normalizeListResponse(response)
}

export async function getOrdenesCompraByEstado(estado) {
  const response = await request(`${API_URL}/estado/${estado}`)
  return normalizeListResponse(response)
}

export async function createOrdenCompra(payload) {
  const response = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return response.data
}

export async function updateOrdenCompraEstado(idOrden, estado) {
  const response = await request(`${API_URL}/${idOrden}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado })
  })

  return response.data
}
