import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types'
import * as authService from '@/services/auth.service'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function storeAuthData(response: { data: Record<string, unknown> }) {
  const d = response.data as Record<string, unknown>
  const body = (d.data as Record<string, unknown>) || d
  const tokens = (body.tokens as Record<string, unknown>) || body
  const user = (body.user as Record<string, unknown>) || body
  if (tokens.accessToken) {
    localStorage.setItem('accessToken', tokens.accessToken as string)
  }
  if (tokens.refreshToken) {
    localStorage.setItem('refreshToken', tokens.refreshToken as string)
  }
  if (user.id) {
    localStorage.setItem('user', JSON.stringify(user))
    return user as unknown as User
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    const u = storeAuthData(response)
    if (u) setUser(u)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data)
    const u = storeAuthData(response)
    if (u) setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await authService.updateProfile(data)
    const updatedUser = response.data?.data || response.data
    if (updatedUser && updatedUser.id) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
