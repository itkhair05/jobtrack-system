import api from './api'
import type { AuthResponse, User } from './authService'

export interface ProfileUpdatePayload {
  email: string
  fullName: string
  currentPassword?: string
  newPassword?: string
}

export async function getProfile() {
  const { data } = await api.get<User>('/users/me')
  return data
}

export async function updateProfile(payload: ProfileUpdatePayload) {
  const { data } = await api.put<AuthResponse>('/users/profile', payload)
  return data
}
