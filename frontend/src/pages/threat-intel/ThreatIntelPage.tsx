import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BrainCircuit, Trash2, Globe } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatRelativeTime } from '@/lib/utils'
import * as threatIntelService from '@/services/threat-intel.service'
import type { ThreatFeed } from '@/types'
import { useToast } from '@/components/ui/toast'

export function ThreatIntelPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: feedsData, isLoading } = useQuery({
    queryKey: ['threat-feeds'],
    queryFn: () => threatIntelService.getThreatFeeds(),
  })

  const { data: summaryData } = useQuery({
    queryKey: ['threat-intel-summary'],
    queryFn: () => threatIntelService.getThreatIntelSummary(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => threatIntelService.deleteThreatFeed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threat-feeds'] })
      toast({ title: 'Feed deleted', variant: 'success' })
      setDeleteId(null)
    },
  })

  const feeds: ThreatFeed[] = feedsData?.data?.data || feedsData?.data || []
  const summary = summaryData?.data

  const columns: Column<ThreatFeed>[] = [
    { key: 'type', header: 'Type', sortable: true, render: (f) => <Badge variant="outline">{f.type}</Badge> },
    { key: 'value', header: 'Value', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'riskScore',
      header: 'Risk Score',
      sortable: true,
      render: (f) => (
        <span className={`font-mono font-medium ${f.riskScore >= 70 ? 'text-critical-400' : f.riskScore >= 40 ? 'text-warning-400' : 'text-success-400'}`}>
          {f.riskScore}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (f) => <StatusBadge status={f.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    { key: 'source', header: 'Source' },
    {
      key: 'createdAt',
      header: 'Added',
      render: (f) => <span className="text-slate-400 text-sm">{formatRelativeTime(f.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (f) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)}>
            <Trash2 className="h-4 w-4 text-critical-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Threat Intelligence"
        description="External threat intelligence feeds and indicators"
        actions={
          <Button onClick={() => {
            toast({ title: 'Feature coming soon', description: 'Add feed UI is in development' })
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Feed
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{feeds.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success-400">{feeds.filter((f) => f.isActive).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-critical-400">{feeds.filter((f) => f.riskScore >= 70).length}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={feeds}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="Search indicators..."
        keyExtractor={(f) => f.id}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Feed"
        description="Are you sure you want to delete this threat feed?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
