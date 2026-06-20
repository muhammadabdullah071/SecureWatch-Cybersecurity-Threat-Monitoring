import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ShieldAlert, Globe, Server, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import * as threatService from '@/services/threat.service'

export function ThreatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['threat', id],
    queryFn: () => threatService.getThreatById(id!),
    enabled: !!id,
  })

  const threat = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!threat) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Threat Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/threats')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Threats
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/threats')} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Threats
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{threat.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{threat.description}</p>
        </div>
        <StatusBadge status={threat.severity} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Source IP</p>
                <p className="text-sm font-mono text-slate-200">{threat.sourceIP}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Server className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Destination IP</p>
                <p className="text-sm font-mono text-slate-200">{threat.destinationIP}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Attack Type</p>
                <p className="text-sm text-slate-200">{threat.attackType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={threat.status} />
              <StatusBadge status={threat.severity} />
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Assigned To</p>
                <p className="text-sm text-slate-200">{threat.assignedAnalyst || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Detected</p>
                <p className="text-sm text-slate-200">{formatDate(threat.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
