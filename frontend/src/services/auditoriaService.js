import { apiFetch } from './apiClient.js'

const API_URL = '/api/auditoria'

async function request(url) {
  let response

  try {
    response = await apiFetch(url)
  } catch (_error) {
    throw new Error('No se pudo conectar con la API de auditoria.')
  }

  const data = await response.json().catch(() => {
    throw new Error('La API de auditoria devolvio una respuesta no valida.')
  })

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'No se pudo completar la operacion.')
  }

  return data
}

function normalizeListResponse(response) {
  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data
  }

  throw new Error('La respuesta de auditoria no contiene una lista valida.')
}

export async function getAuditorias() {
  const response = await request(API_URL)
  return normalizeListResponse(response)
}

export async function getAuditoriasByUsuario(idUsuario) {
  const response = await request(`${API_URL}/usuario/${idUsuario}`)
  return normalizeListResponse(response)
}
