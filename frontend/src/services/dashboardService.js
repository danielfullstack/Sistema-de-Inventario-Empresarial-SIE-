import { apiFetch } from './apiClient.js'
const API_URL = '/api/dashboard'

export async function getDashboardData() {
  let response

  try {
    response = await apiFetch(API_URL)
  } catch (_error) {
    throw new Error('No se pudo conectar con la API del dashboard.')
  }

  const data = await response.json().catch(() => {
    throw new Error('La API del dashboard devolvio una respuesta no valida.')
  })

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'No se pudo cargar el dashboard.')
  }

  return data.data
}
