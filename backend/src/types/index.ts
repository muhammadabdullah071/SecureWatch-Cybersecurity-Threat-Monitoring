import { Request } from 'express';

export enum Role {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

// JWT
export interface JwtPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Auth Request
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Filters
export interface FilterParams {
  search?: string;
  severity?: string;
  status?: string;
  attackType?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

// Sort
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationResponse;
  errors?: unknown;
}

// Auth DTOs
export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tokens: AuthTokens;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

// Threat DTOs
export interface CreateThreatDTO {
  title: string;
  description: string;
  sourceIP: string;
  destinationIP?: string;
  attackType: string;
  severity?: string;
  status?: string;
  assignedToId?: string;
  assignedAnalyst?: string;
}

export interface UpdateThreatDTO {
  title?: string;
  description?: string;
  sourceIP?: string;
  destinationIP?: string;
  attackType?: string;
  severity?: string;
  status?: string;
  assignedToId?: string;
  assignedAnalyst?: string;
}

// Incident DTOs
export interface CreateIncidentDTO {
  title: string;
  description: string;
  priority?: string;
  status?: string;
  threatId?: string;
  assignedToId?: string;
  notes?: string;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  threatId?: string;
  assignedToId?: string;
  notes?: string;
}

// User DTOs
export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Notification DTOs
export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

// Audit DTOs
export interface CreateAuditLogDTO {
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

// Threat Feed DTOs
export interface CreateThreatFeedDTO {
  type: string;
  value: string;
  description?: string;
  riskScore?: number;
  source?: string;
}

// Socket Events
export const SOCKET_EVENTS = {
  NOTIFICATION: 'notification',
  THREAT_CREATED: 'threat:created',
  THREAT_UPDATED: 'threat:updated',
  INCIDENT_CREATED: 'incident:created',
  INCIDENT_UPDATED: 'incident:updated',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
} as const;

export interface SocketNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
