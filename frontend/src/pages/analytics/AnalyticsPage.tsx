import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, Activity, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import * as analyticsService from '@/services/analytics.service'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

export function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.getDashboardStats().then(r => r.data?.data),
  })

  const { data: rawTrends } = useQuery({
    queryKey: ['threat-trends'],
    queryFn: () => analyticsService.getThreatTrends({ days: 30 }).then(r => r.data?.data || r.data),
  })

  const trends = rawTrends || []

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Deep dive into security metrics and trends"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secure-400" /> Threat Trends (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.length > 0 ? trends : (stats?.threatTrend || [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-secure-400" /> Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.severityDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.severityDistribution || []).map((entry: { name: string; value: number }, index: number) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-secure-400" /> Top Attack Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topAttackSources || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="source" type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={140} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secure-400" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-80">
              <div className={cn(
                'h-40 w-40 rounded-full flex items-center justify-center border-4',
                stats?.systemHealth === 'healthy' ? 'border-success-500 bg-success-900/20' : 'border-warning-500 bg-warning-900/20'
              )}>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{(stats?.systemHealth === 'healthy' ? 100 : 85)}%</p>
                  <p className="text-sm text-slate-400 mt-1">Uptime</p>
                </div>
              </div>
              <p className={cn(
                'mt-4 text-lg font-semibold capitalize',
                stats?.systemHealth === 'healthy' ? 'text-success-400' : 'text-warning-400'
              )}>
                {stats?.systemHealth || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
