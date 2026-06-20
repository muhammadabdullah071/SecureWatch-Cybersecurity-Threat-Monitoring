import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001'

let socket: Socket | null = null

export function connectSocket(): Socket {
  const token = localStorage.getItem('accessToken')

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message)
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function subscribeToEvent<T>(event: string, callback: (data: T) => void): void {
  if (socket) {
    socket.on(event, callback)
  }
}

export function unsubscribeFromEvent(event: string): void {
  if (socket) {
    socket.off(event)
  }
}

export function emitEvent<T>(event: string, data: T): void {
  if (socket) {
    socket.emit(event, data)
  }
}
