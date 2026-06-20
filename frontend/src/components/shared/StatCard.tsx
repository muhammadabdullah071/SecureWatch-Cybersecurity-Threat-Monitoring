import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number | ReactNode
  trend?: { value: number; isUp: boolean }
  color?: string
  className?: string
  onClick?: () => void
}

export function StatCard({ icon, label, value, trend, color, className, onClick }: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-visible group',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl border',
            color || 'bg-secure-50 dark:bg-secure-600/20 border-secure-200 dark:border-secure-600/30'
          )}>
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border',
                trend.isUp
                  ? 'text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-900/30'
                  : 'text-critical-700 dark:text-critical-400 bg-critical-50 dark:bg-critical-900/20 border-critical-200 dark:border-critical-900/30'
              )}
            >
              {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
            {value}
          </p>
        </div>
        <div className={cn(
          'absolute -bottom-px left-4 right-4 h-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity',
          color ? color.replace(/border-\S+/g, '').replace(/bg-(\S+?)\/\d+/g, 'bg-$1/60').match(/bg-\S+?\/\d+/)?.[0]?.replace('/20', '/60') || 'bg-secure-500/60'
            : 'bg-secure-500/60'
        )} />
      </CardContent>
    </Card>
  )
}
