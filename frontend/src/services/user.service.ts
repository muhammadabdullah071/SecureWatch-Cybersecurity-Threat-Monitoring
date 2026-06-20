import api from '@/lib/axios'
import type { User } from '@/types'

export async function getUsers(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/users', { params })
}

export async function getUserById(id: string): Promise<{ data: User }> {
  return api.get(`/users/${id}`)
}

export async function createUser(data: Partial<User>) {
  return api.post('/users', data)
}

export async function updateUser(id: string, data: Partial<User>) {
  return api.put(`/users/${id}`, data)
}

export async function deleteUser(id: string) {
  return api.delete(`/users/${id}`)
}
