import { apiFetch } from './apiClient.js'
const API_URL = '/api/reportes'

export async function getReportes(filters = {}) {
  const params = new URLSearchParams()

  if (filters.fechaInicio) {
    params.set('fecha_inicio', filters.fechaInicio)
  }

  if (filters.fechaFin) {
    params.set('fecha_fin', filters.fechaFin)
  }

  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL
  let response

  try {
    response = await apiFetch(url)
  } catch (_error) {
    throw new Error('No se pudo conectar con la API de reportes.')
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de reportes devolvio una respuesta no valida.')
  })

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'No se pudo generar el reporte.')
  }

  return data.data
}
