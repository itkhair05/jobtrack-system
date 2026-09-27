import api from './api'

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED'

export interface Application {
  id: number
  companyId: number
  companyName: string
  website: string | null
  location: string | null
  cvId: number | null
  cvTitle: string | null
  jobTitle: string
  jobUrl: string | null
  salaryRange: string | null
  status: ApplicationStatus
  appliedDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ApplicationRequest {
  companyName: string
  website?: string
  location?: string
  cvId?: number | null
  jobTitle: string
  jobUrl?: string
  salaryRange?: string
  status?: ApplicationStatus
  appliedDate?: string
  notes?: string
}

export interface StatusUpdateRequest {
  status: ApplicationStatus
  note?: string
}

export interface ApplicationPage {
  content: Application[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface Cv {
  id: number
  title: string
  fileName: string
  downloadUrl: string
  createdAt: string
}

export interface ApplicationFilters {
  page?: number
  size?: number
  status?: ApplicationStatus | ''
  search?: string
}

export async function getApplications(filters: ApplicationFilters = {}) {
  const { data } = await api.get<ApplicationPage>('/applications', { params: filters })
  return data
}

export async function createApplication(payload: ApplicationRequest) {
  const { data } = await api.post<Application>('/applications', payload)
  return data
}

export async function updateApplication(id: number, payload: ApplicationRequest) {
  const { data } = await api.put<Application>(`/applications/${id}`, payload)
  return data
}

export async function updateStatus(id: number, payload: StatusUpdateRequest) {
  const { data } = await api.patch<Application>(`/applications/${id}/status`, payload)
  return data
}

export async function deleteApplication(id: number) {
  await api.delete(`/applications/${id}`)
}

export async function uploadCv(file: File, title?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (title?.trim()) formData.append('title', title.trim())
  const { data } = await api.post<Cv>('/cvs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
