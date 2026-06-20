import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'default'
}

const statusStyles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success'; label: string }> = {
  NEW: { variant: 'default', label: 'New' },
  INVESTIGATING: { variant: 'warning', label: 'Investigating' },
  MITIGATED: { variant: 'success', label: 'Mitigated' },
  RESOLVED: { variant: 'secondary', label: 'Resolved' },
  OPEN: { variant: 'destructive', label: 'Open' },
  CLOSED: { variant: 'secondary', label: 'Closed' },
  CRITICAL: { variant: 'destructive', label: 'Critical' },
  HIGH: { variant: 'warning', label: 'High' },
  MEDIUM: { variant: 'default', label: 'Medium' },
  LOW: { variant: 'success', label: 'Low' },
  ACTIVE: { variant: 'success', label: 'Active' },
  INACTIVE: { variant: 'secondary', label: 'Inactive' },
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const style = statusStyles[status] || { variant: 'secondary' as const, label: status }
  return (
    <Badge
      variant={style.variant}
      className={cn(
        size === 'sm' && 'px-1.5 py-0 text-[10px]',
        'font-medium capitalize'
      )}
    >
      {style.label}
    </Badge>
  )
}
