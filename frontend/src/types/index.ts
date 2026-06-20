export enum Role {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ThreatStatus {
  NEW = 'NEW',
  INVESTIGATING = 'INVESTIGATING',
  MITIGATED = 'MITIGATED',
  RESOLVED = 'RESOLVED',
}

export enum IncidentPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  isActive: boolean
  lastLogin: string
  createdAt: string
}

export interface Threat {
  id: string
  title: string
  description: string
  sourceIP: string
  destinationIP: string
  attackType: string
  severity: Severity
  status: ThreatStatus
  assignedAnalyst: string | null
  assignedToId: string | null
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  title: string
  description: string
  priority: IncidentPriority
  status: IncidentStatus
  threatId: string | null
  assignedToId: string | null
  createdById: string
  notes: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  entity: string
  entityId: string
  details: string | null
  ipAddress: string
  createdAt: string
}

export interface ThreatFeed {
  id: string
  type: string
  value: string
  description: string
  riskScore: number
  isActive: boolean
  source: string
  createdAt: string
}

export interface DashboardStats {
  totalThreats: number
  activeIncidents: number
  criticalAlerts: number
  resolvedThreats: number
  threatTrend: { date: string; count: number }[]
  severityDistribution: { name: string; value: number; color: string }[]
  topAttackSources: { source: string; count: number }[]
  systemHealth: string
  recentEvents: {
    id: string
    type: string
    title: string
    severity: string
    timestamp: string
  }[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
}
