import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import * as incidentService from '@/services/incident.service'

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentService.getIncidentById(id!),
    enabled: !!id,
  })

  const incident = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Incident Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/incidents')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/incidents')} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{incident.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{incident.description}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={incident.priority} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Related Threat ID</p>
              <p className="text-sm text-slate-200">{incident.threatId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Notes</p>
              <p className="text-sm text-slate-200">{incident.notes || 'No notes'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm text-slate-200">{formatDate(incident.createdAt)}</p>
            </div>
            {incident.closedAt && (
              <div>
                <p className="text-xs text-slate-500">Closed</p>
                <p className="text-sm text-slate-200">{formatDate(incident.closedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
