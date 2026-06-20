import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'text-critical-500 bg-critical-50 dark:bg-critical-950/30'
    case 'HIGH': return 'text-warning-500 bg-warning-50 dark:bg-warning-950/30'
    case 'MEDIUM': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
    case 'LOW': return 'text-success-500 bg-success-50 dark:bg-success-950/30'
    default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950/30'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'INVESTIGATING': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400'
    case 'MITIGATED': return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
    case 'RESOLVED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'OPEN': return 'bg-critical-100 text-critical-800 dark:bg-critical-900/30 dark:text-critical-400'
    case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}
