import api from '@/lib/axios'
import type { LoginCredentials, RegisterData, User } from '@/types'

export async function login(credentials: LoginCredentials) {
  return api.post('/auth/login', credentials)
}

export async function register(data: RegisterData) {
  return api.post('/auth/register', data)
}

export async function logout() {
  return api.post('/auth/logout')
}

export async function forgotPassword(email: string) {
  return api.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, password: string) {
  return api.post('/auth/reset-password', { token, password })
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  return api.post('/auth/change-password', data)
}

export async function getProfile(): Promise<{ data: User }> {
  return api.get('/auth/profile')
}

export async function updateProfile(data: Partial<User>) {
  return api.put('/auth/profile', data)
}
