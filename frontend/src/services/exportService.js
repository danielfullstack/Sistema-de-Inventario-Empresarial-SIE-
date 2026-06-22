import { apiFetch } from './apiClient.js'

function getFilename(response, fallback) {
  const contentDisposition = response.headers.get('Content-Disposition') || ''
  const match = contentDisposition.match(/filename="?([^"]+)"?/)

  return match?.[1] || fallback
}

export async function downloadExport(moduleName, format, params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  const response = await apiFetch(`/api/export/${moduleName}/${format}${query ? `?${query}` : ''}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.message || 'No se pudo exportar la informacion.')
  }

  const blob = await response.blob()
  const extension = format === 'excel' ? 'xlsx' : 'pdf'
  const filename = getFilename(response, `${moduleName}.${extension}`)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
