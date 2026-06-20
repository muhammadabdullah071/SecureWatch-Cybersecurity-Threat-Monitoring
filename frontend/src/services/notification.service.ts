import api from '@/lib/axios'

export async function getNotifications(params?: Record<string, string | number | boolean | undefined>) {
  return api.get('/notifications', { params })
}

export async function markAsRead(id: string) {
  return api.patch(`/notifications/${id}/read`)
}

export async function markAllAsRead() {
  return api.patch('/notifications/read-all')
}

export async function deleteNotification(id: string) {
  return api.delete(`/notifications/${id}`)
}
