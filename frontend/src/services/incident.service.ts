import api from '@/lib/axios'
import type { Incident } from '@/types'

export async function getIncidents(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/incidents', { params })
}

export async function getIncidentById(id: string): Promise<{ data: Incident }> {
  return api.get(`/incidents/${id}`)
}

export async function createIncident(data: Partial<Incident>) {
  return api.post('/incidents', data)
}

export async function updateIncident(id: string, data: Partial<Incident>) {
  return api.put(`/incidents/${id}`, data)
}

export async function deleteIncident(id: string) {
  return api.delete(`/incidents/${id}`)
}
