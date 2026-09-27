import api from './api'

export async function exportApplications(format: 'csv' | 'xlsx') {
  const response = await api.get<Blob>('/applications/export', {
    params: { format },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `jobtrack-applications.${format}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
