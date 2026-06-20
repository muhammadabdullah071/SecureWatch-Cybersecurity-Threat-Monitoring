import api from '@/lib/axios'
import type { ThreatFeed } from '@/types'

export async function getThreatFeeds(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/threat-intel/feeds', { params })
}

export async function createThreatFeed(data: Partial<ThreatFeed>) {
  return api.post('/threat-intel/feeds', data)
}

export async function updateThreatFeed(id: string, data: Partial<ThreatFeed>) {
  return api.put(`/threat-intel/feeds/${id}`, data)
}

export async function deleteThreatFeed(id: string) {
  return api.delete(`/threat-intel/feeds/${id}`)
}

export async function getThreatIntelSummary() {
  return api.get('/threat-intel/summary')
}
