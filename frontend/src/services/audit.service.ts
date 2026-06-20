import api from '@/lib/axios'

export async function getAuditLogs(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/audit-logs', { params })
}

export async function getAuditLogById(id: string) {
  return api.get(`/audit-logs/${id}`)
}

export async function exportAuditLogs(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/audit-logs/export', { params, responseType: 'blob' })
}
