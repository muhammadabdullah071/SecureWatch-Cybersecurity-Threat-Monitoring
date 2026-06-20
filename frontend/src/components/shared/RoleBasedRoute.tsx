import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'
import type { Role } from '@/types'

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: Role[]
}

export function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
