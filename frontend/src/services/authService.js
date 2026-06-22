import { apiFetch } from './apiClient.js'

export async function login(credentials) {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo iniciar sesion.')
  }

  return data
}

export async function logout() {
  await apiFetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch(() => {})
}