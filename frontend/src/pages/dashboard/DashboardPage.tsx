import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Shield, AlertTriangle, Activity, CheckCircle, ShieldAlert,
  TrendingUp, RefreshCw, ExternalLink, ArrowRight,
} from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDashboardStats } from '@/services/analytics.service'
import { cn } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts'

const COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#22c55e']
const GRADIENT_COLORS = ['#7f1d1d', '#78350f', '#312e81', '#14532d']
const DARK_CHART_GRID = '#1e293b'
const LIGHT_CHART_GRID = '#e2e8f0'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current)
    const duration = 800
    const start = performance.now()
    const from = display
    const to = value

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(from + (to - from) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }

    ref.current = requestAnimationFrame(animate)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value])

  return <>{display}{suffix}</>
}

function LiveIndicator({ type = 'secure' }: { type?: 'secure' | 'critical' | 'success' | 'warning' }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <span className={`live-dot ${type}`} />
      LIVE
    </span>
  )
}

function CustomTooltip({ active, payload, label, dark }: { active?: boolean; payload?: any[]; label?: string; dark: boolean }) {
  if (!active || !payload?.length) return null
  return (
    <div className={`rounded-lg border ${dark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} shadow-xl p-3`}>
      <p className="text-xs font-medium mb-1 opacity-70">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then(r => r.data?.data),
  })

  const isDark = document.documentElement.classList.contains('dark')
  const chartGrid = isDark ? DARK_CHART_GRID : LIGHT_CHART_GRID

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  const statCards = [
    {
      icon: <ShieldAlert className="h-6 w-6 text-critical-500" />,
      label: 'Total Threats',
      value: stats?.totalThreats ?? 0,
      color: 'bg-critical-50 dark:bg-critical-900/20 border-critical-200 dark:border-critical-900/30',
      dotType: 'critical' as const,
      trend: { value: 12, isUp: true },
      onClick: () => navigate('/threats'),
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-warning-500" />,
      label: 'Active Incidents',
      value: stats?.activeIncidents ?? 0,
      color: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-900/30',
      dotType: 'warning' as const,
      trend: { value: 8, isUp: true },
      onClick: () => navigate('/incidents'),
    },
    {
      icon: <Activity className="h-6 w-6 text-secure-500" />,
      label: 'Critical Alerts',
      value: stats?.criticalAlerts ?? 0,
      color: 'bg-secure-50 dark:bg-secure-900/20 border-secure-200 dark:border-secure-900/30',
      dotType: 'secure' as const,
      onClick: () => navigate('/threats?severity=CRITICAL'),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-success-500" />,
      label: 'Resolved',
      value: stats?.resolvedThreats ?? 0,
      color: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-900/30',
      dotType: 'success' as const,
      trend: { value: 24, isUp: false },
      onClick: () => navigate('/threats?status=RESOLVED'),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Security Dashboard
            </h1>
            <LiveIndicator type={stats?.criticalAlerts > 0 ? 'critical' : 'success'} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time cybersecurity threat monitoring overview
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div key={i} className="animate-count-up">
            <StatCard
              icon={card.icon}
              label={card.label}
              value={<AnimatedCounter value={card.value} />}
              color={card.color}
              trend={card.trend}
              onClick={card.onClick}
              className="stat-glow border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            />
            <div className="flex items-center gap-2 mt-2 px-1">
              <span className={`live-dot ${card.dotType}`} />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                {card.dotType === 'secure'
                  ? 'Monitoring'
                  : `Alert: ${stats?.criticalAlerts ?? 0} active`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <TrendingUp className="h-4 w-4 text-secure-500" />
              Threat Trend
            </CardTitle>
            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              Last 30 days
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.threatTrend?.length ? stats.threatTrend : Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, count: 0 }))}>
                  <defs>
                    <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip dark={isDark} />} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#threatGradient)" />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Severity Distribution
            </CardTitle>
            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              All threats
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.severityDistribution?.length ? stats.severityDistribution : []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    dataKey="value"
                    paddingAngle={3}
                    cornerRadius={6}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(stats?.severityDistribution || []).map((entry: { name: string; value: number }, index: number) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                        stroke={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip dark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Top Attack Sources
            </CardTitle>
            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              By volume
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topAttackSources?.length ? stats.topAttackSources : []}
                  layout="vertical"
                  onClick={(data) => {
                    if (data?.activeLabel) {
                      navigate(`/threats?source=${encodeURIComponent(data.activeLabel)}`)
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="source"
                    type="category"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, cursor: 'pointer' }}
                    width={130}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip dark={isDark} />}
                    cursor={{ fill: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} cursor="pointer">
                    {(stats?.topAttackSources || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {stats?.topAttackSources?.length > 0 && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => navigate('/threats')}
                    className="text-xs text-secure-600 dark:text-secure-400 hover:underline inline-flex items-center gap-1"
                  >
                    View all threats <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="h-4 w-4 text-secure-500" />
              Recent Events
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                (stats?.recentEvents?.length || 0) > 0
                  ? 'border-success-300 dark:border-success-700 text-success-600 dark:text-success-400'
                  : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              )}
            >
              <span className={`live-dot ${(stats?.recentEvents?.length || 0) > 0 ? 'success' : 'secure'} mr-1.5`} />
              {(stats?.recentEvents?.length || 0) > 0 ? 'Active' : 'Idle'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {(!stats?.recentEvents || stats.recentEvents.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Shield className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No recent events</p>
                  <p className="text-xs mt-1">System is running normally</p>
                </div>
              ) : (
                stats.recentEvents.slice(0, 6).map((event: { id: string; title: string; type: string; severity: string; timestamp?: string }, i: number) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/threats/${event.id}`)}
                    className={cn(
                      'group flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 w-full text-left',
                      i === 0
                        ? 'border-critical-200 dark:border-critical-900/50 bg-critical-50/50 dark:bg-critical-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        i === 0 ? 'bg-critical-100 dark:bg-critical-900/40' : 'bg-slate-100 dark:bg-slate-800'
                      )}>
                        <ShieldAlert className={cn('h-4 w-4', i === 0 ? 'text-critical-500' : 'text-slate-400')} />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{event.type}</span>
                          {event.timestamp && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={event.severity} size="sm" />
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))
              )}
            </div>
            {stats?.recentEvents && stats.recentEvents.length > 0 && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => navigate('/threats')}
                  className="text-xs text-secure-600 dark:text-secure-400 hover:underline inline-flex items-center gap-1"
                >
                  View all events <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
