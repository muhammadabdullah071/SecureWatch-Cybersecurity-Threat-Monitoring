import api from '@/lib/axios'
import type { Threat } from '@/types'

export async function getThreats(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/threats', { params })
}

export async function getThreatById(id: string): Promise<{ data: Threat }> {
  return api.get(`/threats/${id}`)
}

export async function createThreat(data: Partial<Threat>) {
  return api.post('/threats', data)
}

export async function updateThreat(id: string, data: Partial<Threat>) {
  return api.put(`/threats/${id}`, data)
}

export async function deleteThreat(id: string) {
  return api.delete(`/threats/${id}`)
}

export async function getThreatStats() {
  return api.get('/threats/stats')
}
