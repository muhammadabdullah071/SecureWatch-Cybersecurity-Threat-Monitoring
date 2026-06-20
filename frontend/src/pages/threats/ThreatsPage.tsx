import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ShieldAlert, Trash2, Eye, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatRelativeTime, cn } from '@/lib/utils'
import * as threatService from '@/services/threat.service'
import type { Threat } from '@/types'
import { useToast } from '@/components/ui/toast'

const severityFilters = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const
const statusFilters = ['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] as const

export function ThreatsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const severityParam = searchParams.get('severity') || ''
  const statusParam = searchParams.get('status') || ''
  const sourceParam = searchParams.get('source') || ''

  useEffect(() => {
    setPage(1)
  }, [severityParam, statusParam, sourceParam])

  const { data, isLoading } = useQuery({
    queryKey: ['threats', page, search, severityParam, statusParam, sourceParam],
    queryFn: () => threatService.getThreats({
      page,
      limit: 10,
      search: search || undefined,
      severity: severityParam || undefined,
      status: statusParam || undefined,
      sourceIP: sourceParam || undefined,
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => threatService.deleteThreat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] })
      toast({ title: 'Threat deleted', variant: 'success' })
      setDeleteId(null)
    },
    onError: () => {
      toast({ title: 'Failed to delete threat', variant: 'destructive' })
    },
  })

  const threats: Threat[] = data?.data?.data || data?.data || []
  const pagination = data?.data?.pagination

  const clearFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(key)
    setSearchParams(newParams, { replace: true })
  }

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (newParams.get(key) === value) {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams, { replace: true })
  }

  const columns: Column<Threat>[] = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'attackType', header: 'Attack Type', sortable: true },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (t) => <StatusBadge status={t.severity} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    { key: 'sourceIP', header: 'Source IP' },
    {
      key: 'createdAt',
      header: 'Detected',
      sortable: true,
      render: (t) => <span className="text-slate-400 text-sm">{formatRelativeTime(t.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/threats/${t.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}>
            <Trash2 className="h-4 w-4 text-critical-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Threats"
        description="Monitor and manage cybersecurity threats"
        actions={
          <Button onClick={() => navigate('/threats/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Threat
          </Button>
        }
      />

      {(severityParam || statusParam || sourceParam) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">Active filters:</span>
          {severityParam && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1 border-secure-300 dark:border-secure-700">
              Severity: {severityParam}
              <button onClick={() => clearFilter('severity')} className="ml-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusParam && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1 border-secure-300 dark:border-secure-700">
              Status: {statusParam}
              <button onClick={() => clearFilter('status')} className="ml-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {sourceParam && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1 border-secure-300 dark:border-secure-700">
              Source: {sourceParam}
              <button onClick={() => clearFilter('source')} className="ml-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={() => setSearchParams({}, { replace: true })}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-slate-500 font-medium mr-1">Quick filter:</span>
        {severityFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('severity', s)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-all',
              severityParam === s
                ? 'bg-secure-100 dark:bg-secure-600/20 border-secure-300 dark:border-secure-600 text-secure-700 dark:text-secure-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {s}
          </button>
        ))}
        <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', s)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-all',
              statusParam === s
                ? 'bg-secure-100 dark:bg-secure-600/20 border-secure-300 dark:border-secure-600 text-secure-700 dark:text-secure-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={threats}
        isLoading={isLoading}
        onRowClick={(t) => navigate(`/threats/${t.id}`)}
        page={page}
        totalPages={pagination?.totalPages || 1}
        onPageChange={setPage}
        searchPlaceholder="Search threats..."
        onSearch={(q) => { setSearch(q); setPage(1) }}
        keyExtractor={(t) => t.id}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Threat"
        description="Are you sure you want to delete this threat? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
