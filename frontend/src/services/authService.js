export async function login(credentials) {
  const response = await fetch('/api/auth/login', {
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
  const token = localStorage.getItem('token')

  if (!token) {
    return
  }

  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }).catch(() => {})
}
