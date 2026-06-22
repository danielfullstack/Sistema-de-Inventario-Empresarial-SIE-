import { apiFetch } from './apiClient.js'

const API_URL = '/api/kardex'

async function request(url) {
  let response

  try {
    response = await apiFetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (_error) {
    throw new Error('No se pudo conectar con la API de Kardex.')
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de Kardex devolvio una respuesta no valida.')
  })

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'No se pudo consultar el Kardex.')
  }

  return data
}

export async function getKardex(filters = {}) {
  const params = new URLSearchParams()

  if (filters.idProducto) {
    params.set('id_producto', filters.idProducto)
  }

  if (filters.idAlmacen) {
    params.set('id_almacen', filters.idAlmacen)
  }

  if (filters.fechaInicio) {
    params.set('fechaInicio', filters.fechaInicio)
  }

  if (filters.fechaFin) {
    params.set('fechaFin', filters.fechaFin)
  }

  const query = params.toString()
  return request(`${API_URL}${query ? `?${query}` : ''}`)
}

export async function getKardexByProducto(idProducto, filters = {}) {
  const params = new URLSearchParams()

  if (filters.idAlmacen) {
    params.set('id_almacen', filters.idAlmacen)
  }

  if (filters.fechaInicio) {
    params.set('fechaInicio', filters.fechaInicio)
  }

  if (filters.fechaFin) {
    params.set('fechaFin', filters.fechaFin)
  }

  const query = params.toString()
  return request(`${API_URL}/producto/${idProducto}${query ? `?${query}` : ''}`)
}
