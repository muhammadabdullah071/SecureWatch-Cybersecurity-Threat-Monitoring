import api from '@/lib/axios'
import type { DashboardStats } from '@/types'

export async function getDashboardStats() {
  return api.get('/analytics/dashboard')
}

export async function getThreatTrends(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/analytics/threat-trends', { params })
}

export async function getSeverityDistribution() {
  return api.get('/analytics/severity-distribution')
}

export async function getTopAttackSources() {
  return api.get('/analytics/top-attack-sources')
}
