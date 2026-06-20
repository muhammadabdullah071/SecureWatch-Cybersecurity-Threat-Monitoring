import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { Notification } from '@/types'
import * as notificationService from '@/services/notification.service'
import { connectSocket, disconnectSocket, subscribeToEvent } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { isAuthenticated } = useAuth()
  const fetchedRef = useRef(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications()
      setNotifications(response.data.data || response.data)
    } catch {
      // silently fail
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      // silently fail
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !fetchedRef.current) {
      fetchedRef.current = true
      fetchNotifications()

      const socket = connectSocket()

      subscribeToEvent<Notification>('notification:new', (notification) => {
        setNotifications((prev) => [notification, ...prev])
      })

      return () => {
        disconnectSocket()
      }
    }
  }, [isAuthenticated, fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
