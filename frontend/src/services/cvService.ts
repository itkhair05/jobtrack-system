import api from './api'
import type { Cv } from './applicationService'

export async function getCvs() {
  const { data } = await api.get<Cv[]>('/cvs')
  return data
}

export async function deleteCv(id: number) {
  await api.delete(`/cvs/${id}`)
}

async function getCvBlob(id: number) {
  const { data } = await api.get<Blob>(`/cvs/${id}/download`, { responseType: 'blob' })
  return data
}

export async function downloadCv(id: number, fileName: string) {
  const blob = await getCvBlob(id)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function viewCv(id: number) {
  const previewWindow = window.open('about:blank', '_blank')
  try {
    const blob = await getCvBlob(id)
    const url = URL.createObjectURL(blob)
    if (previewWindow) previewWindow.location.href = url
    else URL.revokeObjectURL(url)
  } catch (error) {
    previewWindow?.close()
    throw error
  }
}
